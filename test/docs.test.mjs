import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parse, stringify } from 'yaml';

const project = fileURLToPath(new URL('../', import.meta.url));
test('documented CSV consumer commands pass from packed install through archive', {timeout: 120000}, t => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'cliewen-docs-'));
  t.after(() => fs.rmSync(temp, {recursive: true, force: true}));
  const checkout = path.join(temp, 'cliewen-openspec'), pilot = path.join(temp, 'cliewen-pilot');
  fs.mkdirSync(path.join(checkout, 'scripts'), {recursive: true});
  fs.cpSync(path.join(project, 'docs/examples/csv'), path.join(checkout, 'docs/examples/csv'), {recursive: true});
  fs.copyFileSync(path.join(project, 'scripts/copy-csv-example.mjs'), path.join(checkout, 'scripts/copy-csv-example.mjs'));
  const npm = process.env.npm_execpath;
  assert.ok(npm, 'Run through npm test');
  const npx = path.join(path.dirname(npm), 'npx-cli.js');
  let cwd = checkout;
  function run(exe, args, expected = 0, directory = cwd) {
    const env = {...process.env, OPENSPEC_TELEMETRY: '0', CI: '1', npm_config_cache: path.join(checkout, 'node_modules/.cache/npm')}; delete env.NODE_TEST_CONTEXT;
    const r = spawnSync(exe, args, {cwd: directory, env, encoding: 'utf8', timeout: 60000});
    assert.equal(r.status, expected, `${exe} ${args.join(' ')}\n${r.stdout}\n${r.stderr}\n${r.error ?? ''}`);
    return r.stdout;
  }
  run(process.execPath, [npm, 'pack', '--ignore-scripts', '--pack-destination', checkout], 0, project);
  const text = fs.readFileSync(path.join(project, 'docs/guide/getting-started.md'), 'utf8');
  const blocks = [...text.matchAll(/```sh\r?\n([\s\S]*?)```/g)].map(m => m[1].trim().split(/\r?\n/));
  function line(command) {
    const args = command.match(/"[^"]*"|\S+/g).map(s => s.replace(/^"|"$/g, ''));
    const executable = args.shift();
    if (executable === 'cd') { cwd = path.resolve(cwd, args[0]); return; }
    if (executable === 'mkdir') { fs.mkdirSync(path.join(cwd, args[0])); return; }
    if (executable === 'npm') return run(process.execPath, [npm, ...args]);
    if (executable === 'npx') return run(process.execPath, [npx, ...args]);
    if (executable === 'node') return run(process.execPath, args);
    if (executable === 'git') return run('git', args);
    throw Error(`Unsupported guide command: ${command}`);
  }
  // The source checkout is represented by this build's packed tarball; replay the consumer blocks verbatim.
  for (const command of blocks[1]) line(command);
  assert.equal(cwd, pilot);
  run('git', ['config', 'user.name', 'Documentation fixture']);
  run('git', ['config', 'user.email', 'docs@example.invalid']);
  fs.writeFileSync(path.join(pilot, '.gitignore'), 'node_modules/\n');
  for (const command of blocks[2]) line(command);
  const configPath = path.join(pilot, '.cliewen-openspec/config.yaml');
  const config = parse(fs.readFileSync(configPath, 'utf8'));
  Object.assign(config, parse(fs.readFileSync(path.join(checkout, 'docs/examples/csv/config.yaml'), 'utf8')));
  fs.writeFileSync(configPath, stringify(config));
  for (const command of blocks[3]) line(command);
  const allocate = blocks[3].at(-1);
  for (let n = 2; n <= 6; n++) assert.equal(line(allocate).trim(), `EXP-${String(n).padStart(3, '0')}`);
  for (const block of blocks.slice(4, -1)) for (const command of block) line(command);
  const reportPath = path.join(pilot, '.cliewen-openspec/evidence.json');
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  assert.equal(report.results.length, 6);
  assert.deepEqual(report.scope, {change: 'add-csv-export'});
  assert.ok(report.results.every(r => r.outcome === 'passed'));
  const archive = blocks.at(-1);
  for (const command of archive.slice(0, 3)) line(command);
  const cli = path.join(pilot, 'node_modules/cliewen-openspec/dist/cli.js');
  const stale = JSON.parse(run(process.execPath, [cli, 'check', '--json'], 1));
  assert.ok(stale.findings.some(f => f.code === 'stale-evidence'));
  for (const command of archive.slice(3)) line(command);
  const final = JSON.parse(run(process.execPath, [cli, 'check', '--json']));
  assert.equal(final.ok, true);
  const permanent = fs.readFileSync(path.join(pilot, 'openspec/specs/csv-export/spec.md'), 'utf8');
  for (let n = 1; n <= 6; n++) assert.ok(permanent.includes(`[EXP-${String(n).padStart(3, '0')}]`));
  assert.equal(run('git', ['status', '--porcelain']).trim(), '');
});
