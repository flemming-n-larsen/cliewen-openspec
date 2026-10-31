import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {parse} from 'yaml';
import {init, uninstall, nextId} from '../dist/core.js';

const manifestFile = '.cliewen-openspec/manifest.json';
const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
const write = (root, file, content) => { fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true}); fs.writeFileSync(path.join(root, file), content); };
const read = (root, file) => fs.readFileSync(path.join(root, file), 'utf8');
function fixture(t, defaultSchema = 'cliewen-delivery') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cliewen-uninstall-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  for (const dir of ['openspec/specs', 'openspec/changes']) fs.mkdirSync(path.join(root, dir), {recursive: true});
  init(root, false, false);
  write(root, 'openspec/config.yaml', `# Preserve this comment\nschema: ${defaultSchema} # Project default\ncontext: Keep my context\n`);
  return root;
}
function snapshot(root) {
  const files = {};
  function visit(dir) { for (const entry of fs.readdirSync(dir, {withFileTypes: true})) { const file = path.join(dir, entry.name); if (entry.isDirectory()) visit(file); else files[path.relative(root, file)] = fs.readFileSync(file).toString('base64'); } }
  visit(root); return files;
}

test('uninstall previews and removes only owned resources, preserving history and authored state', t => {
  const root = fixture(t);
  write(root, '.cliewen-openspec/config.yaml', '# Project config\nac:\n  capabilities:\n    export: EXP\n');
  assert.equal(nextId(root, 'export'), 'EXP-001');
  write(root, '.cliewen-openspec/evidence.json', '{"historical":"report"}\n');
  write(root, 'docs/decisions/adr-059-stable-link.md', '# Authored decision\n');
  write(root, 'openspec/changes/archive/old/.openspec.yaml', 'schema: cliewen-delivery\n');
  write(root, 'openspec/changes/archive/old/proposal.md', '# Historical change\n');
  write(root, 'openspec/changes/other/.openspec.yaml', 'schema: spec-driven\n');
  write(root, 'openspec/changes/other/tasks.md', '# Active unrelated work\n');
  write(root, 'openspec/specs/export/spec.md', '# Permanent spec\n');
  write(root, 'openspec/schemas/custom/schema.yaml', 'name: custom\n');
  write(root, 'openspec/schemas/cliewen-delivery/templates/my-project-note.md', '# Unowned customization\n');
  const manifest = JSON.parse(read(root, manifestFile));
  const owned = Object.keys(manifest.files);
  const before = snapshot(root);
  assert.throws(() => uninstall(root, true), /--default-schema/);
  assert.deepEqual(snapshot(root), before);
  const preview = uninstall(root, true, 'spec-driven');
  assert.deepEqual(snapshot(root), before);
  assert.deepEqual(preview.writes, ['openspec/config.yaml']);
  assert.ok(preview.deletes.includes(manifestFile));
  assert.deepEqual(uninstall(root, false, 'spec-driven'), preview);
  for (const file of owned) assert.equal(fs.existsSync(path.join(root, file)), false, file);
  for (const [file, bytes] of Object.entries(before)) {
    const relative = file.split(path.sep).join('/');
    if (owned.includes(relative) || relative === manifestFile || relative === 'openspec/config.yaml') continue;
    assert.equal(fs.readFileSync(path.join(root, file)).toString('base64'), bytes, file);
  }
  assert.deepEqual(parse(read(root, 'openspec/config.yaml')), {schema: 'spec-driven', context: 'Keep my context'});
  assert.match(read(root, 'openspec/config.yaml'), /# Preserve this comment/);
  assert.match(read(root, 'openspec/config.yaml'), /# Project default/);
  assert.throws(() => uninstall(root), /no files removed/);
  init(root, false, false);
  assert.equal(nextId(root, 'export'), 'EXP-002', 'reinstall retains identity high-water mark');
});

test('uninstall preserves an unrelated default byte-for-byte and does not require valid Cliewen config', t => {
  const root = fixture(t, 'spec-driven');
  write(root, '.cliewen-openspec/config.yaml', 'legacy: unsupported-but-preserved\n');
  const cfg = read(root, 'openspec/config.yaml');
  assert.throws(() => uninstall(root, true, 'spec-driven'), /only supported when/);
  const result = uninstall(root);
  assert.deepEqual(result.writes, []);
  assert.equal(read(root, 'openspec/config.yaml'), cfg);
  assert.equal(read(root, '.cliewen-openspec/config.yaml'), 'legacy: unsupported-but-preserved\n');
});

test('uninstall blocks active explicit, inherited, and nested schema references', t => {
  for (const reference of ['explicit', 'inherited', 'nested', 'extension-alias']) {
    const root = fixture(t);
    const base = reference === 'nested' ? 'openspec/changes/group/active' : 'openspec/changes/active';
    write(root, `${base}/proposal.md`, '# Work in progress\n');
    if (reference !== 'inherited') write(root, `${base}/.openspec.yaml`, `schema: ${reference === 'extension-alias' ? 'CLIEWEN-DELIVERY.yml' : 'cliewen-delivery'}\n`);
    const before = snapshot(root);
    assert.throws(() => uninstall(root, false, 'spec-driven'), /Active change/);
    assert.deepEqual(snapshot(root), before);
  }
});

test('uninstall validates replacements through public OpenSpec CLI before mutation', t => {
  const root = fixture(t);
  for (const schema of ['cliewen-all', '../outside', 'missing-schema']) {
    const before = snapshot(root);
    assert.throws(() => uninstall(root, false, schema));
    assert.deepEqual(snapshot(root), before);
  }
  write(root, 'openspec/schemas/custom/schema.yaml', 'name: custom\nversion: 1\nartifacts:\n  - id: proposal\n    generates: proposal.md\n    template: proposal.md\n    description: Custom proposal\n    requires: []\n');
  write(root, 'openspec/schemas/custom/templates/proposal.md', '# Custom proposal\n');
  const preview = uninstall(root, true, 'custom');
  assert.deepEqual(preview.writes, ['openspec/config.yaml']);
  uninstall(root, false, 'custom');
  assert.equal(parse(read(root, 'openspec/config.yaml')).schema, 'custom');
  assert.equal(fs.existsSync(path.join(root, 'openspec/schemas/custom/templates/proposal.md')), true);
});

test('uninstall resolves an aliased default while preserving its unrelated anchor uses', t => {
  const root = fixture(t);
  write(root, 'openspec/config.yaml', '# Anchored project choices\nworkflow: &workflow cliewen-delivery\nschema: *workflow\nother: *workflow\n');
  assert.throws(() => uninstall(root, true), /--default-schema/);
  uninstall(root, false, 'spec-driven');
  const current = parse(read(root, 'openspec/config.yaml'));
  assert.deepEqual(current, {workflow: 'cliewen-delivery', schema: 'spec-driven', other: 'cliewen-delivery'});
  assert.match(read(root, 'openspec/config.yaml'), /&workflow/);
  assert.match(read(root, 'openspec/config.yaml'), /other: \*workflow/);
  const shared = fixture(t);
  write(shared, 'openspec/config.yaml', 'schema: &workflow cliewen-delivery\nother: *workflow\n');
  const before = snapshot(shared);
  assert.throws(() => uninstall(shared, false, 'spec-driven'), /other YAML values through shared anchors/);
  assert.deepEqual(snapshot(shared), before);
});

test('uninstall refuses edited resources and invalid ownership without changing files', t => {
  const root = fixture(t, 'spec-driven');
  const original = JSON.parse(read(root, manifestFile));
  const owned = Object.keys(original.files)[0];
  const text = read(root, owned);
  write(root, owned, text + '\nLocal edit\n');
  let before = snapshot(root);
  assert.throws(() => uninstall(root), /local edits/); assert.deepEqual(snapshot(root), before);
  write(root, owned, text.replaceAll('\n', '\r\n'));
  for (const mutate of [
    m => { m.version = '9.0.0'; },
    m => { m.files['docs/authored.md'] = 'a'.repeat(64); },
    m => { m.files['../outside'] = 'a'.repeat(64); },
    m => { m.files[owned] = 'invalid'; },
  ]) {
    const m = structuredClone(original); mutate(m); write(root, manifestFile, JSON.stringify(m)); before = snapshot(root);
    assert.throws(() => uninstall(root)); assert.deepEqual(snapshot(root), before);
  }
  write(root, manifestFile, JSON.stringify(original));
  fs.unlinkSync(path.join(root, owned));
  uninstall(root);
  assert.equal(fs.existsSync(path.join(root, manifestFile)), false, 'missing owned files do not prevent cleanup');
});

test('uninstall rollback restores deleted resources, manifest, and default after publication failure', t => {
  const root = fixture(t); const before = snapshot(root);
  const unlink = fs.unlinkSync;
  let failed = false;
  fs.unlinkSync = function(file) {
    if (!failed && path.resolve(String(file)) === path.join(root, manifestFile)) { failed = true; throw Error('Injected manifest deletion failure'); }
    return unlink.call(this, file);
  };
  try { assert.throws(() => uninstall(root, false, 'spec-driven'), /Injected manifest deletion failure/); }
  finally { fs.unlinkSync = unlink; }
  assert.equal(failed, true); assert.deepEqual(snapshot(root), before);
});

test('uninstall CLI handles dry-run, recovery, and option boundaries', t => {
  const root = fixture(t, 'spec-driven');
  const run = (args, code = 0) => {
    const r = spawnSync(process.execPath, [cli, ...args, '--root', root, '--json'], {encoding: 'utf8'});
    assert.equal(r.status, code, `${r.stdout}\n${r.stderr}`); return JSON.parse(r.stdout);
  };
  const before = snapshot(root);
  assert.equal(run(['uninstall', '--dry-run']).dryRun, true); assert.deepEqual(snapshot(root), before);
  write(root, '.cliewen-openspec/transaction.json', JSON.stringify({files: {'docs/interrupted.md': null}}));
  write(root, 'docs/interrupted.md', 'partial\n');
  const interrupted = snapshot(root);
  run(['uninstall', '--dry-run'], 2); assert.deepEqual(snapshot(root), interrupted);
  const result = run(['uninstall']);
  assert.ok(result.deletes.includes(manifestFile));
  assert.equal(fs.existsSync(path.join(root, 'docs/interrupted.md')), false);
  run(['uninstall'], 2);
  run(['update', '--default-schema', 'spec-driven'], 2);
  run(['uninstall', '--default'], 2);
});
