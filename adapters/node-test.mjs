#!/usr/bin/env node
// Reference adapter: run repository-owned Node tests tagged [PREFIX-001].
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { config, local } from '../dist/core.js';
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
try {
  if (git('status', '--porcelain', '--untracked-files=all')) throw Error('Commit project inputs before collecting evidence.');
  const revision = git('rev-parse', 'HEAD');
  const settings = config(process.cwd());
  const output = local(process.cwd(), settings.evidence.report);
  const ignored = spawnSync('git', ['check-ignore', '-q', '--', output]);
  if (ignored.status !== 0) throw Error('Evidence output must be Git-ignored and untracked before collecting results.');
  const files = process.argv.slice(2);
  if (!files.length || files.some(f => f.startsWith('-'))) throw Error('Pass explicit test file paths');
  // A failed/crashed new run must never leave an earlier passing report usable.
  if (fs.existsSync(output)) fs.unlinkSync(output);
  const run = spawnSync(process.execPath, ['--test', '--test-reporter=tap', ...files], { encoding: 'utf8' });
  if (run.error) throw run.error;
  process.stdout.write(run.stdout ?? ''); process.stderr.write(run.stderr ?? '');
  const results = [];
  for (const line of (run.stdout ?? '').split(/\r?\n/)) {
    const m = line.match(/^\s*(not ok|ok) \d+ - (.*\[([A-Z][A-Z0-9]*-\d+)\].*)$/);
    if (m) results.push({ scenario: m[3], test: m[2], outcome: /#\s*(SKIP|TODO)/i.test(m[2]) ? 'skipped' : m[1] === 'ok' ? 'passed' : 'failed' });
  }
  if (git('rev-parse', 'HEAD') !== revision || git('status', '--porcelain', '--untracked-files=all')) throw Error('Test execution changed repository inputs; evidence cannot be attributed to the original revision.');
  if (run.status === null) throw Error('Test runner did not complete; no report produced');
  if (!results.length) throw Error('No AC-tagged test results found; report not replaced');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify({ version: 1, revision, execution: { exitCode: run.status }, results }, null, 2) + '\n');
  process.exitCode = run.status === 0 ? 0 : 1;
} catch (e) { console.error(e.message); process.exitCode = 2; }
