import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {hasInstruction} from './lib/trial-instructions.mjs';

const [project, artifacts, schema = 'cliewen-delivery', ...extra] = process.argv.slice(2);
if (!project || !artifacts || extra.length || !['cliewen-delivery', 'cliewen-all'].includes(schema)) throw Error('Use node scripts/check-csv-bom-trial.mjs PROJECT ARTIFACTS [cliewen-delivery|cliewen-all]');
const root = path.resolve(project);
const output = path.join(path.resolve(artifacts), 'independent-checks.json');
if (fs.existsSync(output)) throw Error(`Refusing to replace an earlier evaluation: ${output}`);
const baseline = JSON.parse(fs.readFileSync(path.join(artifacts, 'baseline.json'), 'utf8'));
const checks = [];
function run(label, executable, args) {
  const r = spawnSync(executable, args, {cwd: root, encoding: 'utf8', timeout: 120000, env: {...process.env, OPENSPEC_TELEMETRY: '0', CI: '1'}});
  checks.push({label, executable, args, exitCode: r.status, stdout: r.stdout, stderr: r.stderr, error: r.error?.message});
  return r;
}
const git = (...args) => run(`git ${args.join(' ')}`, 'git', args);
const revision = git('rev-parse', 'HEAD').stdout?.trim();
const status = git('status', '--porcelain', '--untracked-files=all');
checks.push({label: 'clean input revision', passed: status.status === 0 && status.stdout === ''});
const normalize = text => text.replaceAll('\r\n', '\n');
for (const file of ['test/export.test.mjs', 'openspec/specs/csv-export/spec.md']) {
  const original = git('show', `${baseline.baseline}:${file}`);
  const current = fs.readFileSync(path.join(root, file), 'utf8');
  checks.push({label: `baseline preserved: ${file}`, passed: original.status === 0 && normalize(current).startsWith(normalize(original.stdout))});
}
run('all project tests', process.execPath, ['--test']);
run('strict change validation', process.execPath, ['node_modules/@fission-ai/openspec/bin/openspec.js', 'validate', 'add-optional-csv-bom', '--type', 'change', '--strict']);
const evidence = run('active change evidence', process.execPath, ['node_modules/cliewen-openspec/dist/cli.js', 'check', '--change', 'add-optional-csv-bom', '--json']);
try { checks.push({label: 'evidence check reports success', passed: evidence.status === 0 && JSON.parse(evidence.stdout).ok === true}); }
catch { checks.push({label: 'evidence check reports success', passed: false}); }

// This scenario's observed API uses a third options object with a boolean bom field.
// Review a different API before adapting the checker; the prompt does not prescribe a signature.
const acceptance = `
import assert from 'node:assert/strict';
import {exportCsv} from ${JSON.stringify(pathToFileURL(path.join(root, 'export.mjs')).href)};
const rows = [{name: 'Søren, "Åse"', note: 'one\\r\\ntwo'}, {name: '東京', note: ''}];
const columns = ['name', 'note'];
const payload = 'name,note\\r\\n"Søren, ""Åse""","one\\r\\ntwo"\\r\\n東京,\\r\\n';
for (const options of [undefined, {}, {bom: false}]) assert.equal(exportCsv(rows, columns, options), payload);
assert.equal(exportCsv(rows, columns, {bom: true}), '\\uFEFF' + payload);
assert.deepEqual(Buffer.from(exportCsv(rows, columns, {bom: true}), 'utf8'), Buffer.concat([Buffer.from([239,187,191]), Buffer.from(payload, 'utf8')]));
assert.equal(exportCsv([], ['a,b', 'c"d'], {bom: true}), '\\uFEFF"a,b","c""d"\\r\\n');
assert.equal(exportCsv([], ['a,b', 'c"d']), '"a,b","c""d"\\r\\n');
console.log('Independent opt-in, default, empty-input, escaping, CRLF, Unicode, and UTF-8 byte assertions passed.');
`;
run('independent behavior assertions', process.execPath, ['--input-type=module', '-e', acceptance]);
const instructions = schema === 'cliewen-all' ? ['proposal', 'investigation', 'decision', 'specs', 'tasks', 'apply'] : ['proposal', 'specs', 'design', 'tasks', 'apply'];
for (const name of instructions) {
  const passed = hasInstruction(root, name, schema, 'add-optional-csv-bom');
  checks.push({label: `saved ${name} instructions`, passed});
}
const passed = checks.every(c => c.passed !== false && (c.exitCode === undefined || c.exitCode === 0));
fs.writeFileSync(output, JSON.stringify({evaluatedAt: new Date().toISOString(), revision, baseline: baseline.baseline, passed, checks}, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify({passed, revision, output}, null, 2));
process.exitCode = passed ? 0 : 1;
