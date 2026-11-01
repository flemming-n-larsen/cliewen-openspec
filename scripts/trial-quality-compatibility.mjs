// Maintainer design experiment against the current product, not a future-policy validator.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {init, check, config} from '../dist/core.js';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cliewen-quality-compat-'));
const observations = [];
const output = path.resolve('.tmp', `quality-compatibility-${Date.now()}.json`);
const write = (name, content) => {
  const target = path.join(root, name);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, content);
};
const git = (...args) => execFileSync('git', args, {cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trim();
function observe(name, action) {
  const value = action(); observations.push({name, value}); return value;
}
function evaluate(name, report, expected = []) {
  write('.cliewen-openspec/evidence.json', JSON.stringify(report));
  const errors = check(root).filter(f => f.severity === 'error').map(f => f.code).sort();
  observe(name, () => errors);
  assert.deepEqual(errors, [...expected].sort(), name);
}
let status = 'completed', error;
try {
  fs.mkdirSync(path.join(root, 'openspec/specs'), {recursive: true});
  fs.mkdirSync(path.join(root, 'openspec/changes'), {recursive: true});
  init(root, false, false);
  write('openspec/specs/count/spec.md', '# Count\n\n### Requirement: Parse count\nThe system SHALL parse a positive count.\n\n#### Scenario: Parse count [COUNT-001]\nTest-type: Unit\n- **WHEN** a valid count is supplied\n- **THEN** it is parsed\n');
  git('init', '-b', 'main'); git('config', 'user.name', 'Compatibility fixture'); git('config', 'user.email', 'fixture@example.invalid');
  git('add', '.'); git('commit', '-m', 'Create compatibility baseline');
  const revision = git('rev-parse', 'HEAD');
  const row = {scenario: 'COUNT-001', test: 'parses count', testType: 'Unit', outcome: 'passed'};
  const report = {version: 1, revision, execution: {exitCode: 0}, results: [row]};
  evaluate('original version-1 report', report);
  evaluate('additive case metadata accepted by current checker', {...report, results: [{...row, caseId: 'ordinary', coverage: 'positive'}]});
  evaluate('duplicate names still rejected with different case IDs', {...report, results: [{...row, caseId: 'one'}, {...row, caseId: 'two'}]}, ['duplicate-test-result']);
  evaluate('failed execution stays blocking with case metadata', {...report, results: [{...row, caseId: 'ordinary', coverage: 'positive', outcome: 'failed'}]}, ['test-failed']);
  evaluate('stale report still rejected', {...report, revision: '0'.repeat(40)}, ['stale-evidence']);
  const invalidType = {...row}; delete invalidType.testType;
  evaluate('legacy missing test type remains invalid', {...report, results: [invalidType]}, ['missing-test-type']);
  write('.cliewen-openspec/evidence.json', JSON.stringify({...report, version: 2}));
  assert.throws(() => check(root), /Invalid evidence report/);
  observe('version 2 rejected by current parser', () => true);
  write('.cliewen-openspec/config.yaml', 'testing:\n  quality:\n    coverage:\n      mode: off\n');
  assert.throws(() => config(root), /Unknown testing key/);
  observe('future policy keys rejected by current configuration parser', () => true);
  write('.cliewen-openspec/config.yaml', 'features:\n  evidence: false\n');
  git('add', '.'); git('commit', '-m', 'Disable evidence for opt-out check');
  fs.unlinkSync(path.join(root, '.cliewen-openspec/evidence.json'));
  const findings = check(root);
  assert.equal(findings.some(f => f.severity === 'error'), false);
  assert.ok(findings.some(f => f.code === 'evidence-disabled'));
  observe('current evidence opt-out needs no report', () => findings.map(f => f.code));
} catch (caught) {
  status = 'failed'; error = caught.stack; process.exitCode = 1;
} finally {
  fs.mkdirSync(path.dirname(output), {recursive: true});
  fs.writeFileSync(output, JSON.stringify({status, error, root, node: process.version, platform: process.platform, observations}, null, 2) + '\n');
  console.log(JSON.stringify({status, checks: observations.length, output}));
}
