import fs from 'node:fs';
import path from 'node:path';

function jsonText(file) {
  const bytes = fs.readFileSync(file);
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return bytes.subarray(2).toString('utf16le');
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return Buffer.from(bytes.subarray(2)).swap16().toString('utf16le');
  return bytes.toString('utf8').replace(/^\uFEFF/, '');
}

// Grade the response identity, not a filename the task never prescribed.
export function hasInstruction(root, artifact, schema, change) {
  const folder = path.join(root, 'docs/testing/instructions');
  if (!fs.existsSync(folder)) return false;
  return fs.readdirSync(folder).filter(name => name.endsWith('.json')).some(name => {
    try {
      const saved = JSON.parse(jsonText(path.join(folder, name)));
      return saved.schemaName === schema && saved.changeName === change && typeof saved.instruction === 'string' && !!saved.instruction.trim()
        && (saved.artifactId === artifact || (artifact === 'apply' && saved.contextFiles && !saved.artifactId));
    } catch { return false; }
  });
}
