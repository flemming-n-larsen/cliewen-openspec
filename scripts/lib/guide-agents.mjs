import path from 'node:path';
import os from 'node:os';

export function guideInvocation(profile, phase, prompt, session, folder) {
  const env = {...process.env, NO_COLOR: '1', CI: '1', OPENSPEC_TELEMETRY: '0'};
  env.npm_config_cache = path.join(path.dirname(path.dirname(folder)), 'workspace', '.cache', 'npm');
  const global = process.env.APPDATA ? path.join(process.env.APPDATA, 'npm/node_modules') : undefined;
  let cli, args, stdin, context;
  if (profile.agent === 'Claude Code') {
    cli = process.env.CLIEWEN_CLAUDE_CLI ?? path.join(os.homedir(), '.local/bin', process.platform === 'win32' ? 'claude.exe' : 'claude');
    args = ['-p', prompt, '--model', profile.model, '--effort', profile.effort, '--output-format', 'stream-json', '--verbose', '--safe-mode', '--permission-mode', 'dontAsk', '--allowedTools', 'Read,Edit,Write,Bash,PowerShell,Glob,Grep', '--disallowedTools', 'Agent,Task,WebFetch,WebSearch', '--max-budget-usd', String(profile.budgets.reportedCostUSD), ...(phase === 'review' ? ['--resume', session] : ['--session-id', session])];
    context = phase === 'review' ? 'resume-trial-session' : 'fresh-session';
  } else if (profile.agent === 'Codex CLI') {
    cli = process.env.CLIEWEN_CODEX_CLI ?? (global ? path.join(global, '@openai/codex/bin/codex.js') : 'codex');
    args = ['exec', '--ignore-user-config', '--ignore-rules', '--ephemeral', '--skip-git-repo-check', '--json', '--sandbox', 'danger-full-access', '-c', 'approval_policy="never"', '-c', 'model_provider="openai"', '-c', `model_reasoning_effort="${profile.effort}"`, '--disable', 'multi_agent', '--model', profile.model, '-'];
    stdin = prompt;
    context = phase === 'review' ? 'fresh-session-with-trial-observations' : 'fresh-ephemeral-session';
  } else if (profile.agent === 'OpenCode' && profile.agentVersion.startsWith('2.')) {
    cli = process.env.CLIEWEN_OPENCODE_CLI ?? (global ? path.join(global, '@opencode/cli/bin/opencode.exe') : 'opencode');
    args = ['run', '--standalone', '--format', 'json', '--model', `${profile.model}#${profile.effort}`, prompt];
    const denied = ['external_directory', 'subagent', 'question', 'skill', 'webfetch', 'websearch'];
    env.OPENCODE_CONFIG_DIR = path.join(folder, 'config');
    env.OPENCODE_CONFIG_CONTENT = JSON.stringify({model: profile.model,
      permissions: [{action: '*', resource: '*', effect: 'allow'}, ...denied.map(action => ({action, resource: '*', effect: 'deny'}))],
      policies: [{action: 'provider.use', resource: '*', effect: 'deny'}, {action: 'provider.use', resource: 'opencode', effect: 'allow'},
        ...['mcp.use', 'skill.use'].map(action => ({action, resource: '*', effect: 'deny'})),
        {action: 'plugin.use', resource: '*', effect: 'deny'}, {action: 'plugin.use', resource: 'opencode.*', effect: 'allow'},
        ...denied.map(action => ({action: 'tool.use', resource: `${action}:*`, effect: 'deny'}))], plugins: ['-*', 'opencode.*']});
    env.OPENCODE_CONFIG_PROJECT_DISABLE = 'true'; env.OPENCODE_DISABLE_CLAUDE_CODE = 'true';
    env.OPENCODE_DISABLE_MODELS_FETCH = 'true'; env.OPENCODE_DISABLE_FILEWATCHER = 'true';
    context = phase === 'review' ? 'fresh-standalone-with-trial-observations' : 'fresh-standalone-server';
  } else throw Error('Select a supported Claude Code, Codex CLI, or OpenCode V2 guide profile');
  const script = /\.(?:mjs|cjs|js)$/i.test(cli);
  return {exe: script ? process.execPath : cli, prefix: script ? [cli] : [], args, env, stdin, context,
    controls: Object.fromEntries(Object.entries(env).filter(([key]) => ['NO_COLOR', 'CI', 'OPENSPEC_TELEMETRY', 'npm_config_cache', 'OPENCODE_CONFIG_DIR', 'OPENCODE_CONFIG_CONTENT', 'OPENCODE_CONFIG_PROJECT_DISABLE', 'OPENCODE_DISABLE_CLAUDE_CODE', 'OPENCODE_DISABLE_MODELS_FETCH', 'OPENCODE_DISABLE_FILEWATCHER'].includes(key)))};
}

export function guideEvents(profile, expectedSession) {
  const state = {models: new Set(), session: undefined, completion: false, failure: false, reportedCostUSD: profile.agent === 'Codex CLI' ? null : 0, result: undefined, usage: undefined, stepUsage: []};
  return {state, event(value) {
    if (value.type === 'error' || value.type === 'turn.failed') state.failure = true;
    if (value.thread_id || value.sessionID || value.session_id) state.session = value.thread_id ?? value.sessionID ?? value.session_id;
    for (const model of [value.model, value.message?.model]) if (typeof model === 'string') state.models.add(model);
    const part = value.part;
    if (part?.modelID) state.models.add(part.providerID ? `${part.providerID}/${part.modelID}` : part.modelID);
    if (value.type === 'result') {
      state.result = value; state.usage = value.usage;
      state.completion = value.subtype === 'success' && !value.is_error;
      if (!state.completion) state.failure = true;
      state.reportedCostUSD = value.total_cost_usd ?? state.reportedCostUSD;
      for (const model of Object.keys(value.modelUsage ?? {})) state.models.add(model);
      if (profile.agent === 'Claude Code' && value.session_id !== expectedSession) state.failure = true;
    }
    if (value.type === 'turn.completed') { state.completion = true; state.usage = value.usage; }
    if (profile.agent === 'OpenCode' && ['text', 'step_finish'].includes(value.type)) state.completion = true;
    if (value.type === 'step_finish') { state.reportedCostUSD += part?.cost ?? 0; state.usage = part?.tokens ?? state.usage; state.stepUsage.push({cost: part?.cost, tokens: part?.tokens}); }
  }};
}
