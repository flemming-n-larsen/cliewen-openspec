import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {parse} from 'yaml';
import {hasInstruction} from './lib/trial-instructions.mjs';

const [project, artifacts, ...extra] = process.argv.slice(2);
if (!project || !artifacts || extra.length) throw Error('Use node scripts/check-csv-discovery-trial.mjs PROJECT ARTIFACTS');
const root = path.resolve(project);
const output = path.join(path.resolve(artifacts), 'independent-checks.json');
if (fs.existsSync(output)) throw Error(`Refusing to replace an earlier evaluation: ${output}`);
const baseline = JSON.parse(fs.readFileSync(path.join(artifacts, 'baseline.json'), 'utf8'));
const checks = [];
function run(label, exe, args) {
  const r = spawnSync(exe, args, {cwd: root, encoding: 'utf8', timeout: 30000, env: {...process.env, OPENSPEC_TELEMETRY: '0', CI: '1'}});
  checks.push({label, exe, args, exitCode: r.status, stdout: r.stdout, stderr: r.stderr, error: r.error?.message});
  return r;
}
const git = (...args) => run(`git ${args.join(' ')}`, 'git', args);
const revision = git('rev-parse', 'HEAD').stdout?.trim();
const status = git('status', '--porcelain', '--untracked-files=all').stdout;
const diff = git('diff', '--name-only', baseline.baseline, '--').stdout ?? '';
const untracked = git('ls-files', '--others', '--exclude-standard').stdout ?? '';
const allowed = file => file.startsWith('openspec/changes/investigate-csv-streaming/') || file.startsWith('docs/') || file === '.gitignore';
checks.push({label: 'changes limited to investigation and documentation', passed: [diff, untracked].join('\n').split(/\r?\n/).filter(Boolean).every(allowed)});
run('baseline product inputs preserved', 'git', ['diff', '--exit-code', baseline.baseline, '--', 'export.mjs', 'test', 'openspec/specs', '.cliewen-openspec', 'package.json', 'package-lock.json']);
run('existing tests', process.execPath, ['--test', 'test/export.test.mjs']);
run('installed discovery schema valid', process.execPath, ['node_modules/@fission-ai/openspec/bin/openspec.js', 'schema', 'validate', 'cliewen-discovery']);
const artifactStatus = run('artifact status', process.execPath, ['node_modules/@fission-ai/openspec/bin/openspec.js', 'status', '--change', 'investigate-csv-streaming', '--json']);
try { const s = JSON.parse(artifactStatus.stdout); checks.push({label: 'discovery artifacts complete', passed: s.isComplete === true && s.schemaName === 'cliewen-discovery'}); }
catch { checks.push({label: 'discovery artifacts complete', passed: false}); }
const health = run('Cliewen health', process.execPath, ['node_modules/cliewen-openspec/dist/cli.js', 'check', '--change', 'investigate-csv-streaming', '--json']);
try { const h = JSON.parse(health.stdout); checks.push({label: 'health explicitly requires discovery review', passed: h.ok === true && h.findings.some(f => f.code === 'discovery-review-required') && !h.findings.some(f => f.code === 'sufficiency-not-assessed')}); }
catch { checks.push({label: 'health explicitly requires discovery review', passed: false}); }
for (const name of ['proposal', 'investigation', 'decision', 'apply']) {
  const passed = hasInstruction(root, name, 'cliewen-discovery', 'investigate-csv-streaming');
  checks.push({label: `saved ${name} instructions`, passed});
}
let proposed = false;
try { const decision = fs.readFileSync(path.join(root, 'openspec/changes/investigate-csv-streaming/decision.md'), 'utf8'); const frontmatter = decision.match(/^---\r?\n([\s\S]*?)\r?\n---/); proposed = !!frontmatter && parse(frontmatter[1]).status === 'proposed'; }
catch { /* Missing or malformed metadata fails this check. */ }
checks.push({label: 'decision remains proposed', passed: proposed});
const changeDir = path.join(root, 'openspec/changes');
const changes = fs.readdirSync(changeDir, {withFileTypes: true}).filter(e => e.isDirectory() && e.name !== 'archive').map(e => e.name);
checks.push({label: 'only the active investigation exists', passed: changes.length === 1 && changes[0] === 'investigate-csv-streaming'});
const archive = path.join(changeDir, 'archive');
checks.push({label: 'no archived change exists', passed: !fs.existsSync(archive) || fs.readdirSync(archive).every(name => name === '.gitkeep')});
const passed = checks.every(c => c.passed !== false && (c.exitCode === undefined || c.exitCode === 0));
fs.writeFileSync(output, JSON.stringify({evaluatedAt: new Date().toISOString(), revision, baseline: baseline.baseline, workingTreeStatus: status, passed, checks, manualReviewRequired: ['evidence quality', 'reasoning', 'experiment limits and interpretation', 'prose and diagrams', 'inherited context']}, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify({passed, revision, output}, null, 2));
process.exitCode = passed ? 0 : 1;
