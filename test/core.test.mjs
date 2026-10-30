import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { init, check, nextId, recover, local, config, defaults, scenarios } from '../dist/core.js';
function fixture(t) { const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cliewen-')); t.after(() => fs.rmSync(root, { recursive: true, force: true })); for (const p of ['openspec/specs','openspec/changes']) fs.mkdirSync(path.join(root,p), {recursive:true}); return root; }

test('test types replace defaults and reject incomplete definitions', t => {
  const root = fixture(t); init(root, false, false);
  const cfg = path.join(root, '.cliewen-openspec/config.yaml');
  assert.deepEqual(Object.keys(config(root).testing.types), ['Unit', 'Integration', 'E2E']);
  fs.writeFileSync(cfg, 'testing:\n  types:\n    Component check:\n      description: In-process component boundary\n');
  assert.deepEqual(config(root).testing.types, {'Component check': {description: 'In-process component boundary'}});
  for (const value of ['{}', '[]', 'null', '{Unit: {}}', '{Unit: {description: ""}}', '{Unit: {description: ok, typo: true}}', '{" bad": {description: ok}}']) {
    fs.writeFileSync(cfg, `testing:\n  types: ${value}\n`);
    assert.throws(() => config(root), undefined, value);
  }
});

test('scenario types stay scoped to their scenario and ignore fences and removals', t => {
  const root = fixture(t); init(root, false, false);
  fs.writeFileSync(path.join(root, 'openspec/specs/example.md'), '## ADDED Requirements\n### Requirement: Example\n#### Scenario: First [EX-001]\nTest-type: Unit\n```text\nTest-type: Fake\n```\n#### Scenario: Missing [EX-002]\n### Requirement: Next\nTest-type: Integration\n#### Scenario: Duplicate [EX-003]\nTest-type: Unit\nTest-type: Integration\n## REMOVED Requirements\n#### Scenario: Removed [EX-004]\nTest-type: Unknown\n');
  assert.deepEqual(scenarios(root).map(s => s.testTypes), [['Unit'], [], ['Unit', 'Integration']]);
  const codes = check(root).map(f => f.code);
  assert.equal(codes.filter(code => code === 'invalid-scenario-test-type').length, 2);
});
test('repository paths reject drive-relative, absolute and escaping paths', t => {
  const root = fixture(t);
  for (const unsafe of ['D:outside.txt', 'C:outside.txt', 'C:\\outside.txt', '\\\\server\\share\\file', '/outside', '../outside', 'docs/../../outside']) {
    assert.throws(() => local(root, unsafe), /Unsafe repository path/, unsafe);
  }
  assert.equal(local(root, 'docs/decisions/record.md'), path.join(root, 'docs/decisions/record.md'));
  init(root, false, false);
  fs.writeFileSync(path.join(root, '.cliewen-openspec/config.yaml'), 'docsRoot: D:outside\n');
  assert.throws(() => init(root, false, false), /Unsafe repository path/);
  fs.writeFileSync(path.join(root, '.cliewen-openspec/transaction.json'), JSON.stringify({files: {'D:outside.txt': 'bad'}}));
  assert.throws(() => recover(root), /Unsafe repository path/);
});
test('clean CRLF Git checkout preserves installation checks and idempotence', t => {
  const root = fixture(t);
  init(root, false, false);
  fs.writeFileSync(path.join(root, '.cliewen-openspec/config.yaml'), 'features:\n  evidence: false\n');
  const git = (...args) => execFileSync('git', ['-C', root, ...args], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trim();
  git('init'); git('config', 'core.autocrlf', 'true'); git('add', '.');
  git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'Fixture');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, '.cliewen-openspec/manifest.json'), 'utf8'));
  for (const file of Object.keys(manifest.files)) {
    fs.unlinkSync(path.join(root, file)); git('checkout', '--', file);
    assert.ok(fs.readFileSync(path.join(root, file), 'utf8').includes('\r\n'));
  }
  assert.equal(git('status', '--porcelain'), '');
  assert.ok(!check(root).some(f => f.severity === 'error'));
  assert.deepEqual(init(root, false, false), []);
  const owned = Object.keys(manifest.files)[0];
  fs.appendFileSync(path.join(root, owned), 'actual modification\r\n');
  assert.ok(check(root).some(f => f.code === 'owned-file-modified'));
  assert.throws(() => init(root, false, false), /Conflict/);
});
test('init preserves user config, is idempotent and previews without writes', t => {
  const root = fixture(t), cfg = path.join(root,'openspec/config.yaml');
  fs.writeFileSync(cfg,'# user comment\nschema: custom\ncontext: keep me\n');
  init(root,true,false); assert.equal(fs.existsSync(path.join(root,'.cliewen-openspec')),false);
  init(root,false,false); assert.match(fs.readFileSync(cfg,'utf8'), /schema: custom/);
  assert.deepEqual(init(root,false,false),[]);
  init(root,false,true); assert.match(fs.readFileSync(cfg,'utf8'), /# user comment/); assert.match(fs.readFileSync(cfg,'utf8'),/cliewen-delivery/);
});
test('conflicting schemas stop all writes', t => {
  const root=fixture(t); const dir=path.join(root,'openspec/schemas/cliewen-delivery'); fs.mkdirSync(dir,{recursive:true}); fs.writeFileSync(path.join(dir,'schema.yaml'),'custom');
  assert.throws(()=>init(root,false,false),/Conflict/); assert.equal(fs.existsSync(path.join(root,'.cliewen-openspec')),false);
});

test('a discovery schema conflict prevents writes to either bundle', t => {
  const root = fixture(t);
  const dir = path.join(root, 'openspec/schemas/cliewen-discovery');
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(path.join(dir, 'schema.yaml'), 'custom discovery');
  assert.throws(() => init(root, false, false), /Conflict/);
  assert.equal(fs.existsSync(path.join(root, 'openspec/schemas/cliewen-delivery')), false);
  assert.equal(fs.existsSync(path.join(root, '.cliewen-openspec')), false);
});
test('registry never reuses a retired highest ID and seeds from existing specs', t=>{
  const root=fixture(t); init(root,false,false); fs.writeFileSync(path.join(root,'.cliewen-openspec/config.yaml'),'ac:\n  capabilities:\n    example: EX\n'); const spec=path.join(root,'openspec/specs/example.md'); fs.writeFileSync(spec,'#### Scenario: Old [EX-009]\n');
  assert.equal(nextId(root,'example'),'EX-010'); fs.unlinkSync(spec); assert.equal(nextId(root,'example'),'EX-011');
});
test('AC configuration validates capability mappings and test placement', t => {
  const root = fixture(t); init(root, false, false);
  const cfg = path.join(root, '.cliewen-openspec/config.yaml');
  fs.writeFileSync(cfg, 'ac:\n  capabilities:\n    csv-export: EXP\n  padding: 1\ntesting:\n  placement: end-of-change\n');
  assert.equal(nextId(root, 'csv-export'), 'EXP-1');
  assert.equal(config(root).testing.placement, 'end-of-change');
  fs.writeFileSync(cfg, 'ac:\n  capabilities:\n    csv-export: EXP\n  padding: 4\n');
  assert.equal(nextId(root, 'csv-export'), 'EXP-0002');
  assert.equal(config(root).testing.placement, 'per-task');
  for (const invalid of ['ac:\n  prefix: EXP\n', 'ac:\n  capabilities:\n    csv-export: exp\n', 'ac:\n  capabilities:\n    csv-export: EXP\n    other: EXP\n', 'ac:\n  padding: 0\n', 'ac:\n  padding: 2.5\n', 'ac:\n  padding: 13\n', 'testing:\n  placement: later\n']) {
    fs.writeFileSync(cfg, invalid);
    assert.throws(() => config(root));
  }
});
test('testing approach defaults remain compatible and conflicting TDD placement is rejected', t => {
  const root = fixture(t); init(root, false, false);
  const cfg = path.join(root, '.cliewen-openspec/config.yaml');
  assert.equal(config(root).testing.approach, 'flexible');
  fs.writeFileSync(cfg, 'testing:\n  approach: tdd\n');
  assert.deepEqual(config(root).testing, {placement: 'per-task', approach: 'tdd', types: defaults().testing.types});
  fs.writeFileSync(cfg, 'testing:\n  placement: end-of-change\n');
  assert.deepEqual(config(root).testing, {placement: 'end-of-change', approach: 'flexible', types: defaults().testing.types});
  fs.writeFileSync(cfg, 'testing:\n  placement: end-of-change\n  approach: tdd\n');
  assert.throws(() => config(root), /tdd requires.*per-task/);
  const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
  const result = spawnSync(process.execPath, [cli, 'check', '--root', root, '--json'], {encoding: 'utf8'});
  assert.equal(result.status, 2);
  assert.match(JSON.parse(result.stdout).error, /tdd requires/);
  for (const approach of ['unknown', 'true', '[]', 'null']) {
    fs.writeFileSync(cfg, `testing:\n  approach: ${approach}\n`);
    assert.throws(() => config(root), /approach must be/);
  }
});
test('missing evidence fails; explicit disable works without reinstall',t=>{
  const root=fixture(t); init(root,false,false); assert.ok(check(root).some(f=>f.code==='evidence-not-configured'));
  fs.writeFileSync(path.join(root,'.cliewen-openspec/config.yaml'),'features:\n  evidence: false\n'); assert.ok(!check(root).some(f=>f.severity==='error'));
});
test('interrupted transaction is reported without writes and can be recovered',t=>{
  const root=fixture(t); init(root,false,false); const jp=path.join(root,'.cliewen-openspec/transaction.json'); fs.writeFileSync(path.join(root,'partial.txt'),'partial'); fs.writeFileSync(jp,JSON.stringify({files:{'partial.txt':null}}));
  assert.ok(check(root).some(f=>f.code==='interrupted-transaction')); assert.ok(fs.existsSync(jp)); recover(root); assert.ok(!fs.existsSync(path.join(root,'partial.txt')));
});
test('unsafe change paths and invalid config are rejected',t=>{
  const root=fixture(t); init(root,false,false);
  assert.throws(()=>check(root,'../archive'),/kebab-case/);
  fs.writeFileSync(path.join(root,'.cliewen-openspec/config.yaml'),'features:\n  evidense: true\n');
  assert.throws(()=>check(root),/Unknown features key/);
});
test('unsupported dry-run flags cannot allocate an ID',t=>{
  const root=fixture(t); init(root,false,false);
  const cli=fileURLToPath(new URL('../dist/cli.js',import.meta.url));
  const r=spawnSync(process.execPath,[cli,'ac','next','EX','--root',root,'--dry-run'],{encoding:'utf8'});
  assert.equal(r.status,2); assert.match(r.stderr,/supported only by init/);
  assert.equal(fs.existsSync(path.join(root,'.cliewen-openspec/ac-registry.json')),false);
  const bad=spawnSync(process.execPath,[cli,'check','--root',root,'--change','../outside','--json'],{encoding:'utf8'});
  assert.equal(bad.status,2); assert.equal(JSON.parse(bad.stdout).ok,false);
});
