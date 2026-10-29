import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { parse, parseDocument, stringify } from 'yaml';
import { deliveryFiles } from './delivery.js';

export const version = '0.1.0-alpha.1';
const state = '.cliewen-openspec';
const features = ['documentation', 'decisions', 'mermaid', 'planning', 'review', 'evidence'];
export type Config = { docsRoot: string; features: Record<string, boolean>; evidence: { report: string } };
export type Finding = { code: string; severity: 'error' | 'warning' | 'info'; message: string };
export function local(root: string, relative: string): string {
  if (!relative || path.isAbsolute(relative) || relative.split(/[\\/]/).includes('..')) throw Error(`Unsafe repository path: ${relative}`);
  const target = path.resolve(root, relative);
  let cursor = root;
  for (const part of path.relative(root, target).split(path.sep)) {
    cursor = path.join(cursor, part);
    if (fs.existsSync(cursor) && fs.lstatSync(cursor).isSymbolicLink()) throw Error(`Symlink not supported: ${relative}`);
  }
  return target;
}
const hash = (s: string) => createHash('sha256').update(s).digest('hex');
const read = (p: string) => fs.readFileSync(p, 'utf8');
export function defaults(): Config {
  return { docsRoot: 'docs', features: Object.fromEntries(features.map(f => [f, true])), evidence: { report: '.cliewen-openspec/evidence.json' } };
}
function keys(o: unknown, allowed: string[], label: string): asserts o is Record<string, any> {
  if (!o || typeof o !== 'object' || Array.isArray(o)) throw Error(`${label} must be an object`);
  for (const key of Object.keys(o)) if (!allowed.includes(key)) throw Error(`Unknown ${label} key: ${key}`);
}
export function config(root: string): Config {
  const p = local(root, `${state}/config.yaml`);
  const raw = parse(read(p)); keys(raw, ['docsRoot', 'features', 'evidence'], 'config');
  const c = defaults();
  if (raw.docsRoot !== undefined) { if (typeof raw.docsRoot !== 'string') throw Error('docsRoot must be a string'); c.docsRoot = raw.docsRoot; }
  if (raw.features !== undefined) {
    keys(raw.features, features, 'features');
    for (const [k, v] of Object.entries(raw.features)) { if (typeof v !== 'boolean') throw Error(`features.${k} must be boolean`); c.features[k] = v; }
  }
  if (raw.evidence !== undefined) {
    keys(raw.evidence, ['report'], 'evidence');
    if (typeof raw.evidence.report !== 'string') throw Error('evidence.report must be a string');
    c.evidence.report = raw.evidence.report;
  }
  local(root, c.docsRoot); local(root, c.evidence.report); return c;
}
type Journal = { files: Record<string, string | null> };
export function transaction(root: string, writes: Record<string, string>, dryRun = false) {
  const jp = local(root, `${state}/transaction.json`);
  if (fs.existsSync(jp)) throw Error('Interrupted transaction exists; run recover before writing.');
  for (const p of Object.keys(writes)) local(root, p);
  if (dryRun || !Object.keys(writes).length) return Object.keys(writes);
  const journal: Journal = { files: Object.fromEntries(Object.keys(writes).map(p => [p, fs.existsSync(local(root, p)) ? read(local(root, p)) : null])) };
  fs.mkdirSync(path.dirname(jp), { recursive: true });
  fs.writeFileSync(jp, JSON.stringify(journal), { flag: 'wx' });
  try {
    for (const [p, content] of Object.entries(writes)) { const dest = local(root, p); fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, content); }
    fs.unlinkSync(jp);
  } catch (error) { recover(root); throw error; }
  return Object.keys(writes);
}
export function recover(root: string) {
  const jp = local(root, `${state}/transaction.json`);
  if (!fs.existsSync(jp)) return;
  const j = JSON.parse(read(jp)) as Journal;
  keys(j, ['files'], 'journal');
  if (!j.files || typeof j.files !== 'object' || Array.isArray(j.files)) throw Error('Invalid transaction journal');
  for (const [p, v] of Object.entries(j.files)) { local(root, p); if (v !== null && typeof v !== 'string') throw Error('Invalid journal content'); }
  for (const [p, v] of Object.entries(j.files)) {
    const dest = local(root, p);
    if (v === null) { if (fs.existsSync(dest)) fs.unlinkSync(dest); }
    else { fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, v); }
  }
  fs.unlinkSync(jp);
}
type Manifest = { version: string; files: Record<string, string> };
export function init(root: string, dryRun: boolean, makeDefault: boolean) {
  if (!fs.existsSync(local(root, 'openspec/specs')) || !fs.existsSync(local(root, 'openspec/changes'))) throw Error('Run openspec init first (specs and changes directories are required).');
  if (!dryRun) recover(root);
  const mp = local(root, `${state}/manifest.json`);
  const previous: Manifest | undefined = fs.existsSync(mp) ? JSON.parse(read(mp)) : undefined;
  if (previous && previous.version !== version) throw Error('Upgrade migration is not implemented in this alpha.');
  const files = deliveryFiles(); const writes: Record<string, string> = {};
  for (const [p, content] of Object.entries(files)) {
    const dest = local(root, p);
    if (fs.existsSync(dest) && read(dest) !== content) throw Error(`Conflict: ${p}; no files written.`);
    if (fs.existsSync(dest) && !previous?.files[p]) throw Error(`Unowned schema file already exists: ${p}`);
    if (!fs.existsSync(dest)) writes[p] = content;
  }
  const cp = `${state}/config.yaml`;
  if (!fs.existsSync(local(root, cp))) writes[cp] = stringify(defaults());
  else config(root);
  // Authored docs/config are never included in the owned-file manifest.
  const docsRoot = fs.existsSync(local(root, cp)) ? config(root).docsRoot : 'docs';
  const entry = `${docsRoot}/README.md`;
  if (!fs.existsSync(local(root, entry))) writes[entry] = '---\ntype: overview\n---\n# Project documentation\n\nKeep architecture/, design/, decisions/, testing/ and optional plans/ here as needed. Link to OpenSpec specs for behavior. Do not invent project intent.\n';
  const ignore = `${state}/.gitignore`;
  if (!fs.existsSync(local(root, ignore))) writes[ignore] = 'evidence.json\ntransaction.json\n';
  const cfgPath = 'openspec/config.yaml';
  const original = fs.existsSync(local(root, cfgPath)) ? read(local(root, cfgPath)) : '';
  if (makeDefault) {
    const doc = parseDocument(original || '{}'); if (doc.errors.length) throw Error(doc.errors[0].message);
    doc.set('schema', 'cliewen-delivery'); const next = doc.toString(); if (next !== original) writes[cfgPath] = next;
  }
  const manifest = JSON.stringify({ version, files: Object.fromEntries(Object.entries(files).map(([p, c]) => [p, hash(c)])) }, null, 2) + '\n';
  if (!fs.existsSync(mp) || read(mp) !== manifest) writes[`${state}/manifest.json`] = manifest;
  return transaction(root, writes, dryRun);
}
function markdowns(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? markdowns(path.join(dir, e.name)) : e.isFile() && e.name.endsWith('.md') ? [path.join(dir, e.name)] : []);
}
export function scenarios(root: string, change?: string): { id: string; title: string; file: string }[] {
  if (change && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(change)) throw Error('Change must be a kebab-case name');
  const folder = change ? local(root, `openspec/changes/${change}/specs`) : local(root, 'openspec/specs');
  if (change && !fs.existsSync(folder)) throw Error(`Change specs do not exist: ${change}`);
  const out: { id: string; title: string; file: string }[] = [];
  for (const file of markdowns(folder)) {
    let fence = false, removed = false;
    for (const line of read(file).split(/\r?\n/)) {
      if (/^\s*(```|~~~)/.test(line)) { fence = !fence; continue; }
      if (fence) continue;
      if (/^## /.test(line)) removed = /^## REMOVED Requirements/.test(line);
      if (!removed && /^#### Scenario:/.test(line)) {
        const m = line.match(/\[([A-Z][A-Z0-9]*-\d{3,})\]\s*$/);
        out.push({ id: m?.[1] ?? '', title: line, file: path.relative(root, file) });
      }
    }
  }
  return out;
}
export function nextId(root: string, prefix: string): string {
  if (!/^[A-Z][A-Z0-9]*$/.test(prefix)) throw Error('Prefix must contain uppercase letters/digits and start with a letter');
  config(root); recover(root);
  const p = `${state}/ac-registry.json`; const dest = local(root, p);
  const registry: Record<string, number> = fs.existsSync(dest) ? JSON.parse(read(dest)) : {};
  if (!registry || typeof registry !== 'object' || Array.isArray(registry) || Object.values(registry).some(n => !Number.isSafeInteger(n) || n < 0)) throw Error('Invalid AC registry');
  let max = registry[prefix] ?? 0;
  for (const file of markdowns(local(root, 'openspec'))) for (const m of read(file).matchAll(new RegExp('\\[' + prefix + '-(\\d+)\\]', 'g'))) max = Math.max(max, Number(m[1]));
  if (!Number.isSafeInteger(max + 1)) throw Error('AC sequence exhausted');
  registry[prefix] = max + 1;
  transaction(root, { [p]: JSON.stringify(registry, null, 2) + '\n' });
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}
export function git(root: string, args: string[]): string { return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim(); }
export function check(root: string, change?: string, failPending = false): Finding[] {
  const findings: Finding[] = []; const add = (code: string, message: string, severity: Finding['severity'] = 'error') => findings.push({ code, severity, message });
  const c = config(root);
  if (fs.existsSync(local(root, `${state}/transaction.json`))) add('interrupted-transaction', 'Run recover before continuing');
  const mp = local(root, `${state}/manifest.json`);
  if (!fs.existsSync(mp)) add('not-installed', 'Run init');
  else {
    const m: Manifest = JSON.parse(read(mp));
    for (const [p, h] of Object.entries(m.files)) if (!fs.existsSync(local(root, p)) || hash(read(local(root, p))) !== h) add('owned-file-modified', p);
  }
  if (!c.features.evidence) { add('evidence-disabled', 'Evidence was explicitly disabled', 'info'); return findings; }
  const specs = scenarios(root, change); const ids = new Set<string>();
  for (const s of specs) { if (!s.id) add('missing-ac-id', `${s.file}: ${s.title}`); else if (ids.has(s.id)) add('duplicate-ac-id', s.id); else ids.add(s.id); }
  const reportPath = local(root, c.evidence.report);
  if (!fs.existsSync(reportPath)) { add('evidence-not-configured', `No report at ${c.evidence.report}`); return findings; }
  const report = JSON.parse(read(reportPath));
  if (!report || report.version !== 1 || typeof report.revision !== 'string' || !/^[a-f0-9]{40,64}$/.test(report.revision) || !Array.isArray(report.results)) throw Error('Invalid evidence report: expected version 1, full revision and results');
  if (report.execution !== undefined && (!report.execution || !Number.isInteger(report.execution.exitCode))) throw Error('Invalid evidence execution result');
  if (report.execution?.exitCode !== undefined && report.execution.exitCode !== 0) add('runner-failed', `Test runner exited ${report.execution.exitCode}`);
  try {
    if (git(root, ['rev-parse', 'HEAD']) !== report.revision) add('stale-evidence', 'Report revision differs from HEAD');
    if (git(root, ['status', '--porcelain', '--untracked-files=all'])) add('unverifiable-evidence', 'Working tree is not clean');
  } catch { add('unverifiable-evidence', 'Cannot establish Git revision'); }
  const seen = new Set<string>(); const tests = new Set<string>();
  for (const r of report.results) {
    if (!r || typeof r.scenario !== 'string' || typeof r.test !== 'string' || !r.test || !['passed','failed','skipped','pending','manual'].includes(r.outcome)) throw Error('Invalid evidence result');
    const key = `${r.scenario}:${r.test}`; if (tests.has(key)) add('duplicate-test-result', key); tests.add(key);
    if (!ids.has(r.scenario)) add('unknown-ac-reference', r.scenario); else seen.add(r.scenario);
    if (r.outcome === 'failed' || r.outcome === 'skipped') add(`test-${r.outcome}`, key);
    if (r.outcome === 'pending') { if (typeof r.reason !== 'string' || !r.reason.trim()) add('pending-without-reason', key); add('pending', `${key}: ${r.reason ?? ''}`, failPending ? 'error' : 'warning'); }
    if (r.outcome === 'manual') add('manual-verification', `${key}: ${r.reason ?? 'No review result recorded'}`, 'warning');
  }
  for (const id of ids) if (!seen.has(id)) add('missing-evidence', id);
  add('sufficiency-not-assessed', 'Execution and linkage do not prove assertion quality; review the assertions against the scenarios.', 'info');
  return findings;
}
