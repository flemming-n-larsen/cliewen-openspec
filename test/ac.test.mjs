import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { stringify } from 'yaml';
import { init, config, nextId, renamePrefix, capabilityForPrefix, check } from '../dist/core.js';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cliewen-ac-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const p of ['openspec/specs', 'openspec/changes']) fs.mkdirSync(path.join(root, p), {recursive: true});
  init(root, false, false);
  return root;
}
const cp = root => path.join(root, '.cliewen-openspec/config.yaml');
const rp = root => path.join(root, '.cliewen-openspec/ac-registry.json');
const configure = (root, capabilities) => fs.writeFileSync(cp(root), stringify({ac: {capabilities}, features: {evidence: false}}));
const registry = root => JSON.parse(fs.readFileSync(rp(root), 'utf8'));

test('capability sequences survive prefix changes and preserve existing references', t => {
  const root = fixture(t); configure(root, {'csv-export': 'EXP', support: 'SUP'});
  const spec = path.join(root, 'openspec/specs/export.md');
  const content = '#### Scenario: Existing export [EXP-017]\n';
  fs.writeFileSync(spec, content);
  renamePrefix(root, 'csv-export', 'EXPORT');
  assert.equal(config(root).ac.capabilities['csv-export'], 'EXPORT');
  assert.equal(nextId(root, 'csv-export'), 'EXPORT-018');
  assert.equal(nextId(root, 'support'), 'SUP-001');
  assert.equal(fs.readFileSync(spec, 'utf8'), content);
  assert.throws(() => capabilityForPrefix(root, 'EXP'), /Retired prefix.*EXPORT/);
  assert.equal(capabilityForPrefix(root, 'EXPORT'), 'csv-export');
  renamePrefix(root, 'csv-export', 'CSV');
  fs.unlinkSync(spec);
  assert.equal(nextId(root, 'csv-export'), 'CSV-019');
  assert.deepEqual(registry(root).capabilities['csv-export'].previousPrefixes, ['EXP', 'EXPORT']);
  for (const reserved of ['EXP', 'EXPORT', 'SUP']) assert.throws(() => renamePrefix(root, 'csv-export', reserved), /reserved/);
});

test('manual prefix edits, deleted capabilities, and unrelated prefix claims are rejected', t => {
  const root = fixture(t); configure(root, {'csv-export': 'EXP'});
  nextId(root, 'csv-export');
  const original = fs.readFileSync(rp(root), 'utf8');
  configure(root, {'csv-export': 'EXPORT'});
  assert.throws(() => nextId(root, 'csv-export'), /rename-prefix/);
  assert.ok(check(root).some(f => f.code === 'invalid-ac-registry'));
  assert.equal(fs.readFileSync(rp(root), 'utf8'), original);
  configure(root, {support: 'EXP'});
  assert.throws(() => nextId(root, 'support'), /reserved/);
  configure(root, {});
  assert.ok(!check(root).some(f => f.code === 'invalid-ac-registry'));
  assert.equal(fs.readFileSync(rp(root), 'utf8'), original, 'removed capabilities retain their reservations');
  configure(root, {'csv-export': 'EXP'});
  fs.writeFileSync(path.join(root, 'openspec/changes/history.md'), '[OLD-099]');
  assert.throws(() => renamePrefix(root, 'csv-export', 'OLD'), /already occurs/);
  assert.throws(() => nextId(root, 'unknown'), /Unknown capability/);
});

test('legacy prefix counters migrate without losing allocated or unassigned numbers', t => {
  const root = fixture(t); configure(root, {'csv-export': 'EXP'});
  fs.writeFileSync(rp(root), JSON.stringify({EXP: 17, OLD: 42}));
  const before = fs.readFileSync(rp(root), 'utf8');
  assert.ok(!check(root).some(f => f.code === 'invalid-ac-registry'));
  assert.equal(fs.readFileSync(rp(root), 'utf8'), before, 'check does not migrate the registry');
  renamePrefix(root, 'csv-export', 'EXPORT');
  assert.equal(nextId(root, 'csv-export'), 'EXPORT-018');
  assert.equal(registry(root).unassignedPrefixes.OLD, 42);
  assert.throws(() => renamePrefix(root, 'csv-export', 'OLD'), /reserved/);
});

test('failed prefix rename restores both config and registry and preserves comments', t => {
  const root = fixture(t); configure(root, {'csv-export': 'EXP'});
  fs.appendFileSync(cp(root), '# Keep this comment\n');
  nextId(root, 'csv-export');
  const beforeConfig = fs.readFileSync(cp(root), 'utf8');
  const beforeRegistry = fs.readFileSync(rp(root), 'utf8');
  const originalWrite = fs.writeFileSync;
  let fail = true;
  const mock = t.mock.method(fs, 'writeFileSync', function(file, ...args) {
    if (file === rp(root) && fail) { fail = false; throw Error('Simulated write failure'); }
    return originalWrite.call(fs, file, ...args);
  });
  assert.throws(() => renamePrefix(root, 'csv-export', 'EXPORT'), /Simulated/);
  assert.equal(fs.readFileSync(cp(root), 'utf8'), beforeConfig);
  assert.equal(fs.readFileSync(rp(root), 'utf8'), beforeRegistry);
  assert.equal(fs.existsSync(path.join(root, '.cliewen-openspec/transaction.json')), false);
  mock.mock.restore();
  renamePrefix(root, 'csv-export', 'EXPORT');
  assert.match(fs.readFileSync(cp(root), 'utf8'), /# Keep this comment/);
});

test('CLI requires a capability or registered prefix and rejects retired prefix allocation', t => {
  const root = fixture(t); configure(root, {'csv-export': 'EXP'});
  const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
  const run = args => spawnSync(process.execPath, [cli, ...args, '--root', root], {encoding: 'utf8'});
  assert.equal(run(['ac', 'next']).status, 2);
  assert.equal(run(['ac', 'next', '--capability', 'csv-export']).stdout.trim(), 'EXP-001');
  assert.equal(run(['ac', 'rename-prefix', 'csv-export', 'EXPORT']).status, 0);
  const old = run(['ac', 'next', 'EXP']);
  assert.equal(old.status, 2); assert.match(old.stderr, /Retired prefix/);
  assert.equal(run(['ac', 'next', 'EXPORT']).stdout.trim(), 'EXPORT-002');
  assert.equal(run(['ac', 'next', '--capability', 'csv-export', 'EXPORT']).status, 2);
});
