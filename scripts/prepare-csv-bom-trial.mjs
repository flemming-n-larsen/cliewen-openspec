import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
if (args.length && (args.length !== 1 || !path.isAbsolute(args[0]))) {
  throw Error('Use npm run trial:prepare -- [ABSOLUTE_NEW_DIRECTORY]');
}
const trial = args[0] ?? path.join(os.tmpdir(), `cliewen-csv-bom-${Date.now()}`);
const relative = path.relative(source, trial);
if (!relative || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))) throw Error('Trial output must be outside the source checkout');
if (fs.existsSync(trial)) throw Error(`Refusing to reuse an existing directory: ${trial}`);
const npm = process.env.npm_execpath;
if (!npm) throw Error('Run through npm run trial:prepare');
const root = path.join(trial, 'project');
const artifacts = path.join(trial, 'artifacts');
fs.mkdirSync(root, {recursive: true});
fs.mkdirSync(artifacts);
const commands = [];
function run(executable, argv, cwd = root) {
  const result = spawnSync(executable, argv, {cwd, encoding: 'utf8', timeout: 120000, env: {...process.env, OPENSPEC_TELEMETRY: '0', CI: '1'}});
  commands.push({executable, argv, cwd, exitCode: result.status, stdout: result.stdout, stderr: result.stderr});
  fs.writeFileSync(path.join(artifacts, 'setup-commands.json'), JSON.stringify(commands, null, 2) + '\n');
  if (result.status !== 0) throw Error(`Setup failed: ${executable} ${argv.join(' ')}\n${result.stderr}`);
  return result.stdout.trim();
}
const write = (file, content) => {
  fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true});
  fs.writeFileSync(path.join(root, file), content);
};
const copy = (from, to) => write(to, fs.readFileSync(path.join(source, from), 'utf8').replaceAll('\r\n', '\n'));
run(process.execPath, [npm, 'run', 'build'], source);
const pack = JSON.parse(run(process.execPath, [npm, 'pack', '--json', '--ignore-scripts', '--pack-destination', artifacts], source))[0];
const tar = path.join(artifacts, pack.filename);
write('package.json', JSON.stringify({name: 'csv-bom-agent-trial', private: true, type: 'module', scripts: {test: 'node --test test/*.test.mjs'}}, null, 2) + '\n');
run(process.execPath, [npm, 'install', '--ignore-scripts', '--no-audit', '--no-fund', '--save-exact', tar, '@fission-ai/openspec@1.15.0']);
const ospec = (...argv) => run(process.execPath, ['node_modules/@fission-ai/openspec/bin/openspec.js', ...argv]);
const cl = (...argv) => run(process.execPath, ['node_modules/cliewen-openspec/dist/cli.js', ...argv]);
ospec('init', '--tools', 'none', '--no-animation');
cl('init', '--default');
copy('docs/examples/csv/config.yaml', '.cliewen-openspec/config.yaml');
write('.cliewen-openspec/config.yaml', fs.readFileSync(path.join(root, '.cliewen-openspec/config.yaml'), 'utf8').replace('approach: flexible', 'approach: tdd'));
for (let i = 1; i <= 6; i++) {
  if (cl('ac', 'next', '--capability', 'csv-export') !== `EXP-00${i}`) throw Error('Unexpected baseline AC allocation');
}
copy('docs/examples/csv/export.mjs', 'export.mjs');
copy('docs/examples/csv/test/export.test.mjs', 'test/export.test.mjs');
copy('docs/examples/csv/change/specs/csv-export/spec.md', 'openspec/specs/csv-export/spec.md');
write('openspec/specs/csv-export/spec.md', fs.readFileSync(path.join(root, 'openspec/specs/csv-export/spec.md'), 'utf8').replace('## ADDED Requirements', '## Requirements'));
copy('docs/examples/csv/README.md', 'README.md');
write('.gitignore', 'node_modules/\n');
write('AGENTS.md', 'Write project text in US English. Read .cliewen-openspec/config.yaml and use the installed cliewen-delivery schema through OpenSpec instructions for each artifact and apply. Preserve existing specs, scenario IDs, and document paths.\n');
run('git', ['init', '-b', 'main']);
run('git', ['config', 'user.name', 'Cliewen trial']);
run('git', ['config', 'user.email', 'trial@example.invalid']);
run('git', ['add', '.']);
run('git', ['commit', '-m', 'Establish CSV export baseline for agent trial']);
run(process.execPath, ['--test', 'test/export.test.mjs']);
ospec('validate', '--specs', '--strict');
const baseline = run('git', ['rev-parse', 'HEAD']);
const metadata = {
  preparedAt: new Date().toISOString(), sourceRevision: run('git', ['rev-parse', 'HEAD'], source),
  sourceStatus: run('git', ['status', '--porcelain'], source), baseline,
  package: {filename: pack.filename, sha256: createHash('sha256').update(fs.readFileSync(tar)).digest('hex')},
  node: process.version, npm: run(process.execPath, [npm, '--version']), openspec: '1.15.0', root,
};
fs.writeFileSync(path.join(artifacts, 'baseline.json'), JSON.stringify(metadata, null, 2) + '\n');
for (const file of ['prompt.md', 'rubric.md']) fs.copyFileSync(path.join(source, 'docs/testing/csv-bom-trial', file), path.join(artifacts, file));
run('git', ['bundle', 'create', path.join(artifacts, 'baseline.bundle'), '--all']);
console.log(JSON.stringify({trial, root, artifacts, baseline}, null, 2));
