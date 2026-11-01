// Maintainer experiment: candidate policies below are not product validators.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';

const digest = text => createHash('sha256').update(text).digest('hex');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cliewen-quality-'));
const output = path.resolve('.tmp', `test-quality-${Date.now()}.json`);
const result = {kind: 'maintainer-design-trial', node: process.version, platform: process.platform, root, output, executions: [], policyChecks: []};
const original = `export function count(value) {
  if (typeof value !== 'string' || !/^[0-9]+$/.test(value) || Number(value) < 1 || Number(value) > 99) throw new Error('invalid count');
  return Number(value);
}\n`;
const loose = original.replace("!/^[0-9]+$/.test(value)", 'false').replace('return Number(value)', 'return parseInt(value, 10)');
const zeroAllowed = original.replace('Number(value) < 1', 'Number(value) < 0');
const noUpperBound = original.replace('Number(value) > 99', 'false');
const makeTest = (name, body) => `import {test} from 'node:test';\nimport assert from 'node:assert/strict';\nimport {count} from './count.mjs';\ntest(${JSON.stringify(name)}, () => { ${body} });\n`;
function run(name, source, tests, expected) {
  fs.writeFileSync(path.join(root, 'count.mjs'), source);
  fs.writeFileSync(path.join(root, 'count.test.mjs'), tests);
  try {
    const run = spawnSync(process.execPath, ['--test', '--test-reporter=tap', 'count.test.mjs'], {cwd: root, encoding: 'utf8', timeout: 30000});
    if (run.error) throw run.error;
    result.executions.push({name, source, tests, sourceHash: digest(source), testHash: digest(tests), command: [process.execPath, '--test', '--test-reporter=tap', 'count.test.mjs'], exitCode: run.status, stdout: run.stdout, stderr: run.stderr});
    assert.equal(run.status, expected, `${name}: unexpected test outcome`);
  } finally {
    fs.writeFileSync(path.join(root, 'count.mjs'), original);
    assert.equal(digest(fs.readFileSync(path.join(root, 'count.mjs'), 'utf8')), digest(original));
  }
}
const positive = makeTest('parses one', "assert.equal(count('1'), 1)");
const negative = makeTest('rejects trailing characters', "assert.throws(() => count('1x'), /invalid count/)");
const weak = makeTest('returns a number', "assert.equal(typeof count('1'), 'number')");
const wrongValue = original.replace('return Number(value)', 'return 7');
const oldZero = makeTest('rejects zero', "assert.throws(() => count('0'), /invalid count/)");
const newZero = makeTest('accepts zero', "assert.equal(count('0'), 0)");
const positiveHundred = makeTest('parses one hundred', "assert.equal(count('100'), 100)");
const shared = makeTest('parses valid and rejects malformed', "assert.equal(count('1'), 1); assert.throws(() => count('1x'), /invalid count/)");
const upper = makeTest('rejects above limit', "assert.throws(() => count('100'), /invalid count/)");

// A deliberately small candidate evaluator, independent of the shipped CLI.
function coverage(records, minima) {
  const identities = new Set();
  const counts = {positive: 0, negative: 0, boundary: 0};
  for (const record of records) {
    if (identities.has(record.caseId)) return {error: 'duplicate-case'};
    identities.add(record.caseId);
    if (record.outcome === 'passed' && record.fresh && record.typeMatches) counts[record.category]++;
  }
  return {missing: Object.keys(minima).filter(category => counts[category] < minima[category])};
}
function policy(mode, complete, evidence = true) {
  if (mode === 'enforce' && !evidence) return 'configuration-error';
  if (mode === 'off') return 'off';
  if (!evidence) return 'unavailable';
  return complete ? 'complete' : mode === 'enforce' ? 'error' : 'warning';
}
function check(name, actual, expected) {
  result.policyChecks.push({name, actual, expected});
  assert.deepEqual(actual, expected, name);
}
try {
  run('positive-only baseline', original, positive, 0);
  run('positive-only misses malformed-input defect', loose, positive, 0);
  run('negative control passes', original, negative, 0);
  run('negative test catches malformed-input defect', loose, negative, 1);
  run('weak assertion baseline', original, weak, 0);
  run('weak assertion misses wrong result', wrongValue, weak, 0);
  run('exact assertion catches wrong result', wrongValue, positive, 1);
  run('unrelated import failure', original, "import './missing-dependency.mjs';\n", 1);
  run('old behavior baseline', original, oldZero, 0);
  run('old assertion fails changed behavior', zeroAllowed, oldZero, 1);
  run('updated assertion accepts changed behavior', zeroAllowed, newZero, 0);
  run('updated assertion detects old behavior', original, newZero, 1);
  run('upper-limit baseline', original, upper, 0);
  run('obsolete assertion fails retired upper limit', noUpperBound, upper, 1);
  run('retained shared test passes after retirement', noUpperBound, shared, 0);
  run('newly allowed input passes after retirement', noUpperBound, positiveHundred, 0);
  run('retained shared test catches active defect', loose, shared, 1);
  run('refactoring retains behavior assertions', original.replace('return Number(value)', 'const parsed = Number(value); return parsed'), positive + negative.replace(/^import.*\n/gm, ''), 0);

  const passed = {caseId: 'ordinary', category: 'positive', outcome: 'passed', fresh: true, typeMatches: true};
  const minima = {positive: 1, negative: 1, boundary: 0};
  check('missing negative', coverage([passed], minima), {missing: ['negative']});
  check('distinct positive cases', coverage([passed, {...passed, caseId: 'another'}], {positive: 2}), {missing: []});
  check('duplicate is invalid even with different category', coverage([passed, {...passed, category: 'negative'}], minima), {error: 'duplicate-case'});
  for (const outcome of ['skipped', 'pending', 'manual', 'failed']) check(`${outcome} does not count`, coverage([{...passed, outcome}], {positive: 1}), {missing: ['positive']});
  check('stale does not count', coverage([{...passed, fresh: false}], {positive: 1}), {missing: ['positive']});
  check('wrong type does not count', coverage([{...passed, typeMatches: false}], {positive: 1}), {missing: ['positive']});
  for (const mode of ['off', 'review', 'enforce']) {
    check(`${mode} complete`, policy(mode, true), mode === 'off' ? 'off' : 'complete');
    check(`${mode} incomplete`, policy(mode, false), {off: 'off', review: 'warning', enforce: 'error'}[mode]);
    check(`${mode} without evidence`, policy(mode, false, false), {off: 'off', review: 'unavailable', enforce: 'configuration-error'}[mode]);
  }
  check('independent policies', ['off', 'review', 'enforce'].map(mode => policy(mode, false)), ['off', 'warning', 'error']);
  check('old report missing category warns', policy('review', false), 'warning');
  check('old report with policies off remains usable', policy('off', false), 'off');
  result.status = 'completed';
} catch (error) {
  result.status = 'failed'; result.error = error.stack; process.exitCode = 1;
} finally {
  result.restored = fs.readFileSync(path.join(root, 'count.mjs'), 'utf8') === original;
  fs.mkdirSync(path.dirname(output), {recursive: true});
  fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({status: result.status, executions: result.executions.length, policyChecks: result.policyChecks.length, restored: result.restored, output}));
}
