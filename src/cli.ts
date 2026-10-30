#!/usr/bin/env node
import path from 'node:path';
import { check, init, nextId, renamePrefix, capabilityForPrefix, recover, version } from './core.js';

const args = process.argv.slice(2);
const wantsJson = args.includes('--json');
function option(name: string) { const i = args.indexOf(name); if (i < 0) return undefined; const value = args[i + 1]; if (!value || value.startsWith('--')) throw Error(`Missing value for ${name}`); args.splice(i, 2); return value; }
function flag(name: string) { const i = args.indexOf(name); if (i < 0) return false; args.splice(i, 1); return true; }
try {
  const root = path.resolve(option('--root') ?? process.cwd());
  const json = flag('--json'), dry = flag('--dry-run'), makeDefault = flag('--default'), failPending = flag('--fail-on-pending');
  const change = option('--change');
  const capability = option('--capability');
  const command = args.shift();
  if (dry && command !== 'init') throw Error('--dry-run is supported only by init');
  if (makeDefault && command !== 'init') throw Error('--default is supported only by init');
  if ((change || failPending) && command !== 'check') throw Error('--change and --fail-on-pending are supported only by check');
  if (change && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(change)) throw Error('Change must be a kebab-case name');
  if (json && !['init', 'check'].includes(command ?? '')) throw Error('--json is supported only by init and check');
  if (capability && (command !== 'ac' || args[0] !== 'next')) throw Error('--capability is supported only by ac next');
  if (command === 'ac') {
    const action = args.shift();
    if (action === 'next') {
      if (capability ? args.length !== 0 : args.length !== 1) throw Error('Use ac next --capability NAME (or ac next PREFIX for a registered active prefix)');
      console.log(nextId(root, capability ?? capabilityForPrefix(root, args[0])));
    } else if (action === 'rename-prefix' && args.length === 2) {
      renamePrefix(root, args[0], args[1]); console.log(`Prefix updated for ${args[0]}: ${args[1]}`);
    } else throw Error('Use ac next --capability NAME or ac rename-prefix CAPABILITY PREFIX');
  }
  else if (args.length) throw Error(`Unexpected arguments: ${args.join(' ')}`);
  else if (command === '--version') console.log(version);
  else if (command === 'init') console.log(JSON.stringify({ dryRun: dry, writes: init(root, dry, makeDefault) }, null, 2));
  else if (command === 'recover') { if (!dry) recover(root); console.log('Recovery complete'); }
  else if (command === 'check') {
    const findings = check(root, change, failPending); const ok = !findings.some(f => f.severity === 'error');
    console.log(json ? JSON.stringify({ ok, findings }, null, 2) : findings.map(f => `${f.severity.toUpperCase()} ${f.code}: ${f.message}`).join('\n'));
    process.exitCode = ok ? 0 : 1;
  } else if (!command || command === '--help') console.log('cliewen-openspec (alpha)\ninit [--default] [--dry-run]\nac next --capability NAME\nac next PREFIX (registered active prefix only)\nac rename-prefix CAPABILITY PREFIX\ncheck [--change NAME] [--json] [--fail-on-pending]\nrecover\nAll commands accept --root PATH. update/uninstall are not implemented yet.');
  else throw Error(`Unknown command: ${command}`);
} catch (e) {
  const message = e instanceof Error ? e.message : String(e);
  if (wantsJson) console.log(JSON.stringify({ ok: false, error: message }));
  else console.error(message);
  process.exitCode = 2;
}
