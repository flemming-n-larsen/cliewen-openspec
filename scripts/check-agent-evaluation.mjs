import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {parse} from 'yaml';
import {init} from '../dist/core.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
assert.ok(args.length <= 1, 'Use node scripts/check-agent-evaluation.mjs [PLAN_FILE]');
const plan = parse(fs.readFileSync(path.resolve(args[0] ?? path.join(root, 'docs/testing/agent-evaluation.yaml')), 'utf8'));
assert.equal(plan.version, 1);
for (const name of ['profiles', 'scenarios', 'schemas']) assert.ok(plan[name] && typeof plan[name] === 'object' && !Array.isArray(plan[name]), `${name} must be a mapping`);
const reference = (file, label) => {
  assert.ok(typeof file === 'string' && file && !path.isAbsolute(file) && !path.win32.parse(file).root && !file.split(/[\\/]/).includes('..'), `${label}: expected repository-relative file`);
  assert.ok(fs.statSync(path.join(root, file)).isFile(), `${label}: file does not exist`);
};
for (const [id, profile] of Object.entries(plan.profiles)) {
  assert.ok(['observed-only', 'unconfigured', 'pinned'].includes(profile.readiness), `${id}: invalid profile readiness`);
  for (const field of ['agent', 'runner']) assert.ok(typeof profile[field] === 'string' && profile[field], `${id}: missing ${field}`);
  if (profile.readiness === 'pinned') {
    for (const field of ['model', 'agentVersion', 'provider', 'effort', 'permissions', 'context', 'budgets', 'traceFormat']) assert.ok(profile[field] !== null && profile[field] !== undefined && profile[field] !== '', `${id}: pinned profile missing ${field}`);
  }
}
for (const [id, scenario] of Object.entries(plan.scenarios)) {
  assert.ok(Object.hasOwn(plan.schemas, scenario.schema), `${id}: unknown schema`);
  assert.ok(['ready', 'planned'].includes(scenario.readiness), `${id}: invalid scenario readiness`);
  if (scenario.readiness === 'ready') {
    for (const field of ['prepare', 'checker', 'prompt', 'rubric']) reference(scenario[field], `${id}.${field}`);
  }
  for (const report of scenario.observedResults ?? []) reference(report, `${id}.observedResults`);
}
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'cliewen-evaluation-plan-'));
let shipped;
try {
  for (const folder of ['openspec/specs', 'openspec/changes']) fs.mkdirSync(path.join(temp, folder), {recursive: true});
  shipped = init(temp, true, false).flatMap(file => {
    const match = file.match(/^openspec\/schemas\/([^/]+)\/schema\.yaml$/);
    return match ? [match[1]] : [];
  });
} finally {
  const relative = path.relative(os.tmpdir(), temp);
  assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative));
  fs.rmSync(temp, {recursive: true, force: true});
}
for (const name of shipped) assert.equal(plan.schemas[name]?.status, 'implemented', `Shipped schema missing from implemented evaluation coverage: ${name}`);
for (const [name, schema] of Object.entries(plan.schemas)) {
  assert.ok(['implemented', 'planned'].includes(schema.status), `${name}: invalid status`);
  if (schema.status === 'implemented') assert.ok(shipped.includes(name), `${name}: marked implemented but not installed`);
  assert.ok(Object.hasOwn(plan.profiles, schema.developmentProfile), `${name}: unknown development profile`);
  const primary = plan.scenarios[schema.developmentScenario];
  assert.equal(primary?.schema, name, `${name}: missing or wrong development scenario`);
  if (schema.status === 'implemented') assert.equal(primary.readiness, 'ready', `${name}: implemented schema needs a ready development scenario`);
  assert.ok(schema.releaseProfiles?.length && schema.releaseScenarios?.length, `${name}: missing release coverage`);
  assert.ok(schema.releaseProfiles.includes(schema.releaseVariantProfile), `${name}: variant profile must belong to release profiles`);
  for (const profile of schema.releaseProfiles) assert.ok(Object.hasOwn(plan.profiles, profile), `${name}: unknown release profile ${profile}`);
  for (const scenario of schema.releaseScenarios) assert.equal(plan.scenarios[scenario]?.schema, name, `${name}: missing or wrong release scenario ${scenario}`);
}
console.log(`Evaluation plan checked: ${shipped.length} shipped schemas covered. This does not run agents or certify release readiness.`);
