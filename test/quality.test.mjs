import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {execFileSync, spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {stringify} from 'yaml';
import {init, config, check, defaults} from '../dist/core.js';

const requirement = (id, name = id, outcome = 'works') => `### Requirement: ${name}\nThe system SHALL work.\n\n#### Scenario: Works [${id}]\nTest-type: Unit\n- **WHEN** called\n- **THEN** ${outcome}\n\n`;
function fixture(t, policies = {}, existing = '') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cliewen-quality-test-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const write = (file, value) => { fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true}); fs.writeFileSync(path.join(root, file), value); };
  fs.mkdirSync(path.join(root, 'openspec/specs'), {recursive: true});
  fs.mkdirSync(path.join(root, 'openspec/changes'), {recursive: true}); init(root, false, false);
  const settings = defaults();
  settings.testing.quality.coverage.mode = policies.coverage ?? 'off';
  settings.testing.quality.effectiveness.mode = policies.effectiveness ?? 'off';
  settings.testing.lifecycle.mode = policies.lifecycle ?? 'off';
  write('.cliewen-openspec/config.yaml', stringify(settings));
  write('count.cjs', 'module.exports = value => Number(value);\n');
  write('count.test.cjs', "const {test}=require('node:test'); const assert=require('node:assert/strict'); const count=require('./count.cjs'); test('parses [COUNT-001] [Test-type: Unit] [Case: one] [Coverage: positive]',()=>assert.equal(count('1'),1));\n");
  if (existing) write('openspec/specs/count/spec.md', existing);
  const git = (...args) => execFileSync('git', ['-C', root, ...args], {stdio: ['ignore', 'pipe', 'pipe']});
  const commit = () => { git('add', '.'); git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--allow-empty', '-m', 'Fixture'); return git('rev-parse', 'HEAD').toString().trim(); };
  git('init', '-b', 'main'); const baseline = commit();
  if (!existing) write('openspec/specs/count/spec.md', requirement('COUNT-001'));
  const positive = {scenario: 'COUNT-001', test: 'parses one', testType: 'Unit', outcome: 'passed', caseId: 'one', coverage: 'positive'};
  const negative = {...positive, test: 'rejects invalid', caseId: 'invalid', coverage: 'negative'};
  const record = {version: 1, scope: {specs: true}, baseline, inputs: {}, effectiveness: [], lifecycle: [], exceptions: []};
  const saveReview = (scope = '.cliewen-openspec/reviews/specs.yaml') => {
    git('add', '.');
    record.inputs = Object.fromEntries(['.cliewen-openspec/config.yaml', 'openspec/specs/count/spec.md', 'count.cjs', 'count.test.cjs', ...(fs.existsSync(path.join(root, 'retirement.md')) ? ['retirement.md'] : []), ...(fs.existsSync(path.join(root, 'openspec/changes/retire/specs/count/spec.md')) ? ['openspec/changes/retire/specs/count/spec.md'] : [])].map(file => [file, createHash('sha256').update(git('show', `:${file}`)).digest('hex')]));
    write(scope, stringify(record)); commit();
  };
  const collect = (rows = [positive, negative], extra = {}) => {
    write('.cliewen-openspec/evidence.json', JSON.stringify({version: 1, revision: git('rev-parse', 'HEAD').toString().trim(), execution: {exitCode: 0}, results: rows, ...extra}));
  };
  const findings = (change) => check(root, change);
  const errors = (change) => findings(change).filter(f => f.severity === 'error');
  return {root, write, git, commit, settings, positive, negative, record, saveReview, collect, findings, errors};
}

test('quality configuration merges defaults, validates nested values, and requires evidence for enforcement', t => {
  const f = fixture(t);
  f.write('.cliewen-openspec/config.yaml', 'testing:\n  quality:\n    coverage:\n      minimumCases:\n        positive: 2\n');
  assert.deepEqual(config(f.root).testing.quality.coverage, {mode: 'review', minimumCases: {positive: 2, negative: 1, boundary: 0}});
  for (const value of ['quality: null', 'quality: {typo: true}', 'quality: {coverage: {mode: true}}', 'quality: {coverage: {minimumCases: {positive: -1}}}', 'quality: {coverage: {minimumCases: {positive: 1.5}}}', 'quality: {coverage: {minimumCases: {positive: 9007199254740992}}}', 'quality: {coverage: {minimumCases: {other: 1}}}', 'quality: {effectiveness: {minimumCases: 1}}', 'lifecycle: {mode: null}', 'lifecycle: {typo: true}']) {
    f.write('.cliewen-openspec/config.yaml', `testing:\n  ${value}\n`); assert.throws(() => config(f.root), undefined, value);
  }
  for (const policy of ['quality: {coverage: {mode: enforce}}', 'quality: {effectiveness: {mode: enforce}}', 'lifecycle: {mode: enforce}']) {
    f.write('.cliewen-openspec/config.yaml', `features: {evidence: false}\ntesting:\n  ${policy}\n`); assert.throws(() => config(f.root), /requires features.evidence/);
  }
  f.write('.cliewen-openspec/config.yaml', 'features: {evidence: false}\n');
  assert.ok(f.findings().some(r => r.code === 'quality-evidence-unavailable' && r.severity === 'warning'));
});

test('coverage counts distinct passed cases and independently applies off, review, enforce, and minima', t => {
  const f = fixture(t, {coverage: 'enforce'}); f.commit(); f.collect(); assert.deepEqual(f.errors(), []);
  for (const [rows, code] of [
    [[f.positive], 'coverage-minimum-unmet'],
    [[f.positive, {...f.positive, test: 'repeated'}], 'coverage-case-invalid'],
    [[f.positive, {...f.negative, outcome: 'skipped'}], 'coverage-minimum-unmet'],
    [[f.positive, {...f.negative, testType: 'Integration'}], 'coverage-minimum-unmet'],
    [[{...f.positive, caseId: null}, f.negative], 'coverage-case-invalid'],
    [[{scenario: 'COUNT-001', test: 'old', testType: 'Unit', outcome: 'passed'}], 'coverage-metadata-missing']
  ]) { f.collect(rows); assert.ok(f.errors().some(r => r.code === code), code); }
  f.settings.testing.quality.coverage.minimumCases.positive = 2;
  f.write('.cliewen-openspec/config.yaml', stringify(f.settings)); f.commit();
  f.collect([f.positive, {...f.positive, test: 'parses two', caseId: 'two'}, f.negative]); assert.deepEqual(f.errors(), []);
  f.collect([f.positive, f.negative]); assert.ok(f.errors().some(r => r.code === 'coverage-minimum-unmet'));
  f.settings.testing.quality.coverage.mode = 'review'; f.write('.cliewen-openspec/config.yaml', stringify(f.settings)); f.commit(); f.collect([f.positive]);
  assert.deepEqual(f.errors(), []); assert.ok(f.findings().some(r => r.code === 'coverage-minimum-unmet' && r.severity === 'warning'));
  f.settings.testing.quality.coverage.mode = 'off'; f.write('.cliewen-openspec/config.yaml', stringify(f.settings)); f.commit(); f.collect([f.positive]); assert.deepEqual(f.errors(), []);
  assert.equal(f.findings().some(r => r.code.startsWith('coverage-')), false);
});

test('reviewed exceptions are scoped and cannot waive failed execution', t => {
  const f = fixture(t, {coverage: 'enforce'});
  f.record.exceptions = [{policy: 'coverage', scenario: 'COUNT-001', category: 'negative', reason: 'Input rejection is covered by a separate requirement.', status: 'reviewed'}];
  f.saveReview(); f.collect([f.positive]); assert.deepEqual(f.errors(), []);
  f.collect([{...f.positive, outcome: 'failed'}]); assert.ok(f.errors().some(r => r.code === 'test-failed'));
  f.record.exceptions[0].status = 'proposed'; f.saveReview(); f.collect([f.positive]); assert.ok(f.errors().some(r => r.code === 'coverage-minimum-unmet'));
  f.record.exceptions[0].status = 'reviewed'; f.record.exceptions.push({...f.record.exceptions[0]}); f.saveReview(); f.collect([f.positive]);
  assert.ok(f.errors().some(r => r.code === 'test-review-invalid')); assert.ok(f.errors().some(r => r.code === 'coverage-minimum-unmet'));
});

test('effectiveness accepts reviewed behavior failures, rejects setup claims, and invalidates changed inputs', t => {
  const f = fixture(t, {effectiveness: 'enforce'});
  f.record.effectiveness = [{scenario: 'COUNT-001', cases: ['one', 'invalid'], testFiles: ['count.test.cjs'], sourceFiles: ['count.cjs'], method: 'controlled-fault', assertion: 'Exact parsed value and rejection.', defect: 'Return wrong value and accept malformed input.', command: ['node', '--test', 'count.test.cjs'], observation: 'Target assertions failed with the controlled fault.', failureKind: 'behavior', status: 'reviewed'}];
  f.saveReview(); f.collect(); assert.deepEqual(f.errors(), []);
  f.collect([f.positive, {...f.negative, caseId: 'one'}]); assert.ok(f.errors().some(r => r.code === 'test-review-invalid'), 'effectiveness still rejects ambiguous case IDs with coverage disabled');
  f.record.effectiveness[0].failureKind = 'setup'; f.saveReview(); f.collect(); assert.ok(f.errors().some(r => r.code === 'effectiveness-unreviewed'));
  f.record.effectiveness[0].failureKind = 'behavior'; f.saveReview(); f.write('count.cjs', 'module.exports = () => 7;\n'); f.commit(); f.collect();
  assert.ok(f.errors().some(r => r.code === 'test-review-stale'));
  f.saveReview(); f.collect(); assert.deepEqual(f.errors(), []);
  f.record.scope = {change: 'other'}; f.saveReview(); f.collect(); assert.ok(f.errors().some(r => r.code === 'test-review-invalid' || r.code === 'test-review-scope-mismatch'));
});

test('lifecycle detects requirement removal without scenario text and preserves shared obligations', t => {
  const first = requirement('COUNT-001', 'Parse'); const second = requirement('COUNT-002', 'Limit');
  const f = fixture(t, {lifecycle: 'enforce'}, first + second);
  f.write('openspec/changes/retire/specs/count/spec.md', '## REMOVED Requirements\n### Requirement: Limit\n**Reason**: Remove the limit.\n**Migration**: Allow all counts.\n');
  f.record.scope = {change: 'retire'};
  f.write('retirement.md', '# Accepted removal\nThe owner agreed to remove the count limit.\n');
  f.record.lifecycle = [{scenario: 'COUNT-002', change: 'retired', reason: 'No upper limit.', status: 'reviewed', retirement: {status: 'accepted', source: 'retirement.md'}, tests: [{file: 'count.test.cjs', test: 'shared parser checks', action: 'retain', remainingScenarios: ['COUNT-001']}]}];
  f.saveReview('.cliewen-openspec/reviews/change-retire.yaml'); f.collect([f.positive], {scope: {change: 'retire'}});
  // Removal-only scope has no product result rows; shared active evidence belongs to permanent specs.
  f.collect([], {scope: {change: 'retire'}});
  assert.deepEqual(f.errors('retire'), [], 'retained out-of-scope obligations are declared for review and checked by the full suite/permanent evidence');
  delete f.record.inputs['openspec/specs/count/spec.md'];
  f.write('.cliewen-openspec/reviews/change-retire.yaml', stringify(f.record)); f.commit(); f.collect([], {scope: {change: 'retire'}});
  assert.ok(f.errors('retire').some(r => r.code === 'lifecycle-unresolved' && r.message.includes('permanent spec')));
  f.record.lifecycle[0].tests[0] = {file: 'count.test.cjs', test: 'upper limit only', action: 'remove', remainingScenarios: []};
  f.saveReview('.cliewen-openspec/reviews/change-retire.yaml'); f.collect([], {scope: {change: 'retire'}}); assert.deepEqual(f.errors('retire'), []);
  f.record.lifecycle[0].tests[0].remainingScenarios = ['COUNT-001']; f.saveReview('.cliewen-openspec/reviews/change-retire.yaml'); f.collect([], {scope: {change: 'retire'}});
  assert.ok(f.errors('retire').some(r => r.code === 'active-test-removal'));
  f.record.lifecycle[0].retirement.status = 'proposed'; f.saveReview('.cliewen-openspec/reviews/change-retire.yaml'); f.collect([], {scope: {change: 'retire'}});
  assert.ok(f.errors('retire').some(r => r.code === 'retirement-unaccepted'));
});

test('lifecycle follows changed assertions and requires review for implementation-only changes', t => {
  const f = fixture(t, {lifecycle: 'enforce'}, requirement('COUNT-001', 'Parse'));
  f.saveReview(); f.collect(); assert.ok(f.errors().some(r => r.code === 'lifecycle-unresolved'));
  f.record.lifecycle = [{scenario: 'COUNT-001', change: 'unchanged', reason: 'Refactor preserves parsing behavior.', status: 'reviewed', tests: [{file: 'count.test.cjs', test: 'parses one', action: 'retain', remainingScenarios: ['COUNT-001']}]}];
  f.saveReview(); f.collect(); assert.deepEqual(f.errors(), []);
  f.write('openspec/specs/count/spec.md', requirement('COUNT-001', 'Parse').replace('SHALL work.', 'SHALL parse nonnegative counts.'));
  f.saveReview(); f.collect(); assert.ok(f.errors().some(r => r.code === 'lifecycle-unresolved'), 'parent requirement changes also need review');
  f.write('openspec/specs/count/spec.md', requirement('COUNT-001', 'Parse', 'accepts zero'));
  f.saveReview(); f.collect(); assert.ok(f.errors().some(r => r.code === 'lifecycle-unresolved'));
  f.record.lifecycle[0].change = 'modified'; f.record.lifecycle[0].tests[0].action = 'update';
  f.saveReview(); f.collect(); assert.deepEqual(f.errors(), []);
  f.record.lifecycle[0].tests[0].action = 'remove'; f.record.lifecycle[0].tests[0].remainingScenarios = [];
  f.saveReview(); f.collect(); assert.ok(f.errors().some(r => r.code === 'active-test-removal'));
});

test('modified requirement projection detects scenarios omitted from replacement blocks', t => {
  const source = requirement('COUNT-001', 'Parse') + '#### Scenario: Limit [COUNT-002]\nTest-type: Unit\n- **WHEN** a large number is supplied\n- **THEN** reject it\n';
  const f = fixture(t, {lifecycle: 'enforce'}, source);
  f.write('openspec/changes/retire/specs/count/spec.md', '## MODIFIED Requirements\n' + requirement('COUNT-001', 'Parse'));
  f.record.scope = {change: 'retire'};
  f.record.exceptions = [{policy: 'lifecycle', scenario: 'COUNT-001', reason: 'Its behavior is unchanged.', status: 'reviewed'}];
  f.saveReview('.cliewen-openspec/reviews/change-retire.yaml'); f.collect([f.positive], {scope: {change: 'retire'}});
  assert.ok(f.errors('retire').some(r => r.code === 'retirement-unaccepted' && r.message.includes('COUNT-002')));
});

test('delivery refactoring with native skip_specs verifies permanent behavior and lifecycle records', t => {
  const f = fixture(t, {lifecycle: 'enforce'}, requirement('COUNT-001', 'Parse'));
  f.write('openspec/changes/refactor/.openspec.yaml', 'schema: cliewen-delivery\nskip_specs: true\n');
  f.record.scope = {change: 'refactor'};
  f.saveReview('.cliewen-openspec/reviews/change-refactor.yaml'); f.collect([f.positive], {scope: {change: 'refactor'}});
  assert.ok(f.errors('refactor').some(r => r.code === 'lifecycle-unresolved'));
  f.record.lifecycle = [{scenario: 'COUNT-001', change: 'unchanged', reason: 'Behavior-preserving refactor.', status: 'reviewed', tests: [{file: 'count.test.cjs', test: 'parses one', action: 'retain', remainingScenarios: ['COUNT-001']}]}];
  f.saveReview('.cliewen-openspec/reviews/change-refactor.yaml'); f.collect([f.positive], {scope: {change: 'refactor'}});
  assert.deepEqual(f.errors('refactor'), []);
});

test('Node adapter exports optional case tags without losing malformed metadata or retirement-only runs', t => {
  const f = fixture(t, {coverage: 'review'}); f.commit();
  const adapter = fileURLToPath(new URL('../adapters/node-test.mjs', import.meta.url));
  const run = (args = ['count.test.cjs'], expected = 0) => {
    const env = {...process.env}; delete env.NODE_TEST_CONTEXT;
    const result = spawnSync(process.execPath, [adapter, ...args], {cwd: f.root, env, encoding: 'utf8'});
    assert.equal(result.status, expected, result.stderr);
    if (expected !== 0) return result;
    return JSON.parse(fs.readFileSync(path.join(f.root, '.cliewen-openspec/evidence.json')));
  };
  assert.equal(run().results[0].coverage, 'positive'); assert.equal(run().results[0].caseId, 'one');
  f.write('count.test.cjs', fs.readFileSync(path.join(f.root, 'count.test.cjs'), 'utf8').replace('[Case: one]', '[Case: one] [Case: two]'));
  f.commit(); assert.equal(run().results[0].caseId, null); assert.equal(f.errors().length, 0); assert.ok(f.findings().some(r => r.code === 'coverage-case-invalid'));
  f.write('openspec/changes/retire/specs/count/spec.md', '## REMOVED Requirements\n### Requirement: Count limit\n**Reason**: Retired.\n');
  f.commit(); const retirement = run(['--change', 'retire', 'count.test.cjs']);
  assert.deepEqual(retirement.results, []); assert.equal(retirement.execution.exitCode, 0);
  f.write('openspec/changes/retire/specs/count/spec.md', '```md\n## REMOVED Requirements\n### Requirement: Example only\n```\n'); f.commit();
  run(['--change', 'retire', 'count.test.cjs'], 2);
  assert.equal(fs.existsSync(path.join(f.root, '.cliewen-openspec/evidence.json')), false);
});
