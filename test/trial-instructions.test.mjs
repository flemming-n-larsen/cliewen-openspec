import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {hasInstruction} from '../scripts/lib/trial-instructions.mjs';

test('instruction checks use JSON identity and support Windows encodings without requiring hidden filenames', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cliewen-instructions-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const folder = path.join(root, 'docs/testing/instructions'); fs.mkdirSync(folder, {recursive: true});
  const response = {schemaName: 'cliewen-discovery', changeName: 'investigate-csv-streaming', artifactId: 'proposal', instruction: 'Read this instruction.'};
  fs.writeFileSync(path.join(folder, 'change-proposal-response.json'), '\uFEFF' + JSON.stringify(response));
  assert.equal(hasInstruction(root, 'proposal', response.schemaName, response.changeName), true);
  assert.equal(hasInstruction(root, 'decision', response.schemaName, response.changeName), false);
  assert.equal(hasInstruction(root, 'proposal', response.schemaName, 'wrong-change'), false);
  const apply = {...response, artifactId: undefined, contextFiles: {decision: []}};
  fs.writeFileSync(path.join(folder, 'apply-response.json'), Buffer.concat([Buffer.from([255, 254]), Buffer.from(JSON.stringify(apply), 'utf16le')]));
  assert.equal(hasInstruction(root, 'apply', response.schemaName, response.changeName), true);
  fs.writeFileSync(path.join(folder, 'invalid.json'), 'not JSON');
  assert.equal(hasInstruction(root, 'tasks', response.schemaName, response.changeName), false);
});
