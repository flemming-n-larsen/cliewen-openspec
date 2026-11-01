import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {stringify} from 'yaml';
import {init, check} from '../dist/core.js';

const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
function fixture(t, method = 'tdd') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cliewen-tdd-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const write = (file, text) => { fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true}); fs.writeFileSync(path.join(root, file), text); };
  write('openspec/config.yaml', 'schema: cliewen-delivery\n');
  fs.mkdirSync(path.join(root, 'openspec/specs'), {recursive: true});
  fs.mkdirSync(path.join(root, 'openspec/changes/add-value'), {recursive: true});
  init(root, false, false);
  write('.cliewen-openspec/config.yaml', 'testing:\n  approach: tdd\nfeatures:\n  evidence: false\n');
  write('value.mjs', 'export const value = 0;\n');
  const command = [process.execPath, '--test', 'test/value.test.mjs'];
  const definition = {method, command, tests: ['test/value.test.mjs'], implementation: ['value.mjs'], ...(method === 'tdd' ? {} : {reason: 'Verify existing behavior before changing it.'})};
  const tasks = (done = false) => write('openspec/changes/add-value/tasks.md', '# Tasks\n\n- [' + (done ? 'x' : ' ') + '] 1.1 Return one and verify the exported value.\n\n```yaml cliewen-tasks\n' + stringify({version: 1, tasks: {'1.1': definition}}) + '```\n');
  tasks();
  const run = (args, expected = 0) => {
    const env = {...process.env}; delete env.NODE_TEST_CONTEXT;
    const result = spawnSync(process.execPath, [cli, ...args, '--root', root], {encoding: 'utf8', env});
    assert.equal(result.status, expected, `${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
    return result;
  };
  const start = () => run(['tdd', 'start', '--change', 'add-value', '--task', '1.1']);
  const phase = (name, expected = 0) => {
    // Root must precede --; command arguments are forwarded unchanged.
    const env = {...process.env}; delete env.NODE_TEST_CONTEXT;
    const args = [cli, 'tdd', 'run', '--root', root, '--change', 'add-value', '--task', '1.1', '--phase', name, ...(name === 'red' ? ['--reason', 'The exported value is still zero.'] : []), '--', ...command];
    const result = spawnSync(process.execPath, args, {encoding: 'utf8', env});
    assert.equal(result.status, expected, `${name}\n${result.stdout}\n${result.stderr}`);
    return result;
  };
  const testValue = value => write('test/value.test.mjs', `import {test} from 'node:test';\nimport assert from 'node:assert/strict';\nimport {value} from '../value.mjs';\ntest('returns expected value', () => assert.equal(value, ${value}));\n`);
  const codes = () => check(root, 'add-value').filter(f => f.severity === 'error').map(f => f.code);
  return {root, write, tasks, run, start, phase, testValue, codes, definition};
}

test('TDD completion requires captured history even when product evidence is disabled', t => {
  const f = fixture(t); f.tasks(true);
  assert.ok(f.codes().includes('tdd-history-missing'));
  const result = f.run(['check', '--change', 'add-value', '--json'], 1);
  assert.equal(JSON.parse(result.stdout).ok, false);
  f.write('.cliewen-openspec/config.yaml', 'features:\n  evidence: false\n');
  assert.deepEqual(f.codes(), []);
});

test('real test-first cycle passes and stale tests, production, or task metadata fail', t => {
  const f = fixture(t); f.start(); f.testValue(1); f.phase('red', 1);
  f.write('value.mjs', 'export const value = 1;\n'); f.phase('green');
  assert.ok(f.codes().includes('tdd-task-incomplete'));
  f.tasks(true); assert.deepEqual(f.codes(), []);
  f.write('value.mjs', 'export const value = 2;\n');
  assert.ok(f.codes().includes('tdd-history-stale'));
  f.write('value.mjs', 'export const value = 1;\n'); f.testValue(2);
  assert.ok(f.codes().includes('tdd-history-stale'));
  f.testValue(1); f.definition.command.push('--help'); f.tasks(true);
  assert.ok(f.codes().includes('tdd-history-stale'));
});

test('implementation before the failing test cannot pass the TDD gate', t => {
  const f = fixture(t); f.start();
  f.write('value.mjs', 'export const value = 1;\n'); f.testValue(2); f.phase('red', 1);
  f.testValue(1); f.phase('green'); f.tasks(true);
  assert.ok(f.codes().includes('tdd-sequence-invalid'));
});

test('passing red runs and green runs with modified tests fail completion', t => {
  const f = fixture(t); f.start(); f.testValue(0); f.phase('red'); f.phase('green'); f.tasks(true);
  assert.ok(f.codes().includes('tdd-sequence-invalid'));
  f.start(); f.testValue(1); f.phase('red', 1); f.testValue(0); f.phase('green');
  assert.ok(f.codes().includes('tdd-sequence-invalid'));
});

test('characterization and refactoring require passing before/after runs; verification needs a reason', t => {
  for (const method of ['characterization', 'refactor', 'verification']) {
    const f = fixture(t, method);
    if (method === 'refactor') f.testValue(0);
    f.start(); f.testValue(0);
    if (method !== 'verification') f.phase('baseline');
    f.phase(method === 'verification' ? 'verify' : 'green'); f.tasks(true);
    assert.deepEqual(f.codes(), [], method);
    delete f.definition.reason; f.tasks(true);
    assert.ok(f.codes().includes('tdd-task-metadata-invalid'));
  }
});

test('TDD metadata rejects missing tasks, duplicate IDs, unsafe files and truncated history', t => {
  const f = fixture(t);
  f.write('openspec/changes/add-value/tasks.md', '# Tasks\n- [x] 1.1 Implement.\n');
  assert.ok(f.codes().includes('tdd-task-metadata-invalid'));
  f.tasks(true); f.definition.tests = ['../outside']; f.tasks(true);
  assert.ok(f.codes().includes('tdd-task-metadata-invalid'));
  f.definition.tests = ['test/value.test.mjs']; f.tasks(true);
  fs.appendFileSync(path.join(f.root, 'openspec/changes/add-value/tasks.md'), '- [x] 1.1 Duplicate.\n');
  assert.ok(f.codes().includes('tdd-task-metadata-invalid'));
  f.tasks(true); f.start();
  fs.appendFileSync(path.join(f.root, '.cliewen-openspec/tdd/add-value.jsonl'), '{truncated');
  assert.ok(f.codes().includes('tdd-history-invalid'));
});

test('TDD requires an explicit change and does not assess discovery or no-delivery work', t => {
  const f = fixture(t);
  assert.ok(check(f.root).some(f => f.code === 'tdd-change-required'));
  f.write('openspec/changes/add-value/.openspec.yaml', 'schema: cliewen-discovery\n');
  assert.deepEqual(f.codes(), []);
  f.write('openspec/changes/add-value/.openspec.yaml', 'schema: cliewen-all\nskip_specs: true\n');
  f.write('openspec/changes/add-value/decision.md', '---\ntype: decision\nstatus: proposed\noutcome: no-change\n---\n# Keep current behavior\n');
  assert.deepEqual(f.codes(), []);
});

test('successive tasks can change the same production file without invalidating earlier work', t => {
  const f = fixture(t);
  const second = {...f.definition, tests: ['test/second.test.mjs']};
  const plan = () => f.write('openspec/changes/add-value/tasks.md', '# Tasks\n- [x] 1.1 Return one and verify the exported value.\n- [x] 1.2 Return two and verify the new value.\n\n```yaml cliewen-tasks\n' + stringify({version: 1, tasks: {'1.1': f.definition, '1.2': second}}) + '```\n');
  f.start(); f.testValue(1); f.phase('red', 1); f.write('value.mjs', 'export const value = 1;\n'); f.phase('green');
  second.command = [process.execPath, '--test', 'test/second.test.mjs']; plan();
  const phase = (name, expected) => {
    const env = {...process.env}; delete env.NODE_TEST_CONTEXT;
    const r = spawnSync(process.execPath, [cli, 'tdd', 'run', '--root', f.root, '--change', 'add-value', '--task', '1.2', '--phase', name, ...(name === 'red' ? ['--reason', 'The second behavior is missing.'] : []), '--', ...second.command], {encoding: 'utf8', env});
    assert.equal(r.status, expected, r.stdout + r.stderr);
  };
  f.run(['tdd', 'start', '--change', 'add-value', '--task', '1.2']);
  f.write('test/second.test.mjs', "import {value} from '../value.mjs';\nif (value !== 2) throw Error('Expected the new value');\n");
  phase('red', 1); f.write('value.mjs', 'export const value = 2;\n'); phase('green', 0);
  assert.deepEqual(f.codes(), []);
});

test('command arguments after the separator are preserved and recording cannot race', t => {
  const f = fixture(t, 'verification');
  f.definition.command = [process.execPath, '-e', "if (process.argv.slice(1).join(',') !== '--root,other,--json') process.exit(1)", '--', '--root', 'other', '--json'];
  f.tasks(true); f.start();
  const r = spawnSync(process.execPath, [cli, 'tdd', 'run', '--root', f.root, '--change', 'add-value', '--task', '1.1', '--phase', 'verify', '--', ...f.definition.command], {encoding: 'utf8'});
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.deepEqual(f.codes(), []);
  f.write('.cliewen-openspec/tdd/add-value.lock', '');
  assert.ok(f.codes().includes('tdd-recording-in-progress'));
  f.run(['tdd', 'start', '--change', 'add-value', '--task', '1.1'], 2);
});

test('packed consumer CLI records and checks TDD without the maintainer checkout', {timeout: 120000}, t => {
  const f = fixture(t);
  const npm = process.env.npm_execpath; assert.ok(npm, 'Run this packed-installation test through npm test');
  const repo = fileURLToPath(new URL('../', import.meta.url));
  const env = {...process.env}; delete env.NODE_TEST_CONTEXT;
  const execute = (args, expected = 0, cwd = f.root) => {
    const r = spawnSync(process.execPath, args, {cwd, env, encoding: 'utf8', timeout: 60000});
    assert.equal(r.status, expected, r.stdout + r.stderr); return r.stdout;
  };
  const pack = JSON.parse(execute([npm, 'pack', '--json', '--ignore-scripts', '--pack-destination', f.root], 0, repo))[0];
  f.write('package.json', '{"private":true,"type":"module"}');
  execute([npm, 'install', '--ignore-scripts', '--no-audit', '--no-fund', path.join(f.root, pack.filename)]);
  const installed = 'node_modules/cliewen-openspec/dist/cli.js';
  const run = (phase, expected = 0) => execute([installed, 'tdd', 'run', '--change', 'add-value', '--task', '1.1', '--phase', phase, ...(phase === 'red' ? ['--reason', 'One is not implemented yet.'] : []), '--', ...f.definition.command], expected);
  execute([installed, 'tdd', 'start', '--change', 'add-value', '--task', '1.1']);
  f.testValue(1); run('red', 1); f.write('value.mjs', 'export const value = 1;\n'); run('green'); f.tasks(true);
  const result = JSON.parse(execute([installed, 'check', '--change', 'add-value', '--json']));
  assert.equal(result.ok, true);
  f.write('value.mjs', 'export const value = 2;\n');
  assert.ok(JSON.parse(execute([installed, 'check', '--change', 'add-value', '--json'], 1)).findings.some(f => f.code === 'tdd-history-stale'));
});

test('verification commands that modify declared inputs cannot establish completion', t => {
  const f = fixture(t, 'verification');
  f.definition.command = [process.execPath, '-e', "require('node:fs').writeFileSync('value.mjs', 'export const value = 1;\\n')"];
  f.tasks(true); f.start();
  const r = spawnSync(process.execPath, [cli, 'tdd', 'run', '--root', f.root, '--change', 'add-value', '--task', '1.1', '--phase', 'verify', '--', ...f.definition.command], {encoding: 'utf8'});
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const before = fs.readFileSync(path.join(f.root, '.cliewen-openspec/tdd/add-value.jsonl'), 'utf8');
  assert.ok(f.codes().includes('tdd-sequence-invalid'));
  assert.equal(fs.readFileSync(path.join(f.root, '.cliewen-openspec/tdd/add-value.jsonl'), 'utf8'), before, 'check is read-only');
});

test('history preserves declared filename case when transferring artifacts', t => {
  const f = fixture(t, 'verification');
  f.definition.tests = [];
  f.definition.implementation = ['README.md'];
  f.definition.command = [process.execPath, '-e', 'process.exit(0)'];
  f.tasks(true); f.write('README.md', '# Before\n'); f.start(); f.write('README.md', '# After\n');
  const r = spawnSync(process.execPath, [cli, 'tdd', 'run', '--root', f.root, '--change', 'add-value', '--task', '1.1', '--phase', 'verify', '--', ...f.definition.command], {encoding: 'utf8'});
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const events = fs.readFileSync(path.join(f.root, '.cliewen-openspec/tdd/add-value.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
  assert.deepEqual(Object.keys(events.at(-1).after), ['README.md']);
  assert.deepEqual(f.codes(), []);
});
