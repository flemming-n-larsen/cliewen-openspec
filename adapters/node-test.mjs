#!/usr/bin/env node
// Reference adapter: run repository-owned Node tests tagged [PREFIX-001].
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { config, local, scenarios, markdowns } from '../dist/core.js';
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
try {
  if (git('status', '--porcelain', '--untracked-files=all')) throw Error('Commit project inputs before collecting evidence.');
  const revision = git('rev-parse', 'HEAD');
  const settings = config(process.cwd());
  const output = local(process.cwd(), settings.evidence.report);
  const ignored = spawnSync('git', ['check-ignore', '-q', '--', output]);
  if (ignored.status !== 0) throw Error('Evidence output must be Git-ignored and untracked before collecting results.');
  // A failed/crashed new run must never leave an earlier passing report usable.
  if (fs.existsSync(output)) fs.unlinkSync(output);
  const files = [];
  let change;
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--change') {
      if (change !== undefined || !args[i + 1] || args[i + 1].startsWith('-')) throw Error('Pass --change NAME once');
      change = args[++i];
    } else if (args[i].startsWith('-')) throw Error(`Unknown adapter option: ${args[i]}`);
    else files.push(args[i]);
  }
  if (!files.length) throw Error('Pass explicit test file paths');
  const selected = change === undefined ? undefined : new Set(scenarios(process.cwd(), change).map(s => s.id));
  let removedRequirements = 0, activeRequirements = 0;
  if (selected?.size === 0) for (const file of markdowns(local(process.cwd(), `openspec/changes/${change}/specs`))) {
    let fence = '', section = '';
    for (const line of fs.readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/)) {
      const boundary = line.match(/^\s*(`{3,}|~{3,})/);
      if (boundary) { if (!fence) fence = boundary[1]; else if (fence[0] === boundary[1][0] && boundary[1].length >= fence.length) fence = ''; continue; }
      if (fence) continue;
      if (/^## /.test(line)) section = line.trim();
      if (/^### Requirement:/.test(line)) { if (section === '## REMOVED Requirements') removedRequirements++; else activeRequirements++; }
    }
  }
  const retirementOnly = selected?.size === 0 && removedRequirements > 0 && activeRequirements === 0;
  if (selected && ((!selected.size && !retirementOnly) || selected.has(''))) throw Error('Selected change requires scenarios with AC IDs');
  const run = spawnSync(process.execPath, ['--test', '--test-reporter=tap', ...files], { encoding: 'utf8' });
  if (run.error) throw run.error;
  process.stdout.write(run.stdout ?? ''); process.stderr.write(run.stderr ?? '');
  const results = [];
  for (const line of (run.stdout ?? '').split(/\r?\n/)) {
    const m = line.match(/^\s*(not ok|ok) \d+ - (.*\[([A-Z][A-Z0-9]*-\d+)\].*)$/);
    if (m) {
      const tags = [...m[2].matchAll(/\[Test-type: ([^\]\r\n]+)\]/g)];
      if (tags.length !== 1 || !Object.hasOwn(settings.testing.types, tags[0][1])) throw Error(`Test ${m[2]} requires one configured [Test-type: NAME] tag`);
      const metadata = {};
      for (const [tag, field] of [['Case', 'caseId'], ['Coverage', 'coverage']]) {
        const values = [...m[2].matchAll(new RegExp(`\\[${tag}: ([^\\]\\r\\n]*)\\]`, 'g'))];
        if (values.length) metadata[field] = values.length === 1 ? values[0][1] : null;
      }
      if (!selected || selected.has(m[3])) results.push({ scenario: m[3], test: m[2], testType: tags[0][1], ...metadata, outcome: /#\s*(SKIP|TODO)/i.test(m[2]) ? 'skipped' : m[1] === 'ok' ? 'passed' : 'failed' });
    }
  }
  if (git('rev-parse', 'HEAD') !== revision || git('status', '--porcelain', '--untracked-files=all')) throw Error('Test execution changed repository inputs; evidence cannot be attributed to the original revision.');
  if (run.status === null) throw Error('Test runner did not complete; no report produced');
  if (!results.length && !retirementOnly) throw Error('No AC-tagged test results found for the selected scope; no report produced');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify({ version: 1, revision, ...(change === undefined ? {} : { scope: { change } }), execution: { exitCode: run.status }, results }, null, 2) + '\n');
  process.exitCode = run.status === 0 ? 0 : 1;
} catch (e) { console.error(e.message); process.exitCode = 2; }
