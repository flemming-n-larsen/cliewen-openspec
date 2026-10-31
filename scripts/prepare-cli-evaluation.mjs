import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {parse} from 'yaml';

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [output, ...extra] = process.argv.slice(2);
if (extra.length || (output && !path.isAbsolute(output))) throw Error('Use npm run trial:cli:prepare -- [ABSOLUTE_NEW_DIRECTORY]');
const root = output ?? path.join(os.tmpdir(), `cliewen-cli-evaluation-${Date.now()}`);
const relative = path.relative(source, root);
if (!relative || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))) throw Error('Output must be outside the source checkout');
if (fs.existsSync(root)) throw Error(`Refusing to reuse ${root}`);
const npm = process.env.npm_execpath;
if (!npm) throw Error('Run through npm run trial:cli:prepare');
fs.mkdirSync(root, {recursive: true});
const plan = parse(fs.readFileSync(path.join(source, 'docs/testing/agent-evaluation.yaml'), 'utf8'));
const cases = [];
function run(exe, args, cwd = source) {
  const r = spawnSync(exe, args, {cwd, encoding: 'utf8', timeout: 180000, env: {...process.env, OPENSPEC_TELEMETRY: '0', CI: '1'}});
  if (r.status !== 0) throw Error(`${r.stdout}\n${r.stderr}`); return r.stdout.trim();
}
for (const [schema, definition] of Object.entries(plan.schemas)) {
  if (definition.status !== 'implemented') continue;
  const scenario = plan.scenarios[definition.developmentScenario];
  const prepared = JSON.parse(run(process.execPath, [path.join(source, scenario.prepare), path.join(root, schema)]));
  for (const [index, profile] of definition.releaseProfiles.entries()) {
    const project = index === 0 ? prepared.root : path.join(prepared.trial, `project-${profile}`);
    if (index !== 0) {
      run('git', ['clone', path.join(prepared.artifacts, 'baseline.bundle'), project]);
      run(process.execPath, [npm, 'ci', '--ignore-scripts', '--no-audit', '--no-fund'], project);
      run('git', ['config', 'user.name', 'Cliewen trial'], project);
      run('git', ['config', 'user.email', 'trial@example.invalid'], project);
    }
    const artifacts = path.join(prepared.artifacts, 'cli', profile);
    fs.mkdirSync(artifacts, {recursive: true});
    for (const file of ['baseline.json', 'prompt.md', 'rubric.md']) fs.copyFileSync(path.join(prepared.artifacts, file), path.join(artifacts, file));
    cases.push({schema, scenario: definition.developmentScenario, profile, project, artifacts, baseline: prepared.baseline, checker: scenario.checker});
  }
}
const file = path.join(root, 'suite.json');
fs.writeFileSync(file, JSON.stringify({preparedAt: new Date().toISOString(), cases}, null, 2) + '\n');
console.log(JSON.stringify({suite: file, cases: cases.length}, null, 2));
