import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {parse, stringify} from 'yaml';

const root = fileURLToPath(new URL('../', import.meta.url));
test('evaluation plan covers shipped schemas without treating planned profiles as completed trials', t => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'cliewen-plan-cases-'));
  t.after(() => fs.rmSync(temp, {recursive: true, force: true}));
  const source = parse(fs.readFileSync(path.join(root, 'docs/testing/agent-evaluation.yaml'), 'utf8'));
  const run = (plan, expected) => {
    const file = path.join(temp, 'plan.yaml');
    fs.writeFileSync(file, stringify(plan));
    const result = spawnSync(process.execPath, ['scripts/check-agent-evaluation.mjs', file], {cwd: root, encoding: 'utf8', timeout: 30000});
    assert.equal(result.status, expected, `${result.stdout}\n${result.stderr}`);
    return result;
  };
  assert.match(run(source, 0).stdout, /does not run agents or certify release readiness/);
  for (const modify of [
    plan => { delete plan.schemas['cliewen-discovery']; },
    plan => { plan.schemas['cliewen-all'].status = 'implemented'; },
    plan => { plan.scenarios['csv-bom-tdd'].readiness = 'planned'; },
    plan => { plan.scenarios['csv-bom-tdd'].prompt = 'missing-prompt.md'; },
    plan => { plan.profiles['codex-cli-primary'].readiness = 'pinned'; },
    plan => { plan.schemas['cliewen-delivery'].releaseVariantProfile = 'missing-profile'; },
  ]) {
    const changed = structuredClone(source); modify(changed); run(changed, 1);
  }
});
