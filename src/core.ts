import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { parse, parseDocument, stringify } from 'yaml';
import { deliveryFiles } from './delivery.js';
import { discoveryFiles } from './discovery.js';
import { allFiles } from './all.js';
import { validateRegistry } from './ac.js';
export { nextId, renamePrefix, capabilityForPrefix } from './ac.js';

export const version = '0.1.0-alpha.1';
const state = '.cliewen-openspec';
const features = ['documentation', 'decisions', 'mermaid', 'planning', 'review', 'evidence'];
export type Config = { docsRoot: string; features: Record<string, boolean>; evidence: { report: string }; ac: { capabilities: Record<string, string>; padding: number }; testing: { placement: 'per-task' | 'end-of-change'; approach: 'flexible' | 'tdd'; types: Record<string, { description: string }> } };
export type Finding = { code: string; severity: 'error' | 'warning' | 'info'; message: string };
export function local(root: string, relative: string): string {
  if (!relative || path.isAbsolute(relative) || path.win32.parse(relative).root || relative.split(/[\\/]/).includes('..')) throw Error(`Unsafe repository path: ${relative}`);
  const target = path.resolve(root, relative);
  const within = path.relative(path.resolve(root), target);
  if (path.isAbsolute(within) || within === '..' || within.startsWith(`..${path.sep}`)) throw Error(`Unsafe repository path: ${relative}`);
  let cursor = root;
  for (const part of path.relative(root, target).split(path.sep)) {
    cursor = path.join(cursor, part);
    let entry: fs.Stats | undefined;
    try { entry = fs.lstatSync(cursor); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    if (entry?.isSymbolicLink()) throw Error(`Symlink not supported: ${relative}`);
  }
  return target;
}
// Owned Markdown/YAML may acquire CRLF when Git checks them out on Windows.
const normalize = (s: string) => s.replace(/\r\n/g, '\n');
const hash = (s: string) => createHash('sha256').update(normalize(s)).digest('hex');
const read = (p: string) => fs.readFileSync(p, 'utf8');
export function defaults(): Config {
  return { docsRoot: 'docs', features: Object.fromEntries(features.map(f => [f, true])), evidence: { report: '.cliewen-openspec/evidence.json' }, ac: { capabilities: {}, padding: 3 }, testing: { placement: 'per-task', approach: 'flexible', types: {
    Unit: { description: 'Isolated behavior without external dependencies' },
    Integration: { description: 'Interaction between components or dependencies' },
    E2E: { description: 'Complete user or system workflow' }
  } } };
}
function keys(o: unknown, allowed: string[], label: string): asserts o is Record<string, any> {
  if (!o || typeof o !== 'object' || Array.isArray(o)) throw Error(`${label} must be an object`);
  for (const key of Object.keys(o)) if (!allowed.includes(key)) throw Error(`Unknown ${label} key: ${key}`);
}
export function config(root: string): Config {
  const p = local(root, `${state}/config.yaml`);
  const raw = parse(read(p)); keys(raw, ['docsRoot', 'features', 'evidence', 'ac', 'testing'], 'config');
  const c = defaults();
  if (raw.ac !== undefined) {
    keys(raw.ac, ['capabilities', 'padding'], 'ac');
    if (raw.ac.capabilities !== undefined) {
      if (!raw.ac.capabilities || typeof raw.ac.capabilities !== 'object' || Array.isArray(raw.ac.capabilities)) throw Error('ac.capabilities must be a capability-to-prefix mapping');
      const prefixes = new Set<string>();
      for (const [name, prefix] of Object.entries(raw.ac.capabilities)) {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || typeof prefix !== 'string' || !/^[A-Z][A-Z0-9]*$/.test(prefix)) throw Error('AC mappings require kebab-case capabilities and uppercase letter/digit prefixes');
        if (prefixes.has(prefix)) throw Error(`AC prefix already assigned: ${prefix}`);
        prefixes.add(prefix);
      }
      c.ac.capabilities = raw.ac.capabilities;
    }
    if (raw.ac.padding !== undefined) {
      if (!Number.isInteger(raw.ac.padding) || raw.ac.padding < 1 || raw.ac.padding > 12) throw Error('ac.padding must be an integer from 1 to 12');
      c.ac.padding = raw.ac.padding;
    }
  }
  if (raw.testing !== undefined) {
    keys(raw.testing, ['placement', 'approach', 'types'], 'testing');
    if (raw.testing.types !== undefined) {
      const types = raw.testing.types;
      if (!types || typeof types !== 'object' || Array.isArray(types) || !Object.keys(types).length) throw Error('testing.types must be a nonempty name-to-description mapping');
      for (const [name, definition] of Object.entries(types)) {
        if (!name.trim() || name !== name.trim() || /[\r\n\[\]]/.test(name)) throw Error('Test type names must be nonempty, trimmed, single-line names without brackets');
        keys(definition, ['description'], `testing.types.${name}`);
        if (typeof definition.description !== 'string' || !definition.description.trim()) throw Error(`testing.types.${name}.description must be a nonempty string`);
      }
      c.testing.types = types;
    }
    if (raw.testing.placement !== undefined) {
      if (!['per-task', 'end-of-change'].includes(raw.testing.placement)) throw Error('testing.placement must be per-task or end-of-change');
      c.testing.placement = raw.testing.placement;
    }
    if (raw.testing.approach !== undefined) {
      if (!['flexible', 'tdd'].includes(raw.testing.approach)) throw Error('testing.approach must be flexible or tdd');
      c.testing.approach = raw.testing.approach;
    }
  }
  if (c.testing.approach === 'tdd' && c.testing.placement !== 'per-task') throw Error('testing.approach tdd requires testing.placement per-task');
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
export function transaction(root: string, writes: Record<string, string | null>, dryRun = false) {
  const jp = local(root, `${state}/transaction.json`);
  if (fs.existsSync(jp)) throw Error('Interrupted transaction exists; run recover before writing.');
  for (const p of Object.keys(writes)) local(root, p);
  if (dryRun || !Object.keys(writes).length) return Object.keys(writes);
  const journal: Journal = { files: Object.fromEntries(Object.keys(writes).map(p => [p, fs.existsSync(local(root, p)) ? read(local(root, p)) : null])) };
  fs.mkdirSync(path.dirname(jp), { recursive: true });
  fs.writeFileSync(jp, JSON.stringify(journal), { flag: 'wx' });
  try {
    for (const [p, content] of Object.entries(writes)) {
      const dest = local(root, p);
      if (content === null) { if (fs.existsSync(dest)) fs.unlinkSync(dest); }
      else { fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, content); }
    }
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
function bundledFiles(): Record<string, string> { return {...deliveryFiles(), ...discoveryFiles(), ...allFiles()}; }
function manifestText(files: Record<string, string>): string {
  return JSON.stringify({version, files: Object.fromEntries(Object.entries(files).map(([file, content]) => [file, hash(content)]))}, null, 2) + '\n';
}

export function update(root: string, dryRun = false): { writes: string[]; deletes: string[] } {
  if (!fs.existsSync(local(root, 'openspec/specs')) || !fs.existsSync(local(root, 'openspec/changes'))) throw Error('Run openspec init first (specs and changes directories are required).');
  if (!dryRun) recover(root);
  const manifestPath = `${state}/manifest.json`;
  const mp = local(root, manifestPath);
  if (!fs.existsSync(mp)) throw Error('No Cliewen installation manifest; run init first. Update does not adopt unowned files.');
  const previous = JSON.parse(read(mp));
  keys(previous, ['version', 'files'], 'manifest');
  if (previous.version !== version) throw Error(`Unsupported installed version: ${previous.version}; update currently supports ${version} manifests only`);
  if (!previous.files || typeof previous.files !== 'object' || Array.isArray(previous.files) || !Object.keys(previous.files).length) throw Error('Manifest files must be a nonempty ownership mapping');
  for (const [file, digest] of Object.entries(previous.files)) {
    local(root, file);
    const owned = file === `${state}/templates/decision.md` || /^openspec\/schemas\/cliewen-(delivery|discovery|all)\/(schema\.yaml|templates\/[a-z0-9][a-z0-9-]*\.md)$/.test(file);
    if (!owned || typeof digest !== 'string' || !/^[a-f0-9]{64}$/.test(digest)) throw Error(`Invalid owned-file entry in manifest: ${file}`);
  }
  const settings = config(root);
  validateRegistry(root, settings);
  const files = bundledFiles();
  const changes: Record<string, string | null> = {};
  for (const [file, content] of Object.entries(files)) {
    const dest = local(root, file);
    const exists = fs.existsSync(dest);
    const oldHash = previous.files[file];
    if (exists && !oldHash) throw Error(`Unowned schema file already exists: ${file}; no update files written.`);
    if (exists) {
      const current = read(dest);
      if (hash(current) !== oldHash && normalize(current) !== normalize(content)) throw Error(`Conflict: ${file}; local edits differ from the update. No update files written.`);
      if (normalize(current) !== normalize(content)) changes[file] = content;
    } else changes[file] = content;
  }
  for (const [file, digest] of Object.entries(previous.files)) {
    if (Object.hasOwn(files, file)) continue;
    const dest = local(root, file);
    if (fs.existsSync(dest)) {
      if (hash(read(dest)) !== digest) throw Error(`Conflict: retired owned file ${file} has local edits. No update files written.`);
      changes[file] = null;
    }
  }
  // Publish new ownership only after every content change; rollback includes the old manifest.
  const manifest = manifestText(files);
  if (read(mp) !== manifest) changes[manifestPath] = manifest;
  transaction(root, changes, dryRun);
  return {writes: Object.keys(changes).filter(file => changes[file] !== null), deletes: Object.keys(changes).filter(file => changes[file] === null)};
}

export function init(root: string, dryRun: boolean, makeDefault: boolean) {
  if (!fs.existsSync(local(root, 'openspec/specs')) || !fs.existsSync(local(root, 'openspec/changes'))) throw Error('Run openspec init first (specs and changes directories are required).');
  if (!dryRun) recover(root);
  const mp = local(root, `${state}/manifest.json`);
  const previous: Manifest | undefined = fs.existsSync(mp) ? JSON.parse(read(mp)) : undefined;
  if (previous && previous.version !== version) throw Error('Installed version differs; use update for a supported installation or review migration requirements.');
  const files = bundledFiles(); const writes: Record<string, string> = {};
  for (const [p, content] of Object.entries(files)) {
    const dest = local(root, p);
    if (fs.existsSync(dest) && normalize(read(dest)) !== normalize(content)) throw Error(`Conflict: ${p}; no files written.`);
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
  const manifest = manifestText(files);
  if (!fs.existsSync(mp) || read(mp) !== manifest) writes[`${state}/manifest.json`] = manifest;
  return transaction(root, writes, dryRun);
}
export function markdowns(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? markdowns(path.join(dir, e.name)) : e.isFile() && e.name.endsWith('.md') ? [path.join(dir, e.name)] : []);
}
export function scenarios(root: string, change?: string): { id: string; title: string; file: string; testTypes: string[] }[] {
  if (change && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(change)) throw Error('Change must be a kebab-case name');
  const folder = change ? local(root, `openspec/changes/${change}/specs`) : local(root, 'openspec/specs');
  if (change && !fs.existsSync(folder)) throw Error(`Change specs do not exist: ${change}`);
  const out: { id: string; title: string; file: string; testTypes: string[] }[] = [];
  for (const file of markdowns(folder)) {
    let fence = false, removed = false;
    let current: (typeof out)[number] | undefined;
    for (const line of read(file).split(/\r?\n/)) {
      if (/^\s*(```|~~~)/.test(line)) { fence = !fence; continue; }
      if (fence) continue;
      if (/^#{1,4} /.test(line)) current = undefined;
      if (/^## /.test(line)) removed = /^## REMOVED Requirements/.test(line);
      if (!removed && /^#### Scenario:/.test(line)) {
        const m = line.match(/\[([A-Z][A-Z0-9]*-\d+)\]\s*$/);
        current = { id: m?.[1] ?? '', title: line, file: path.relative(root, file), testTypes: [] };
        out.push(current);
      }
      const type = line.match(/^Test-type:\s*(.*?)\s*$/);
      if (current && type) current.testTypes.push(type[1]);
    }
  }
  return out;
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
  try { validateRegistry(root, c); } catch (e) { add('invalid-ac-registry', e instanceof Error ? e.message : String(e)); }
  if (change && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(change)) {
    const metadata = local(root, `openspec/changes/${change}/.openspec.yaml`);
    const selection = fs.existsSync(metadata) ? parse(read(metadata)) : undefined;
    if (selection?.schema === 'cliewen-discovery') {
      if (c.features.evidence) add('discovery-review-required', 'Installation and registry checks only: review investigation sources, experiment outcomes, uncertainty, and the decision. Discovery findings do not prove product behavior.', 'info');
      else add('evidence-disabled', 'Evidence was explicitly disabled', 'info');
      return findings;
    }
    if (selection?.schema === 'cliewen-all') {
      const decisionPath = local(root, `openspec/changes/${change}/decision.md`);
      const frontmatter = fs.existsSync(decisionPath) ? read(decisionPath).match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/) : undefined;
      const decision = frontmatter ? parse(frontmatter[1]) : undefined;
      if (!decision || decision.type !== 'decision' || !['delivery', 'no-change', 'further-investigation'].includes(decision.outcome) || !['proposed', 'accepted'].includes(decision.status)) {
        add('all-decision-required', 'decision.md needs type: decision, status: proposed or accepted, and outcome: delivery, no-change, or further-investigation');
        return findings;
      }
      if (decision.outcome !== 'delivery') {
        if (selection.skip_specs !== true) add('all-outcome-conflict', 'A no-delivery outcome requires skip_specs: true in .openspec.yaml');
        if (markdowns(local(root, `openspec/changes/${change}/specs`)).length) add('all-outcome-conflict', 'A no-delivery outcome must not contain product spec deltas');
        add('discovery-review-required', 'No-delivery outcome: review investigation evidence and recommendation. Product execution evidence is not assessed.', 'info');
        return findings;
      }
      if (selection.skip_specs === true) { add('all-outcome-conflict', 'Delivery must not skip product specs'); return findings; }
      if (decision.status !== 'accepted') { add('all-decision-unaccepted', 'Delivery requires an accepted decision following human agreement; artifact completion is not approval'); return findings; }
    }
  }
  if (!c.features.evidence) { add('evidence-disabled', 'Evidence was explicitly disabled', 'info'); return findings; }
  const specs = scenarios(root, change); const ids = new Set<string>();
  for (const s of specs) { if (!s.id) add('missing-ac-id', `${s.file}: ${s.title}`); else if (ids.has(s.id)) add('duplicate-ac-id', s.id); else ids.add(s.id); }
  for (const s of specs) {
    if (s.testTypes.length !== 1 || !s.testTypes[0]) add('invalid-scenario-test-type', `${s.file}: ${s.id || s.title} requires exactly one nonempty Test-type line`);
    for (const type of s.testTypes) if (!Object.hasOwn(c.testing.types, type)) add('unknown-test-type', `${s.id}: ${type}`);
  }
  const reportPath = local(root, c.evidence.report);
  if (!fs.existsSync(reportPath)) { add('evidence-not-configured', `No report at ${c.evidence.report}`); return findings; }
  const report = JSON.parse(read(reportPath));
  if (!report || report.version !== 1 || typeof report.revision !== 'string' || !/^[a-f0-9]{40,64}$/.test(report.revision) || !Array.isArray(report.results)) throw Error('Invalid evidence report: expected version 1, full revision and results');
  if (report.scope !== undefined) {
    keys(report.scope, ['change'], 'evidence scope');
    if (typeof report.scope.change !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(report.scope.change)) throw Error('Invalid evidence scope: expected a kebab-case change name');
    if (report.scope.change !== change) add('evidence-scope-mismatch', `Report is scoped to ${report.scope.change}; check ${change ? `requests ${change}` : 'requests permanent specs'}`);
    if (report.execution === undefined) throw Error('Scoped evidence requires the complete test runner exit code');
  }
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
    if (typeof r.testType !== 'string' || !r.testType.trim()) add('missing-test-type', key);
    else if (!Object.hasOwn(c.testing.types, r.testType)) add('unknown-test-type', `${key}: ${r.testType}`);
    else {
      const scenario = specs.find(s => s.id === r.scenario);
      if (scenario?.testTypes.length === 1 && scenario.testTypes[0] !== r.testType) add('test-type-mismatch', `${key}: expected ${scenario.testTypes[0]}, received ${r.testType}`);
    }
    if (r.outcome === 'failed' || r.outcome === 'skipped') add(`test-${r.outcome}`, key);
    if (r.outcome === 'pending') { if (typeof r.reason !== 'string' || !r.reason.trim()) add('pending-without-reason', key); add('pending', `${key}: ${r.reason ?? ''}`, failPending ? 'error' : 'warning'); }
    if (r.outcome === 'manual') add('manual-verification', `${key}: ${r.reason ?? 'No review result recorded'}`, 'warning');
  }
  for (const id of ids) if (!seen.has(id)) add('missing-evidence', id);
  add('sufficiency-not-assessed', 'Execution and linkage do not prove assertion quality; review the assertions against the scenarios.', 'info');
  return findings;
}
