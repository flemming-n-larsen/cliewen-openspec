import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { init, check, nextId, recover } from '../dist/core.js';
function fixture(t) { const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cliewen-')); t.after(() => fs.rmSync(root, { recursive: true, force: true })); for (const p of ['openspec/specs','openspec/changes']) fs.mkdirSync(path.join(root,p), {recursive:true}); return root; }
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
test('registry never reuses a retired highest ID and seeds from existing specs', t=>{
  const root=fixture(t); init(root,false,false); const spec=path.join(root,'openspec/specs/example.md'); fs.writeFileSync(spec,'#### Scenario: Old [EX-009]\n');
  assert.equal(nextId(root,'EX'),'EX-010'); fs.unlinkSync(spec); assert.equal(nextId(root,'EX'),'EX-011');
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
