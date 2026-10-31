import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {init, update, nextId, check} from '../dist/core.js';

const digest = text => createHash('sha256').update(text.replaceAll('\r\n', '\n')).digest('hex');
const manifestFile = '.cliewen-openspec/manifest.json';
const ownedFile = 'openspec/schemas/cliewen-delivery/templates/tasks.md';
const retiredFile = 'openspec/schemas/cliewen-delivery/templates/obsolete.md';
const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cliewen-update-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  for (const dir of ['openspec/specs', 'openspec/changes']) fs.mkdirSync(path.join(root, dir), {recursive: true});
  init(root, false, false); return root;
}
const read = (root, file) => fs.readFileSync(path.join(root, file), 'utf8');
const write = (root, file, content) => { fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true}); fs.writeFileSync(path.join(root, file), content); };
function previous(root) {
  const manifest = JSON.parse(read(root, manifestFile));
  write(root, ownedFile, '# Previous task template\n'); manifest.files[ownedFile] = digest(read(root, ownedFile));
  write(root, retiredFile, '# Retired owned template\n'); manifest.files[retiredFile] = digest(read(root, retiredFile));
  write(root, manifestFile, JSON.stringify(manifest)); return manifest;
}
function snapshot(root) {
  const files = {};
  function visit(dir) { for (const entry of fs.readdirSync(dir, {withFileTypes: true})) { const p = path.join(dir, entry.name); if (entry.isDirectory()) visit(p); else files[path.relative(root, p)] = fs.readFileSync(p).toString('base64'); } }
  visit(root); return files;
}

test('update refreshes old owned content, adds bundles, retires files, and preserves authored state', t => {
  const root = fixture(t); const manifest = previous(root);
  for (const file of Object.keys(manifest.files)) if (/cliewen-(discovery|all)\//.test(file)) { fs.unlinkSync(path.join(root, file)); delete manifest.files[file]; }
  write(root, manifestFile, JSON.stringify(manifest));
  write(root, '.cliewen-openspec/config.yaml', '# Keep project choices\nfeatures:\n  evidence: false\nac:\n  capabilities:\n    csv-export: EXP\ntesting:\n  placement: per-task\n  approach: tdd\n');
  assert.equal(nextId(root, 'csv-export'), 'EXP-001');
  write(root, 'openspec/config.yaml', '# Existing default\nschema: cliewen-discovery\n');
  write(root, 'docs/decisions/adr-059-original.md', '# Keep this external address\n');
  write(root, 'openspec/changes/existing/tasks.md', '# Authored tasks\n');
  write(root, 'openspec/specs/csv-export/spec.md', '#### Scenario: Existing [EXP-001]\n');
  const preserved = ['.cliewen-openspec/config.yaml', '.cliewen-openspec/ac-registry.json', 'openspec/config.yaml', 'docs/decisions/adr-059-original.md', 'openspec/changes/existing/tasks.md', 'openspec/specs/csv-export/spec.md', 'docs/README.md'];
  const originals = Object.fromEntries(preserved.map(file => [file, read(root, file)]));
  const before = snapshot(root); const preview = update(root, true);
  assert.deepEqual(snapshot(root), before);
  assert.ok(preview.writes.includes('openspec/schemas/cliewen-all/schema.yaml'));
  assert.deepEqual(preview.deletes, [retiredFile]);
  assert.deepEqual(update(root), preview);
  for (const [file, text] of Object.entries(originals)) assert.equal(read(root, file), text, file);
  assert.equal(fs.existsSync(path.join(root, retiredFile)), false);
  assert.equal(check(root).some(f => f.severity === 'error'), false);
  assert.deepEqual(update(root), {writes: [], deletes: []});
  assert.equal(nextId(root, 'csv-export'), 'EXP-002');
});

test('update conflicts are preflighted and identical current content can be adopted', t => {
  const root = fixture(t); const latest = read(root, ownedFile);
  previous(root); write(root, ownedFile, '# Local customization\n');
  let before = snapshot(root);
  assert.throws(() => update(root), /Conflict/); assert.deepEqual(snapshot(root), before);
  write(root, ownedFile, latest.replaceAll('\n', '\r\n'));
  assert.ok(update(root).writes.includes(manifestFile));
  assert.equal(read(root, ownedFile), latest.replaceAll('\n', '\r\n'));
  assert.deepEqual(update(root), {writes: [], deletes: []});
  previous(root); write(root, retiredFile, 'local edits\n'); before = snapshot(root);
  assert.throws(() => update(root), /retired owned file/); assert.deepEqual(snapshot(root), before);
});

test('update refuses unowned collisions, unsafe manifests, unsupported versions, and invalid config', t => {
  const root = fixture(t); const original = JSON.parse(read(root, manifestFile));
  const latest = read(root, ownedFile);
  const cases = [
    m => { delete m.files[ownedFile]; },
    m => { m.files['docs/authored.md'] = digest('authored'); },
    m => { m.files['../outside.md'] = digest('outside'); },
    m => { m.files[ownedFile] = 'not a hash'; },
    m => { m.version = '9.0.0'; },
    m => { m.files = {}; },
  ];
  for (const modify of cases) {
    const m = structuredClone(original); modify(m); write(root, manifestFile, JSON.stringify(m));
    const before = snapshot(root); assert.throws(() => update(root)); assert.deepEqual(snapshot(root), before);
    assert.equal(read(root, ownedFile), latest);
  }
  write(root, manifestFile, JSON.stringify(original));
  write(root, '.cliewen-openspec/config.yaml', 'testing:\n  typo: true\n');
  const before = snapshot(root); assert.throws(() => update(root), /Unknown testing key/); assert.deepEqual(snapshot(root), before);
  fs.unlinkSync(path.join(root, manifestFile)); assert.throws(() => update(root), /run init first/);
});

test('update rollback restores deleted files, content, and manifest after a write failure', t => {
  const root = fixture(t); previous(root); const before = snapshot(root);
  const originalWrite = fs.writeFileSync;
  let failed = false;
  fs.writeFileSync = function(file, ...args) {
    if (!failed && path.resolve(String(file)) === path.join(root, manifestFile)) { failed = true; throw Error('Injected manifest publication failure'); }
    return originalWrite.call(this, file, ...args);
  };
  try { assert.throws(() => update(root), /Injected manifest publication failure/); }
  finally { fs.writeFileSync = originalWrite; }
  assert.equal(failed, true); assert.deepEqual(snapshot(root), before);
  assert.equal(fs.existsSync(path.join(root, '.cliewen-openspec/transaction.json')), false);
  assert.ok(update(root).writes.includes(ownedFile));
});

test('update CLI previews without recovery and recovers an interrupted transaction before updating', t => {
  const root = fixture(t); previous(root);
  const run = (args, expected = 0) => {
    const r = spawnSync(process.execPath, [cli, 'update', '--root', root, '--json', ...args], {encoding: 'utf8'});
    assert.equal(r.status, expected, `${r.stdout}\n${r.stderr}`); return JSON.parse(r.stdout);
  };
  const before = snapshot(root); const preview = run(['--dry-run']);
  assert.equal(preview.dryRun, true); assert.deepEqual(snapshot(root), before);
  write(root, '.cliewen-openspec/transaction.json', JSON.stringify({files: {[ownedFile]: '# Previous task template\n'}}));
  write(root, ownedFile, 'interrupted write');
  const interrupted = snapshot(root); run(['--dry-run'], 2); assert.deepEqual(snapshot(root), interrupted);
  const result = run([]); assert.equal(result.dryRun, false); assert.ok(result.deletes.includes(retiredFile));
  assert.deepEqual(run([]).writes, []);
  run(['--default'], 2);
});

test('update rejects a dangling owned-file symlink before creating its outside target', t => {
  const root = fixture(t);
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'cliewen-outside-target-'));
  t.after(() => fs.rmSync(outside, {recursive: true, force: true}));
  const target = path.join(outside, 'not-created.md');
  fs.unlinkSync(path.join(root, ownedFile));
  try { fs.symlinkSync(target, path.join(root, ownedFile), 'file'); }
  catch (error) { if (['EPERM', 'EACCES'].includes(error.code)) { t.skip('Creating file symlinks requires privileges on this system'); return; } throw error; }
  assert.throws(() => update(root), /Symlink not supported/);
  assert.equal(fs.existsSync(target), false);
});
