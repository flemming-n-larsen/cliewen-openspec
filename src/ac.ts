import fs from 'node:fs';
import { parseDocument } from 'yaml';
import { config, local, markdowns, recover, transaction, type Config } from './core.js';

type Sequence = { prefix: string; previousPrefixes: string[]; highWater: number };
type Registry = { version: 2; capabilities: Record<string, Sequence>; unassignedPrefixes: Record<string, number> };
const registryPath = '.cliewen-openspec/ac-registry.json';
const configPath = '.cliewen-openspec/config.yaml';
const validPrefix = (s: string) => /^[A-Z][A-Z0-9]*$/.test(s);
const counter = (n: unknown) => Number.isSafeInteger(n) && (n as number) >= 0;
const read = (p: string) => fs.readFileSync(p, 'utf8');
const json = (o: unknown) => JSON.stringify(o, null, 2) + '\n';

// Read-only validation also prepares legacy prefix counters for adoption.
export function validateRegistry(root: string, c: Config): Registry {
  const dest = local(root, registryPath);
  const raw = fs.existsSync(dest) ? JSON.parse(read(dest)) : {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw Error('Invalid AC registry');
  let r: Registry;
  if (!Object.hasOwn(raw, 'version')) {
    if (Object.entries(raw).some(([p, n]) => !validPrefix(p) || !counter(n))) throw Error('Invalid legacy AC registry');
    r = { version: 2, capabilities: {}, unassignedPrefixes: { ...raw } };
    for (const [name, prefix] of Object.entries(c.ac.capabilities)) {
      if (Object.hasOwn(r.unassignedPrefixes, prefix)) {
        r.capabilities[name] = { prefix, previousPrefixes: [], highWater: r.unassignedPrefixes[prefix] };
        delete r.unassignedPrefixes[prefix];
      }
    }
  } else {
    if (raw.version !== 2) throw Error('Unsupported AC registry version');
    for (const map of [raw.capabilities, raw.unassignedPrefixes]) if (!map || typeof map !== 'object' || Array.isArray(map)) throw Error('Invalid AC registry mapping');
    r = raw as Registry;
  }
  const occupied = new Map<string, string>();
  for (const [name, record] of Object.entries(r.capabilities)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || !record || typeof record.prefix !== 'string' || !validPrefix(record.prefix) || !Array.isArray(record.previousPrefixes) || !counter(record.highWater)) throw Error('Invalid capability sequence');
    for (const prefix of [record.prefix, ...record.previousPrefixes]) {
      if (typeof prefix !== 'string' || !validPrefix(prefix) || occupied.has(prefix)) throw Error('Duplicate or invalid reserved AC prefix');
      occupied.set(prefix, name);
    }
  }
  for (const [prefix, n] of Object.entries(r.unassignedPrefixes)) {
    if (!validPrefix(prefix) || !counter(n) || occupied.has(prefix)) throw Error('Invalid unassigned AC prefix');
    occupied.set(prefix, '(legacy reservation)');
  }
  for (const [name, prefix] of Object.entries(c.ac.capabilities)) {
    if (Object.hasOwn(r.capabilities, name)) {
      if (r.capabilities[name].prefix !== prefix) throw Error(`Prefix mismatch for ${name}; restore ${r.capabilities[name].prefix} in config, then use ac rename-prefix ${name} ${prefix}`);
    } else {
      if (occupied.has(prefix)) throw Error(`AC prefix ${prefix} is reserved by ${occupied.get(prefix)}`);
      r.capabilities[name] = { prefix, previousPrefixes: [], highWater: 0 };
      occupied.set(prefix, name);
    }
  }
  return r;
}

function maximum(root: string, record: Sequence): number {
  let max = record.highWater;
  const prefixes = new Set([record.prefix, ...record.previousPrefixes]);
  for (const file of markdowns(local(root, 'openspec'))) {
    for (const m of read(file).matchAll(/\[([A-Z][A-Z0-9]*)-(\d+)\]/g)) {
      if (prefixes.has(m[1])) max = Math.max(max, Number(m[2]));
    }
  }
  if (!Number.isSafeInteger(max)) throw Error('AC sequence exhausted');
  return max;
}

export function nextId(root: string, capability: string): string {
  recover(root);
  const c = config(root), r = validateRegistry(root, c);
  if (!Object.hasOwn(c.ac.capabilities, capability)) throw Error(`Unknown capability: ${capability}; register it in ac.capabilities first`);
  const record = r.capabilities[capability];
  const next = maximum(root, record) + 1;
  if (!Number.isSafeInteger(next)) throw Error('AC sequence exhausted');
  record.highWater = next;
  transaction(root, { [registryPath]: json(r) });
  return `${record.prefix}-${String(next).padStart(c.ac.padding, '0')}`;
}

export function capabilityForPrefix(root: string, prefix: string): string {
  const c = config(root), r = validateRegistry(root, c);
  for (const [name, record] of Object.entries(r.capabilities)) {
    if (record.previousPrefixes.includes(prefix)) throw Error(`Retired prefix ${prefix}; use --capability ${name} (current prefix ${record.prefix})`);
  }
  const entry = Object.entries(c.ac.capabilities).find(([, p]) => p === prefix);
  if (!entry) throw Error(`No active capability owns prefix ${prefix}; register ac.capabilities and use --capability NAME`);
  return entry[0];
}

export function renamePrefix(root: string, capability: string, prefix: string) {
  recover(root);
  if (!validPrefix(prefix)) throw Error('Prefix must contain uppercase letters/digits and start with a letter');
  const c = config(root), r = validateRegistry(root, c);
  if (!Object.hasOwn(c.ac.capabilities, capability)) throw Error(`Unknown capability: ${capability}`);
  const record = r.capabilities[capability];
  if (record.prefix === prefix) return;
  if (Object.hasOwn(r.unassignedPrefixes, prefix) || Object.values(r.capabilities).some(v => v.prefix === prefix || v.previousPrefixes.includes(prefix))) throw Error(`AC prefix is already reserved: ${prefix}`);
  if (maximum(root, { prefix, previousPrefixes: [], highWater: 0 }) > 0) throw Error(`AC prefix already occurs in OpenSpec documents: ${prefix}`);
  record.highWater = maximum(root, record);
  record.previousPrefixes.push(record.prefix);
  record.prefix = prefix;
  const doc = parseDocument(read(local(root, configPath)));
  if (doc.errors.length) throw Error(doc.errors[0].message);
  doc.setIn(['ac', 'capabilities', capability], prefix);
  transaction(root, { [configPath]: doc.toString(), [registryPath]: json(r) });
}
