// Deliberately break isolated compiled copies to verify regression-test effectiveness.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

fs.mkdirSync('.tmp', {recursive: true});
const root = fs.mkdtempSync(path.resolve('.tmp/quality-mutants-'));
fs.cpSync('dist', path.join(root, 'dist'), {recursive: true});
fs.cpSync('schemas', path.join(root, 'schemas'), {recursive: true});
fs.mkdirSync(path.join(root, 'test'));
fs.copyFileSync('test/quality.test.mjs', path.join(root, 'test/quality.test.mjs'));
fs.writeFileSync(path.join(root, 'package.json'), '{"type":"module","private":true}\n');
const file = path.join(root, 'dist/quality.js');
const source = fs.readFileSync(file, 'utf8');
const sha256 = text => createHash('sha256').update(text).digest('hex');
const observations = [];
for (const mutation of [
  {name: 'remove coverage minima', from: '< config.testing.quality.coverage.minimumCases[category]', to: '< 0', pattern: 'coverage counts distinct', finding: 'coverage-minimum-unmet'},
  {name: 'permit deleting active shared assertions', from: "test.action === 'remove' && test.remainingScenarios.length", to: 'false', pattern: 'lifecycle detects requirement removal', finding: 'active-test-removal'},
]) {
  assert.equal(source.split(mutation.from).length, 2, `Mutation site changed: ${mutation.name}`);
  fs.writeFileSync(file, source.replace(mutation.from, mutation.to));
  try {
    const env = {...process.env}; delete env.NODE_TEST_CONTEXT;
    const run = spawnSync(process.execPath, ['--test', '--test-name-pattern', mutation.pattern, path.join(root, 'test/quality.test.mjs')], {encoding: 'utf8', env, timeout: 30000});
    observations.push({name: mutation.name, sourceHash: sha256(source), mutatedHash: sha256(fs.readFileSync(file)), exitCode: run.status, stdout: run.stdout, stderr: run.stderr});
    assert.equal(run.status, 1, `${mutation.name}: regression should fail\n${run.stdout}\n${run.stderr}`);
    assert.ok((run.stdout + run.stderr).includes(mutation.finding), `${mutation.name}: inspect failure cause`);
  } finally {
    fs.writeFileSync(file, source);
    assert.equal(sha256(fs.readFileSync(file)), sha256(source));
  }
}
fs.writeFileSync(path.join(root, 'results.json'), JSON.stringify({observations, restored: true, node: process.version}, null, 2) + '\n');
console.log(JSON.stringify({mutantsDetected: observations.length, restored: true, output: path.join(root, 'results.json')}));
