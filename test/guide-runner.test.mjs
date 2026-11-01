import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {parse} from 'yaml';
import {expandDocumentation} from '../scripts/lib/doc-includes.mjs';

const source = fileURLToPath(new URL('../', import.meta.url));
const profiles = parse(fs.readFileSync(path.join(source, 'docs/testing/agent-evaluation.yaml'), 'utf8')).profiles;
function fixture(t, id, options = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cliewen-guide-runner-test-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const trial = path.join(root, 'trial'), fake = path.join(root, 'fake.mjs');
  const profile = profiles[id];
  fs.writeFileSync(fake, `import fs from 'node:fs';
const args=process.argv.slice(2); if(args.includes('--version')){console.log(process.env.FAKE_VERSION);process.exit(0);}
let input=''; process.stdin.on('data',chunk=>input+=chunk); process.stdin.on('end',()=>{
const prompt=input||args.join(' '); const review=prompt.includes('# Review after the walkthrough');
fs.writeFileSync(review?'guide-review.md':'walkthrough-result.md',review?'Review of this attempt.':'Status: complete. Fixture observations only.');
if(review&&process.env.FAKE_EDIT_REPORT)fs.writeFileSync('walkthrough-result.md','Rewritten');
if(process.env.FAKE_FAIL)console.log(JSON.stringify({type:'error',error:'fixture failure'}));
const model=process.env.FAKE_MODEL,agent=process.env.FAKE_AGENT;
if(agent==='Claude Code'){const option=args.includes('--resume')?'--resume':'--session-id';console.log(JSON.stringify({type:'result',subtype:'success',session_id:args[args.indexOf(option)+1],modelUsage:{[model]:{}},total_cost_usd:0.01}));}
else if(agent==='Codex CLI'){console.log(JSON.stringify({type:'thread.started',thread_id:'fixture-thread'}));console.log(JSON.stringify({type:'turn.completed',usage:{input_tokens:10,output_tokens:4}}));}
else{console.log(JSON.stringify({type:'text',sessionID:'fixture-session',model,part:{text:'fixture'}}));console.log(JSON.stringify({type:'step_finish',sessionID:'fixture-session',part:{cost:Number(process.env.FAKE_COST||0.01),tokens:{input:10,output:4}}}));}
});`);
  const env = {...process.env, CLIEWEN_CLAUDE_CLI: fake, CLIEWEN_CODEX_CLI: fake, CLIEWEN_OPENCODE_CLI: fake, FAKE_AGENT: profile.agent, FAKE_VERSION: options.version ?? (profile.agent === 'OpenCode' ? `opencode v${profile.agentVersion}` : profile.agentVersion), FAKE_MODEL: options.model ?? profile.model, FAKE_FAIL: options.fail ? '1' : '', FAKE_EDIT_REPORT: options.editReport ? '1' : '', FAKE_COST: options.cost ?? '', FAKE_PRIVATE_TOKEN: 'never-serialize-this'};
  const run = phase => spawnSync(process.execPath, ['scripts/run-guide-walkthrough.mjs', phase, trial, ...(phase === 'prepare' ? [id] : [])], {cwd: source, env, encoding: 'utf8', timeout: 15000});
  const prepared = run('prepare'); assert.equal(prepared.status, 0, prepared.stderr);
  const read = phase => JSON.parse(fs.readFileSync(path.join(trial, 'artifacts', phase, 'run.json'), 'utf8'));
  return {trial, run, read};
}

test('all guide adapters preserve phases and snapshots, with an explicit context strategy', t => {
  for (const id of ['claude-guide-walkthrough', 'codex-guide-walkthrough', 'opencode-guide-walkthrough']) {
    const f = fixture(t, id);
    assert.notEqual(f.run('review').status, 0, 'review cannot precede walkthrough completion');
    assert.equal(fs.existsSync(path.join(f.trial, 'artifacts/review')), false);
    assert.equal(f.run('walkthrough').status, 0); assert.equal(f.read('walkthrough').passed, true);
    assert.equal(f.run('review').status, 0); const result = f.read('review');
    assert.equal(result.walkthroughReportPreserved, true);
    assert.equal(result.evaluation, 'not-graded');
    assert.equal(JSON.stringify(result).includes('never-serialize-this'), false);
    assert.notEqual(f.run('walkthrough').status, 0, 'attempt logs cannot be overwritten');
    if (id.startsWith('codex')) {
      assert.ok(result.args.includes('--ephemeral')); assert.ok(result.args.includes('--ignore-user-config'));
      assert.equal(result.context, 'fresh-session-with-trial-observations'); assert.equal(result.modelVerification, 'not-exposed');
      assert.match(fs.readFileSync(path.join(f.trial, 'artifacts/review/prompt.txt'), 'utf8'), /Fixture observations only/);
    } else if (id.startsWith('opencode')) {
      assert.ok(result.args.includes('--standalone'));
      const config = JSON.parse(result.environmentControls.OPENCODE_CONFIG_CONTENT);
      assert.ok(config.policies.some(p => p.action === 'provider.use' && p.resource === 'opencode' && p.effect === 'allow'));
      assert.ok(config.policies.some(p => p.action === 'mcp.use' && p.effect === 'deny'));
      assert.equal(result.environmentControls.OPENCODE_CONFIG_PROJECT_DISABLE, 'true');
    } else { assert.ok(result.args.includes('--resume')); assert.equal(result.context, 'resume-trial-session'); }
  }
});

test('guide runner rejects version drift, misleading success events, model drift, and changed observations', t => {
  const version = fixture(t, 'codex-guide-walkthrough', {version: '0.0.0'});
  assert.notEqual(version.run('walkthrough').status, 0); assert.equal(version.read('walkthrough').failure, 'version-preflight');
  const failed = fixture(t, 'codex-guide-walkthrough', {fail: true});
  assert.notEqual(failed.run('walkthrough').status, 0); assert.equal(failed.read('walkthrough').passed, false); assert.notEqual(failed.run('review').status, 0);
  const model = fixture(t, 'opencode-guide-walkthrough', {model: 'other/model'});
  assert.notEqual(model.run('walkthrough').status, 0);
  const changed = fixture(t, 'claude-guide-walkthrough', {editReport: true});
  assert.equal(changed.run('walkthrough').status, 0); assert.notEqual(changed.run('review').status, 0); assert.equal(changed.read('review').walkthroughReportPreserved, false);
  const snapshot = fixture(t, 'codex-guide-walkthrough');
  fs.appendFileSync(path.join(snapshot.trial, 'workspace/reference/docs/guide/getting-started.md'), 'changed');
  assert.notEqual(snapshot.run('walkthrough').status, 0); assert.equal(fs.existsSync(path.join(snapshot.trial, 'artifacts/walkthrough')), false);
});

test('OpenCode guide runner records a reported-cost stop without approving the attempt', t => {
  const f = fixture(t, 'opencode-guide-walkthrough', {cost: '0.75'});
  assert.notEqual(f.run('walkthrough').status, 0); assert.equal(f.read('walkthrough').stopReason, 'reported-cost-limit');
});

test('guide snapshots share website include rendering instead of nesting Markdown inside JavaScript', t => {
  const content = expandDocumentation('{{include:docs/examples/csv/README.md}}', () => '---\ntype: example\n---\n# Example\n\n## API\n\n```js\nexportCsv([]);\n```\n');
  assert.match(content, /^\n## API/m); assert.doesNotMatch(content, /type: example/); assert.doesNotMatch(content, /```js\n---/);
  assert.throws(() => expandDocumentation('{{include:../secret}}', () => { throw Error('Must not read'); }), /Invalid include/);
  const f = fixture(t, 'codex-guide-walkthrough');
  const snapshot = fs.readFileSync(path.join(f.trial, 'workspace/reference/docs/guide/csv-example.md'), 'utf8');
  assert.doesNotMatch(snapshot, /```js\r?\n---/);
});
