import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

const [location, filename = 'independent-checks.json', ...extra] = process.argv.slice(2);
if (!location || !path.isAbsolute(location) || extra.length || !/^[a-z0-9][a-z0-9.-]*\.json$/.test(filename)) throw Error('Use node scripts/check-guide-walkthrough.mjs ABSOLUTE_TRIAL_DIRECTORY [RESULT_NAME.json]');
const workspace = path.join(location, 'workspace');
const candidates = [];
function discover(directory, depth = 0) {
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    if (!entry.isDirectory() || entry.isSymbolicLink() || entry.name.startsWith('.') || ['node_modules', 'reference', 'cliewen-openspec'].includes(entry.name)) continue;
    const child = path.join(directory, entry.name);
    if (entry.name === 'cliewen-pilot') candidates.push(child);
    else if (depth < 2) discover(child, depth + 1);
  }
}
discover(workspace);
assert.equal(candidates.length, 1, 'Expected one cliewen-pilot directory within the workspace');
const pilot = candidates[0];
const output = path.join(location, 'artifacts', filename);
if (fs.existsSync(output)) throw Error('Preserve the previous independent result');
const observations = [];
function run(executable, args) {
  const env = {...process.env}; delete env.NODE_TEST_CONTEXT;
  const result = spawnSync(executable, args, {cwd: pilot, env, encoding: 'utf8', timeout: 60000, windowsHide: true});
  observations.push({executable, args, status: result.status, stdout: result.stdout, stderr: result.stderr});
  assert.equal(result.status, 0, `${executable}: ${result.stderr}\n${result.stdout}`); return result.stdout.trim();
}
let status = 'passed', error;
try {
  assert.ok(fs.existsSync(path.join(workspace, 'walkthrough-result.md')), 'Missing first-use report');
  const suppliedGuide = fs.readFileSync(path.join(workspace, 'reference/docs/guide/getting-started.md'), 'utf8');
  const expectedVersion = suppliedGuide.match(/cliewen-openspec-(\d+\.\d+\.\d+(?:-[\w.-]+)?)\.tgz/)?.[1];
  assert.ok(expectedVersion, 'Guide must identify the development tarball version');
  const installed = JSON.parse(fs.readFileSync(path.join(pilot, 'node_modules/cliewen-openspec/package.json'), 'utf8'));
  assert.equal(installed.version, expectedVersion, 'Walkthrough must use the documented development package');
  const cli = path.join(pilot, 'node_modules/cliewen-openspec/dist/cli.js');
  const report = JSON.parse(fs.readFileSync(path.join(pilot, '.cliewen-openspec/evidence.json'), 'utf8'));
  const revision = run('git', ['rev-parse', 'HEAD']);
  assert.equal(report.revision, revision); assert.equal(report.scope, undefined);
  assert.equal(report.results.length, 6); assert.ok(report.results.every(row => row.outcome === 'passed'));
  assert.equal(run('git', ['status', '--porcelain', '--untracked-files=all']), '');
  assert.equal(fs.existsSync(path.join(pilot, 'openspec/changes/add-csv-export')), false);
  const archives = fs.readdirSync(path.join(pilot, 'openspec/changes/archive')).filter(name => /^\d{4}-\d{2}-\d{2}-add-csv-export$/.test(name));
  assert.equal(archives.length, 1, 'Expected one dated archive');
  assert.ok(fs.existsSync(path.join(pilot, 'openspec/changes/archive', archives[0], 'tasks.md')));
  const permanent = fs.readFileSync(path.join(pilot, 'openspec/specs/csv-export/spec.md'), 'utf8');
  for (let number = 1; number <= 6; number++) assert.ok(permanent.includes(`[EXP-${String(number).padStart(3, '0')}]`));
  run(process.execPath, ['--test', 'test/export.test.mjs']);
  const check = JSON.parse(run(process.execPath, [cli, 'check', '--json'])); assert.equal(check.ok, true);
  const probe = 'import assert from "node:assert/strict"; import {exportCsv} from "./export.mjs"; assert.equal(exportCsv([{value:"a,b"}], ["value"]), ' + JSON.stringify('value\r\n"a,b"\r\n') + ');';
  run(process.execPath, ['--input-type=module', '-e', probe]);
  assert.equal(run('git', ['status', '--porcelain', '--untracked-files=all']), '');
} catch (caught) { status = 'failed'; error = caught.stack; process.exitCode = 1; }
fs.writeFileSync(output, JSON.stringify({status, error, pilot, observations}, null, 2) + '\n');
console.log(JSON.stringify({status, output}));
