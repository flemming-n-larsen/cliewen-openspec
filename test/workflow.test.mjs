import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const openspec = path.join(project,'node_modules/@fission-ai/openspec/bin/openspec.js');
test('packed installation → OpenSpec change → real test evidence → archive', {timeout:120000}, t => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'cliewen-workflow-'));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  function run(executable,args,expected=0,cwd=root) {
    const env={...process.env,OPENSPEC_TELEMETRY:'0',CI:'1'}; delete env.NODE_TEST_CONTEXT;
    const r=spawnSync(executable,args,{cwd,encoding:'utf8',env,timeout:60000});
    assert.equal(r.status,expected, `${executable} ${args.join(' ')}\n${r.stdout}\n${r.stderr}\n${r.error??''}`); return r.stdout.trim();
  }
  const ospec=(...args)=>run(process.execPath,[openspec,...args]);
  const write=(p,s)=>{fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),s);};
  const npm=process.env.npm_execpath; assert.ok(npm,'Run through npm test');
  const pack=JSON.parse(run(process.execPath,[npm,'pack','--json','--ignore-scripts','--pack-destination',root],0,project));
  const tar=path.join(root,pack[0].filename);
  write('package.json',JSON.stringify({private:true,type:'module'}));
  run(process.execPath,[npm,'install','--ignore-scripts','--no-audit','--no-fund',tar]);
  fs.unlinkSync(tar);
  // Replace local tarball dependency path before committing the test fixture.
  write('package.json',JSON.stringify({private:true,type:'module'}));
  fs.unlinkSync(path.join(root,'package-lock.json'));
  write('.gitignore','node_modules/\n');
  ospec('init','--tools','none','--no-animation');
  const cli=path.join(root,'node_modules/cliewen-openspec/dist/cli.js');
  const cl=(args,expected=0)=>run(process.execPath,[cli,...args],expected);
  assert.match(run(process.execPath,[npm,'exec','--no','--','cliewen-openspec','--version']),/0\.1\.0-alpha\.1/);
  cl(['init','--default']); assert.deepEqual(JSON.parse(cl(['init'])).writes,[]);
  ospec('schema','validate','cliewen-delivery');
  ospec('new','change','export-data','--schema','cliewen-delivery');
  write('.cliewen-openspec/config.yaml', 'ac:\n  capabilities:\n    export: EXPORT\n  padding: 1\n');
  assert.equal(cl(['ac','next','--capability','export']),'EXPORT-1');
  write('openspec/changes/export-data/proposal.md','# Export data\n\n## Why\nUsers need portable exports.\n\n## What Changes\n- Add CSV export.\n\n## Capabilities\n### New Capabilities\n- export: portable CSV\n\n## Impact\nNo durable architecture decision is needed.\n');
  write('openspec/changes/export-data/specs/export/spec.md','# Export\n\n## Purpose\nAllow users to take their records out of the application in a portable CSV format.\n\n## ADDED Requirements\n\n### Requirement: Export rows\nThe system SHALL export records with a CSV header.\n\n#### Scenario: Export a record [EXPORT-1]\nTest-type: Unit\n- **WHEN** a record is exported\n- **THEN** the CSV includes the header and the record\n');
  write('openspec/changes/export-data/design.md','# Design\n\nA pure formatter. No new durable decision is needed.\n');
  write('openspec/changes/export-data/tasks.md','# Tasks\n\n## 1. Export\n- [x] 1.1 Implement formatter and verify EXPORT-1 with the Node test.\n');
  write('export.mjs',"export const csv = value => 'value\\n' + value + '\\n';\n");
  write('test/export.test.mjs',"import {test} from 'node:test'; import assert from 'node:assert/strict'; import {csv} from '../export.mjs'; test('exports a row [EXPORT-1] [Test-type: Unit]',()=>assert.equal(csv('hello'),'value\\nhello\\n'));\n");
  ospec('validate','export-data','--type','change','--strict');
  const tasksPath=path.join(root,'openspec/changes/export-data/tasks.md');
  const completedTasks=fs.readFileSync(tasksPath,'utf8');
  fs.writeFileSync(tasksPath,completedTasks.replace('[x]','[ ]'));
  const instructions=JSON.parse(ospec('instructions','apply','--change','export-data','--json'));
  assert.notEqual(instructions.state,'blocked');
  assert.match(instructions.instruction, /red-green-refactor/);
  const taskInstructions=JSON.parse(ospec('instructions','tasks','--change','export-data','--json'));
  assert.match(taskInstructions.instruction, /testing.approach/);
  assert.match(taskInstructions.instruction, /observe failure for the intended missing behavior/);
  assert.match(taskInstructions.template, /red-green-refactor/);
  fs.writeFileSync(tasksPath,completedTasks);
  run('git',['init','-b','main']); run('git',['config','user.name','Fixture']); run('git',['config','user.email','fixture@example.invalid']);
  const commit=()=>{run('git',['add','.']);run('git',['commit','-m','Fixture revision']);}; commit();
  assert.ok(JSON.parse(cl(['check','--change','export-data','--json'],1)).findings.some(f=>f.code==='evidence-not-configured'));
  const adapter=path.join(root,'node_modules/cliewen-openspec/adapters/node-test.mjs');
  const collect=()=>run(process.execPath,[adapter,'test/export.test.mjs']); collect();
  assert.equal(JSON.parse(cl(['check','--change','export-data','--json'])).ok,true);
  const reportPath=path.join(root,'.cliewen-openspec/evidence.json');
  const clean=fs.readFileSync(reportPath,'utf8');
  const bad=JSON.parse(clean); bad.results[0].outcome='skipped'; fs.writeFileSync(reportPath,JSON.stringify(bad));
  assert.ok(JSON.parse(cl(['check','--change','export-data','--json'],1)).findings.some(f=>f.code==='test-skipped'));
  bad.results[0].outcome='pending'; bad.results[0].reason='Awaiting environment'; fs.writeFileSync(reportPath,JSON.stringify(bad));
  assert.equal(JSON.parse(cl(['check','--change','export-data','--json'])).ok,true);
  cl(['check','--change','export-data','--fail-on-pending'],1);
  fs.writeFileSync(reportPath,clean);
  for (const [results,code] of [
    [[], 'missing-evidence'],
    [[{scenario:'UNKNOWN-001',test:'unknown',outcome:'passed'}],'unknown-ac-reference'],
    [[...JSON.parse(clean).results,...JSON.parse(clean).results],'duplicate-test-result']
  ]) {
    fs.writeFileSync(reportPath,JSON.stringify({...JSON.parse(clean),results}));
    assert.ok(JSON.parse(cl(['check','--change','export-data','--json'],1)).findings.some(f=>f.code===code));
  }
  fs.writeFileSync(reportPath,clean);
  write('uncommitted.txt','dirty'); assert.ok(JSON.parse(cl(['check','--change','export-data','--json'],1)).findings.some(f=>f.code==='unverifiable-evidence')); fs.unlinkSync(path.join(root,'uncommitted.txt'));
  ospec('archive','export-data','--yes');
  assert.match(fs.readFileSync(path.join(root,'openspec/specs/export/spec.md'),'utf8'),/\[EXPORT-1\]/);
  commit(); assert.ok(JSON.parse(cl(['check','--json'],1)).findings.some(f=>f.code==='stale-evidence'));
  collect(); assert.equal(JSON.parse(cl(['check','--json'])).ok,true);
  const testPath='test/export.test.mjs'; const originalTest=fs.readFileSync(path.join(root,testPath),'utf8');
  write(testPath,originalTest+"test('unmapped regression',()=>assert.fail('failure outside AC mapping'));\n"); commit();
  run(process.execPath,[adapter,testPath],1);
  assert.ok(JSON.parse(cl(['check','--json'],1)).findings.some(f=>f.code==='runner-failed'));
  write(testPath,originalTest); commit(); collect();
  write(testPath,'this is invalid JavaScript'); commit();
  run(process.execPath,[adapter,testPath],2);
  assert.equal(fs.existsSync(reportPath),false,'crashed collection invalidates earlier passing evidence');
  write(testPath,originalTest); commit(); collect();
  assert.equal(cl(['ac','next','EXPORT']),'EXPORT-2');
  cl(['ac','rename-prefix','export','CSV']);
  cl(['ac','next','EXPORT'],2);
  assert.equal(cl(['ac','next','--capability','export']),'CSV-3');
  commit(); collect();
  assert.equal(JSON.parse(cl(['check','--json'])).ok,true,'historical IDs remain valid evidence references after a prefix change');
  const cfgPath = path.join(root, '.cliewen-openspec/config.yaml');
  fs.appendFileSync(cfgPath, '\ntesting:\n  types:\n    Component check:\n      description: In-process component boundary\n');
  const specPath = path.join(root, 'openspec/specs/export/spec.md');
  fs.writeFileSync(specPath, fs.readFileSync(specPath, 'utf8').replace('Test-type: Unit', 'Test-type: Component check'));
  write(testPath, originalTest.replace('[Test-type: Unit]', '[Test-type: Component check]')); commit(); collect();
  assert.equal(JSON.parse(cl(['check','--json'])).ok, true, 'custom types work in the packed adapter and checker');
  const customReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  assert.equal(customReport.results[0].testType, 'Component check');
  for (const [type, code] of [[undefined, 'missing-test-type'], ['Unit', 'unknown-test-type']]) {
    const changed = structuredClone(customReport); changed.results[0].testType = type;
    fs.writeFileSync(reportPath, JSON.stringify(changed));
    assert.ok(JSON.parse(cl(['check','--json'],1)).findings.some(f => f.code === code));
  }
  fs.appendFileSync(cfgPath, '    Service check:\n      description: External service boundary\n');
  commit(); collect();
  const mismatch = JSON.parse(fs.readFileSync(reportPath, 'utf8')); mismatch.results[0].testType = 'Service check';
  fs.writeFileSync(reportPath, JSON.stringify(mismatch));
  assert.ok(JSON.parse(cl(['check','--json'],1)).findings.some(f => f.code === 'test-type-mismatch'));
  write(testPath, originalTest); commit();
  run(process.execPath, [adapter, testPath], 2);
  assert.equal(fs.existsSync(reportPath), false, 'unknown test type invalidates earlier evidence');
});
