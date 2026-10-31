import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {parse} from 'yaml';

const [project, artifacts, ...extra] = process.argv.slice(2);
if (!project || !artifacts || extra.length) throw Error('Use node scripts/check-csv-all-review.mjs PROJECT ARTIFACTS');
const root = path.resolve(project);
const output = path.join(path.resolve(artifacts), 'review-stage-checks.json');
if (fs.existsSync(output)) throw Error(`Refusing to replace an earlier evaluation: ${output}`);
const baseline = JSON.parse(fs.readFileSync(path.join(artifacts, 'baseline.json'), 'utf8'));
const checks = [];
function run(label, exe, args, expectedExitCode = 0) {
  const r = spawnSync(exe, args, {cwd: root, encoding: 'utf8', timeout: 30000, env: {...process.env, OPENSPEC_TELEMETRY: '0', CI: '1'}});
  checks.push({label, exe, args, expectedExitCode, exitCode: r.status, stdout: r.stdout, stderr: r.stderr}); return r;
}
const revision = run('revision', 'git', ['rev-parse', 'HEAD']).stdout.trim();
const status = run('working tree', 'git', ['status', '--porcelain', '--untracked-files=all']).stdout;
checks.push({label: 'clean recorded result', passed: status === ''});
run('all baseline tracked inputs unchanged', 'git', ['diff', '--exit-code', baseline.baseline, '--', ...Object.keys(parseBaselineFiles())]);
function parseBaselineFiles() {
  const r = run('baseline file list', 'git', ['ls-tree', '-r', '--name-only', baseline.baseline]);
  return Object.fromEntries(r.stdout.trim().split(/\r?\n/).filter(Boolean).map(file => [file, true]));
}
run('six original tests', process.execPath, ['--test', 'test/export.test.mjs']);
run('combined schema validity', process.execPath, ['node_modules/@fission-ai/openspec/bin/openspec.js', 'schema', 'validate', 'cliewen-all']);
const file = path.join(root, 'openspec/changes/add-optional-csv-bom/decision.md');
const match = fs.readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
const decision = match ? parse(match[1]) : {};
checks.push({label: 'decision is a proposed delivery recommendation', passed: decision.type === 'decision' && decision.status === 'proposed' && decision.outcome === 'delivery'});
const health = run('delivery is blocked before agreement', process.execPath, ['node_modules/cliewen-openspec/dist/cli.js', 'check', '--change', 'add-optional-csv-bom', '--json'], 1);
try {
  const h = JSON.parse(health.stdout);
  const errors = h.findings.filter(f => f.severity === 'error');
  checks.push({label: 'only expected approval finding', passed: h.ok === false && errors.length === 1 && errors[0].code === 'all-decision-unaccepted'});
} catch { checks.push({label: 'only expected approval finding', passed: false}); }
for (const name of ['proposal', 'investigation', 'decision']) {
  let passed = false;
  try { const saved = JSON.parse(fs.readFileSync(path.join(root, 'docs/testing/instructions', `${name}.json`), 'utf8')); passed = saved.schemaName === 'cliewen-all' && typeof saved.instruction === 'string'; }
  catch { /* Missing saved instructions are not a pass. */ }
  checks.push({label: `saved ${name} instructions`, passed});
}
checks.push({label: 'no duplicate design document', passed: !fs.existsSync(path.join(root, 'openspec/changes/add-optional-csv-bom/design.md'))});
const passed = checks.every(c => c.passed !== false && (c.exitCode === undefined || c.exitCode === c.expectedExitCode));
fs.writeFileSync(output, JSON.stringify({phase: 'human-review-boundary', passed, endToEndDelivery: 'incomplete', revision, baseline: baseline.baseline, checks}, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify({passed, endToEndDelivery: 'incomplete', revision, output}, null, 2));
process.exitCode = passed ? 0 : 1;
