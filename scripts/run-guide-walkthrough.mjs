import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {randomUUID, createHash} from 'node:crypto';
import {spawn, spawnSync} from 'node:child_process';
import {StringDecoder} from 'node:string_decoder';
import {fileURLToPath} from 'node:url';
import {parse} from 'yaml';
import {pages} from '../site/pages.mjs';
import {guideInvocation, guideEvents} from './lib/guide-agents.mjs';
import {expandDocumentation} from './lib/doc-includes.mjs';

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [phase, location, selectedProfile, ...extra] = process.argv.slice(2);
if (!['prepare', 'walkthrough', 'review'].includes(phase) || extra.length || (phase !== 'prepare' && selectedProfile) || (location && !path.isAbsolute(location))) throw Error('Use node scripts/run-guide-walkthrough.mjs prepare [ABSOLUTE_NEW_DIRECTORY] [PROFILE] or walkthrough|review ABSOLUTE_TRIAL_DIRECTORY');
const root = location ?? (phase === 'prepare' ? path.join(os.tmpdir(), `cliewen-guide-${Date.now()}`) : undefined);
if (!root) throw Error('Specify the prepared trial directory');
const relative = path.relative(source, root);
if (!relative || (!relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative))) throw Error('Trial must be outside the source checkout');
const workspace = path.join(root, 'workspace'), artifacts = path.join(root, 'artifacts');
const metadataFile = path.join(artifacts, 'trial.json');
const write = (file, value) => { fs.mkdirSync(path.dirname(file), {recursive: true}); fs.writeFileSync(file, value); };
if (phase === 'prepare') {
  if (fs.existsSync(root)) throw Error('Refusing to overwrite a previous trial');
  const profileId = selectedProfile ?? 'claude-guide-walkthrough';
  const profile = parse(fs.readFileSync(path.join(source, 'docs/testing/agent-evaluation.yaml'), 'utf8')).profiles[profileId];
  if (!['claude-guide-walkthrough', 'codex-guide-walkthrough', 'opencode-guide-walkthrough'].includes(profileId) || profile?.readiness !== 'pinned') throw Error('Select a pinned guide profile');
  fs.mkdirSync(workspace, {recursive: true}); fs.mkdirSync(artifacts);
  const inputs = {};
  const expand = text => expandDocumentation(text, file => fs.readFileSync(path.join(source, file), 'utf8'));
  for (const file of new Set([...pages.map(page => page.source), 'docs/testing/pilot-prompt.md'])) {
    const content = expand(fs.readFileSync(path.join(source, file), 'utf8'));
    write(path.join(workspace, 'reference', file), content);
    inputs[file] = createHash('sha256').update(content).digest('hex');
  }
  write(path.join(workspace, 'AGENTS.md'), '# Walkthrough workspace\n\nFollow the supplied public guide. Keep work inside this workspace. Use US English for saved observations. Do not inspect maintainer plans, decisions, or earlier evaluations. Do not modify source guides or publish anything.\n');
  for (const [file, target] of [['prompt.md', 'walkthrough-prompt.md'], ['review-prompt.md', 'review-prompt.md'], ['rubric.md', 'rubric.md']]) fs.copyFileSync(path.join(source, 'docs/testing/guide-walkthrough', file), path.join(artifacts, target));
  const git = (...args) => spawnSync('git', args, {cwd: source, encoding: 'utf8'}).stdout.trim();
  write(metadataFile, JSON.stringify({createdAt: new Date().toISOString(), workspace, session: randomUUID(), sourceRevision: git('rev-parse', 'HEAD'), sourceStatus: git('status', '--short'), profileId, profile, guideInputs: inputs}, null, 2) + '\n');
  console.log(JSON.stringify({root, workspace, artifacts}));
} else {
  const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
  const reportFile = path.join(workspace, 'walkthrough-result.md');
  if (phase === 'review') {
    const prior = JSON.parse(fs.readFileSync(path.join(artifacts, 'walkthrough/run.json'), 'utf8'));
    if (prior.code !== 0 || prior.stopReason || !(prior.passed ?? (prior.result?.subtype === 'success')) || !fs.existsSync(reportFile)) throw Error('Finish a successful walkthrough process and inspect its report before requesting a retrospective');
  }
  const reportHash = phase === 'review' ? createHash('sha256').update(fs.readFileSync(reportFile)).digest('hex') : undefined;
  for (const [file, digest] of Object.entries(metadata.guideInputs)) if (createHash('sha256').update(fs.readFileSync(path.join(workspace, 'reference', file))).digest('hex') !== digest) throw Error('Guide snapshot changed; prepare a new attempt');
  const folder = path.join(artifacts, phase);
  if (fs.existsSync(folder)) throw Error('Preserve previous attempts; this phase already exists');
  fs.mkdirSync(folder);
  let prompt = fs.readFileSync(path.join(artifacts, phase === 'review' ? 'review-prompt.md' : 'walkthrough-prompt.md'), 'utf8');
  if (phase === 'review' && metadata.profile.agent !== 'Claude Code') prompt += '\n\nThis is a new process. Use only this attempt\'s saved walkthrough-result.md, its referenced local logs, and the supplied guide snapshot as your experience. Read AGENTS.md. Do not read sibling evaluator artifacts, maintainer plans, decisions, earlier evaluations, or other sessions. Do not spawn agents or contact external services; normal model-provider requests are allowed. Do not change the pilot or source guides.\n\nSaved walkthrough observations:\n' + fs.readFileSync(reportFile, 'utf8');
  write(path.join(folder, 'prompt.txt'), prompt);
  const invocation = guideInvocation(metadata.profile, phase, prompt, metadata.session, folder);
  const {exe, prefix, args, env} = invocation;
  if (env.OPENCODE_CONFIG_DIR) fs.mkdirSync(env.OPENCODE_CONFIG_DIR);
  const cli = spawnSync(exe, [...prefix, '--version'], {encoding: 'utf8', windowsHide: true, timeout: 15000});
  if (cli.status !== 0 || cli.stdout.match(/\bv?(\d+\.\d+\.\d+)\b/)?.[1] !== metadata.profile.agentVersion) {
    write(path.join(folder, 'run.json'), JSON.stringify({phase, code: cli.status, passed: false, failure: 'version-preflight', cliVersion: cli.stdout, expectedVersion: metadata.profile.agentVersion, evaluation: 'infrastructure-failure'}, null, 2) + '\n');
    throw Error('Agent CLI differs from the prepared profile');
  }
  const out = fs.createWriteStream(path.join(folder, 'events.jsonl'), {flags: 'wx'});
  const err = fs.createWriteStream(path.join(folder, 'stderr.txt'), {flags: 'wx'});
  const started = Date.now(); let bytes = 0, buffer = '', stopReason;
  const decoder = new StringDecoder('utf8');
  const parser = guideEvents(metadata.profile, metadata.session), state = parser.state;
  const child = spawn(exe, [...prefix, ...args], {cwd: workspace, env, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe']});
  child.stdin.on('error', () => { state.failure = true; });
  child.stdin.end(invocation.stdin);
  const stop = reason => {
    if (stopReason) return; stopReason = reason;
    if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {windowsHide: true, stdio: 'ignore'}); else child.kill('SIGTERM');
  };
  const event = line => { let value; try { value = JSON.parse(line); } catch { return; } parser.event(value); if (metadata.profile.agent === 'OpenCode' && state.reportedCostUSD >= metadata.profile.budgets.reportedCostUSD) stop('reported-cost-limit'); };
  child.stdout.on('data', chunk => { bytes += chunk.length; out.write(chunk); buffer += decoder.write(chunk); let end; while ((end = buffer.indexOf('\n')) !== -1) { event(buffer.slice(0, end)); buffer = buffer.slice(end + 1); } if (bytes > metadata.profile.budgets.outputBytes) stop('log-limit'); });
  child.stderr.on('data', chunk => { bytes += chunk.length; err.write(chunk); if (bytes > metadata.profile.budgets.outputBytes) stop('log-limit'); });
  const timer = setTimeout(() => stop('wall-time-limit'), metadata.profile.budgets.wallTimeSeconds * 1000);
  const progress = setInterval(() => console.log(JSON.stringify({phase, elapsedSeconds: Math.round((Date.now() - started) / 1000), logBytes: bytes})), 30000);
  const ended = await new Promise(resolve => { child.on('error', error => resolve({error: error.message})); child.on('close', (code, signal) => resolve({code, signal})); });
  clearTimeout(timer); clearInterval(progress); buffer += decoder.end(); if (buffer) event(buffer);
  await Promise.all([new Promise(resolve => out.end(resolve)), new Promise(resolve => err.end(resolve))]);
  const reportPreserved = reportHash === undefined || (fs.existsSync(reportFile) && createHash('sha256').update(fs.readFileSync(reportFile)).digest('hex') === reportHash);
  const modelMismatch = [...state.models].some(model => model !== metadata.profile.model && !(metadata.profile.agent === 'OpenCode' && model === metadata.profile.model.split('/').at(-1)));
  const expectedReport = phase === 'review' ? 'guide-review.md' : 'walkthrough-result.md';
  const passed = ended.code === 0 && !stopReason && !state.failure && state.completion && !modelMismatch && reportPreserved && fs.existsSync(path.join(workspace, expectedReport)) && (metadata.profile.agent !== 'Claude Code' || state.models.size > 0);
  const summary = {phase, profileId: metadata.profileId, context: invocation.context, session: metadata.session, observedSession: state.session, cliVersion: cli.stdout.trim(), requestedModel: metadata.profile.model, observedModels: [...state.models], modelVerification: state.models.size ? 'observed' : 'not-exposed', args: [...prefix, ...args], environmentControls: invocation.controls, startedAt: new Date(started).toISOString(), durationSeconds: (Date.now() - started) / 1000, ...ended, stopReason: stopReason ?? null, passed, evaluation: 'not-graded', walkthroughReportPreserved: reportPreserved, result: state.result, usage: state.usage, stepUsage: state.stepUsage, reportedCostUSD: state.reportedCostUSD};
  write(path.join(folder, 'run.json'), JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify({phase, ...ended, stopReason, passed, durationSeconds: summary.durationSeconds, observedModels: summary.observedModels, reportedCostUSD: summary.reportedCostUSD, artifacts: folder}));
  process.exitCode = passed ? 0 : 1;
}
