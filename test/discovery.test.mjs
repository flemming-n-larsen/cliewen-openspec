import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const project = fileURLToPath(new URL('../', import.meta.url));
const openspec = path.join(project, 'node_modules/@fission-ai/openspec/bin/openspec.js');

test('packed discovery supports no-change closure and a separate delivery handoff', {timeout: 120000}, t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cliewen-discovery-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const env = {...process.env, OPENSPEC_TELEMETRY: '0', CI: '1', npm_config_cache: path.join(root, 'node_modules/.cache/npm')}; delete env.NODE_TEST_CONTEXT;
  function run(exe, args, cwd = root) {
    const r = spawnSync(exe, args, {cwd, env, encoding: 'utf8', timeout: 60000});
    assert.equal(r.status, 0, `${args.join(' ')}\n${r.stdout}\n${r.stderr}`); return r.stdout.trim();
  }
  const write = (file, text) => { fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true}); fs.writeFileSync(path.join(root, file), text); };
  const npm = process.env.npm_execpath; assert.ok(npm);
  const packed = JSON.parse(run(process.execPath, [npm, 'pack', '--json', '--ignore-scripts', '--pack-destination', root], project))[0];
  write('package.json', '{"private":true}');
  run(process.execPath, [npm, 'install', '--ignore-scripts', '--no-audit', '--no-fund', path.join(root, packed.filename)]);
  const ospec = (...args) => run(process.execPath, [openspec, ...args]);
  const cl = (...args) => JSON.parse(run(process.execPath, ['node_modules/cliewen-openspec/dist/cli.js', ...args]));
  ospec('init', '--tools', 'none', '--no-animation');
  write('openspec/config.yaml', '# Keep the project default\nschema: spec-driven\n');
  cl('init');
  assert.match(fs.readFileSync(path.join(root, 'openspec/config.yaml'), 'utf8'), /schema: spec-driven/);
  ospec('schema', 'validate', 'cliewen-discovery');
  ospec('schema', 'validate', 'cliewen-delivery');
  for (const change of ['investigate-cache', 'investigate-export']) {
    ospec('new', 'change', change, '--schema', 'cliewen-discovery');
    const status = () => JSON.parse(ospec('status', '--change', change, '--json'));
    assert.equal(status().artifacts.find(a => a.id === 'investigation').status, 'blocked');
    const base = `openspec/changes/${change}/`;
    for (const [artifact, content] of [
      ['proposal', '# Question\nIs a cache necessary? Investigate the current workload without production changes.\n'],
      ['investigation', '# Investigation\nCompare the current path and a cache. No benchmark run; conclusions are provisional.\n'],
      ['decision', `---\ntype: decision\nstatus: proposed\n---\n# Recommendation\n${change === 'investigate-cache' ? 'No change; reopen if measurements show a bottleneck.' : 'Delivery handoff: specify an optional export encoding marker in a separate change.'}\n`],
    ]) {
      const instructions = JSON.parse(ospec('instructions', artifact, '--change', change, '--json'));
      assert.match(instructions.instruction, /For all text/);
      assert.match(instructions.instruction, /Mermaid/);
      if (artifact === 'investigation') {
        assert.match(instructions.instruction, /verify that samples were taken during the operation/);
        assert.match(instructions.instruction, /Distinguish peak memory from retained memory/);
        assert.match(instructions.instruction, /report that quantity as unmeasured/);
      }
      write(base + `${artifact}.md`, content);
    }
    assert.equal(status().isComplete, true);
    const apply = JSON.parse(ospec('instructions', 'apply', '--change', change, '--json'));
    assert.match(apply.instruction, /does not authorize production implementation/);
    assert.match(apply.instruction, /proposed status until a human agrees/);
    const health = cl('check', '--change', change, '--json');
    assert.equal(health.ok, true);
    assert.ok(health.findings.some(f => f.code === 'discovery-review-required'));
    assert.ok(!health.findings.some(f => f.code === 'sufficiency-not-assessed'));
  }
  ospec('new', 'change', 'add-export-marker', '--schema', 'cliewen-delivery');
  const proposal = JSON.parse(ospec('instructions', 'proposal', '--change', 'add-export-marker', '--json'));
  assert.equal(proposal.schemaName, 'cliewen-delivery');
  assert.equal(JSON.parse(ospec('status', '--change', 'investigate-export', '--json')).schemaName, 'cliewen-discovery');
  ospec('archive', 'investigate-cache', '--skip-specs', '--yes');
  const archived = fs.readdirSync(path.join(root, 'openspec/changes/archive')).find(name => name.endsWith('-investigate-cache'));
  assert.ok(archived);
  assert.match(fs.readFileSync(path.join(root, 'openspec/changes/archive', archived, 'decision.md'), 'utf8'), /No change/);
  assert.deepEqual(fs.readdirSync(path.join(root, 'openspec/specs')).filter(name => name !== '.gitkeep'), []);
  write('.cliewen-openspec/config.yaml', 'features:\n  decisions: false\n');
  const decision = JSON.parse(ospec('instructions', 'decision', '--change', 'investigate-export', '--json'));
  assert.match(decision.instruction, /Disabling decisions removes the extra durable-record work/);
  const health = cl('check', '--change', 'investigate-export', '--json');
  assert.equal(health.ok, true);
  const schemaPath = path.join(root, 'openspec/schemas/cliewen-discovery/schema.yaml');
  fs.appendFileSync(schemaPath, '# modified\n');
  const checked = spawnSync(process.execPath, ['node_modules/cliewen-openspec/dist/cli.js', 'check', '--change', 'investigate-export', '--json'], {cwd: root, env, encoding: 'utf8'});
  assert.equal(checked.status, 1);
  assert.ok(JSON.parse(checked.stdout).findings.some(f => f.code === 'owned-file-modified'));
});
