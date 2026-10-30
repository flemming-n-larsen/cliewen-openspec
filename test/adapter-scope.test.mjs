import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {init, check} from '../dist/core.js';

test('change-scoped evidence filters results but preserves failures across the full run', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cliewen-scope-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const write = (file, text) => { fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true}); fs.writeFileSync(path.join(root, file), text); };
  const run = (exe, args, expected = 0) => {
    const env = {...process.env}; delete env.NODE_TEST_CONTEXT;
    const r = spawnSync(exe, args, {cwd: root, encoding: 'utf8', env, timeout: 30000});
    assert.equal(r.status, expected, `${r.stdout}\n${r.stderr}`); return r;
  };
  fs.mkdirSync(path.join(root, 'openspec/specs'), {recursive: true});
  fs.mkdirSync(path.join(root, 'openspec/changes'), {recursive: true});
  init(root, false, false);
  for (const [name, id] of [['first-change', 'A-001'], ['second-change', 'B-001']]) {
    write(`openspec/changes/${name}/specs/example/spec.md`, `## ADDED Requirements\n### Requirement: Example\n#### Scenario: Works [${id}]\nTest-type: Unit\n`);
  }
  const tests = "const {test} = require('node:test');\ntest('first [A-001] [Test-type: Unit]', () => {});\ntest('second [B-001] [Test-type: Unit]', () => {});\n";
  fs.appendFileSync(path.join(root, 'openspec/changes/first-change/specs/example/spec.md'), '## REMOVED Requirements\n#### Scenario: Removed [C-001]\nTest-type: Unit\n');
  write('shared.test.cjs', tests);
  run('git', ['init']); run('git', ['config', 'user.name', 'Fixture']); run('git', ['config', 'user.email', 'fixture@example.invalid']);
  const commit = () => { run('git', ['add', '.']); run('git', ['commit', '-m', 'Fixture']); };
  commit();
  const adapter = fileURLToPath(new URL('../adapters/node-test.mjs', import.meta.url));
  const reportPath = path.join(root, '.cliewen-openspec/evidence.json');
  const collect = (args = ['--change', 'first-change', 'shared.test.cjs'], expected = 0) => run(process.execPath, [adapter, ...args], expected);
  const report = () => JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  collect();
  assert.deepEqual(report().scope, {change: 'first-change'});
  assert.deepEqual(report().results.map(r => r.scenario), ['A-001']);
  assert.equal(check(root, 'first-change').some(f => f.severity === 'error'), false);
  assert.ok(check(root, 'second-change').some(f => f.code === 'evidence-scope-mismatch'));
  assert.ok(check(root).some(f => f.code === 'evidence-scope-mismatch'));
  const wrongScope = report(); wrongScope.scope.change = 'second-change';
  fs.writeFileSync(reportPath, JSON.stringify(wrongScope));
  assert.ok(check(root, 'first-change').some(f => f.code === 'evidence-scope-mismatch'), 'matching result IDs do not override a different declared scope');
  collect();
  const scoped = report(); delete scoped.execution;
  fs.writeFileSync(reportPath, JSON.stringify(scoped));
  assert.throws(() => check(root, 'first-change'), /complete test runner exit code/);
  for (const scope of [null, {}, {change: '../bad'}, {change: 'first-change', extra: true}]) {
    fs.writeFileSync(reportPath, JSON.stringify({...scoped, scope, execution: {exitCode: 0}}));
    assert.throws(() => check(root, 'first-change'));
  }
  collect(['shared.test.cjs']);
  assert.equal(report().scope, undefined);
  assert.equal(report().results.length, 2, 'legacy collection keeps all mapped results');
  for (const extraTest of ["test('other mapped failure [B-002] [Test-type: Unit]', () => {throw Error('regression')});", "test('unmapped failure', () => {throw Error('regression')});"]) {
    write('shared.test.cjs', tests + extraTest); commit(); collect(undefined, 1);
    assert.equal(report().results.length, 1);
    assert.equal(report().results[0].outcome, 'passed');
    assert.equal(report().execution.exitCode, 1);
    assert.ok(check(root, 'first-change').some(f => f.code === 'runner-failed'));
  }
  write('shared.test.cjs', tests); commit(); collect();
  for (const args of [['--change'], ['--change', '../bad', 'shared.test.cjs'], ['--change', 'missing-change', 'shared.test.cjs'], ['--change', 'first-change', '--change', 'second-change', 'shared.test.cjs']]) {
    collect(args, 2); assert.equal(fs.existsSync(reportPath), false); collect();
  }
  write('other.test.cjs', "const {test} = require('node:test'); test('second only [B-001] [Test-type: Unit]', () => {});");
  commit(); collect(['--change', 'first-change', 'other.test.cjs'], 2);
  assert.equal(fs.existsSync(reportPath), false, 'no matches invalidates earlier evidence');
  write('shared.test.cjs', 'invalid JavaScript !'); commit(); collect(undefined, 2);
  assert.equal(fs.existsSync(reportPath), false, 'crashed runner leaves no earlier report');
});
