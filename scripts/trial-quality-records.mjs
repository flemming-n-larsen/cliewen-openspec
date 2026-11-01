// Candidate record rules for design exploration, not installed product checks.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const hash = content => createHash('sha256').update(content).digest('hex');
const output = path.resolve('.tmp', `quality-records-${Date.now()}.json`);
const observations = [];
function check(name, value, expected) {
  observations.push({name, value, expected}); assert.deepEqual(value, expected, name);
}
function waiver(entry, obligation, fresh = true) {
  return fresh && entry.status === 'reviewed' && entry.reason.trim().length > 0 &&
    entry.policy === obligation.policy && entry.scenario === obligation.scenario &&
    entry.category === obligation.category;
}
function removal(entry) {
  if (entry.change === 'retired' && (!entry.retirement || entry.retirement.status !== 'accepted' || !entry.retirement.source)) return 'retirement-unaccepted';
  if (entry.tests.some(test => test.action === 'remove' && test.remainingScenarios.length)) return 'active-test-removal';
  if (entry.status !== 'reviewed') return 'lifecycle-unresolved';
  return 'complete';
}
function freshness(inputs, current) {
  return Object.entries(inputs).every(([file, digest]) => digest === null ? !Object.hasOwn(current, file) : Object.hasOwn(current, file) && hash(current[file]) === digest);
}
let status = 'completed', error;
try {
  const obligation = {policy: 'coverage', scenario: 'COUNT-001', category: 'negative'};
  const exception = {...obligation, status: 'reviewed', reason: 'This scenario observes an unconditional constant; invalid input is handled by COUNT-002.'};
  check('matching reviewed exception', waiver(exception, obligation), true);
  check('exception does not waive another category', waiver(exception, {...obligation, category: 'positive'}), false);
  check('exception does not waive another scenario', waiver(exception, {...obligation, scenario: 'COUNT-002'}), false);
  check('exception does not waive another policy', waiver(exception, {...obligation, policy: 'effectiveness', category: undefined}), false);
  check('proposed exception is not a waiver', waiver({...exception, status: 'proposed'}, obligation), false);
  check('blank reason is not a waiver', waiver({...exception, reason: '  '}, obligation), false);
  check('stale exception is not a waiver', waiver(exception, obligation, false), false);
  const executionFindings = ['test-failed', 'stale-evidence'];
  check('valid exception leaves execution failures intact', {waived: waiver(exception, obligation), findings: executionFindings}, {waived: true, findings: ['test-failed', 'stale-evidence']});

  const retired = {scenario: 'COUNT-002', change: 'retired', status: 'reviewed', retirement: {status: 'accepted', source: 'decisions/retire-limit.md'}, tests: [{action: 'remove', remainingScenarios: []}]};
  check('explicit full retirement', removal(retired), 'complete');
  check('missing retirement is unresolved', removal({...retired, retirement: undefined}), 'retirement-unaccepted');
  check('proposed retirement is unresolved', removal({...retired, retirement: {...retired.retirement, status: 'proposed'}}), 'retirement-unaccepted');
  check('shared test cannot be removed', removal({...retired, tests: [{action: 'remove', remainingScenarios: ['COUNT-001']}]}), 'active-test-removal');
  check('retaining active assertions is valid', removal({...retired, tests: [{action: 'retain', remainingScenarios: ['COUNT-001']}]}), 'complete');
  check('unreviewed disposition is incomplete', removal({...retired, status: 'proposed'}), 'lifecycle-unresolved');

  const files = {'count.mjs': 'export const count = 1;\n', 'test.mjs': 'assert.equal(count, 1);\n'};
  const inputs = Object.fromEntries(Object.entries(files).map(([file, content]) => [file, hash(content)]));
  check('unchanged input hashes remain fresh', freshness(inputs, files), true);
  check('source edit invalidates review', freshness(inputs, {...files, 'count.mjs': 'export const count = 2;\n'}), false);
  check('test edit invalidates review', freshness(inputs, {...files, 'test.mjs': 'assert.ok(count);\n'}), false);
  check('deleted inspected file invalidates review', freshness(inputs, {'count.mjs': files['count.mjs']}), false);
  check('declared deleted file stays absent', freshness({...inputs, 'obsolete.mjs': null}, files), true);
  check('restored deleted file invalidates review', freshness({...inputs, 'obsolete.mjs': null}, {...files, 'obsolete.mjs': ''}), false);
  check('review record has no self hash', freshness(inputs, {...files, 'review.yaml': 'updated explanation'}), true);
  check('undeclared helper change is not detected', freshness(inputs, {...files, 'helper.mjs': 'changed'}), true);

  const effectiveness = record => record.status === 'reviewed' && record.failureKind === 'behavior';
  check('reviewed behavior failure is admissible', effectiveness({status: 'reviewed', failureKind: 'behavior'}), true);
  check('setup failure is inadmissible', effectiveness({status: 'reviewed', failureKind: 'setup'}), false);
  check('unrelated failure is inadmissible', effectiveness({status: 'reviewed', failureKind: 'unrelated'}), false);
  check('unreviewed behavior failure is incomplete', effectiveness({status: 'proposed', failureKind: 'behavior'}), false);
} catch (caught) {
  status = 'failed'; error = caught.stack; process.exitCode = 1;
} finally {
  fs.mkdirSync(path.dirname(output), {recursive: true});
  fs.writeFileSync(output, JSON.stringify({status, error, node: process.version, platform: process.platform, observations}, null, 2) + '\n');
  console.log(JSON.stringify({status, checks: observations.length, output}));
}
