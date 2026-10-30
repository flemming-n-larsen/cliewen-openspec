import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../docs/examples/csv/', import.meta.url));
const change = 'openspec/changes/add-csv-export';
const plan = ['proposal.md', 'design.md', 'tasks.md', 'specs/csv-export/spec.md'];
const implementation = ['export.mjs', 'test/export.test.mjs', 'README.md'];
const normalize = text => text.replace(/\r\n/g, '\n');
const [mode, ...extra] = process.argv.slice(2);
if (extra.length || !['plan', 'implementation', 'complete'].includes(mode)) throw Error('Use copy-csv-example.mjs plan|implementation|complete from the pilot directory');
if (!fs.existsSync(`${change}/.openspec.yaml`)) throw Error('Create add-csv-export with OpenSpec first');
if (mode === 'complete') {
  const expected = [
    ...plan.map(p => [path.join(source, 'change', p), `${change}/${p}`]),
    ...implementation.map(p => [path.join(source, p), p]),
  ];
  for (const [from, to] of expected) {
    if (!fs.existsSync(to) || normalize(fs.readFileSync(from, 'utf8')) !== normalize(fs.readFileSync(to, 'utf8'))) throw Error(`Reference file differs: ${to}; review and complete your tasks manually`);
  }
  const tasks = `${change}/tasks.md`;
  fs.writeFileSync(tasks, fs.readFileSync(tasks, 'utf8').replaceAll('- [ ]', '- [x]'));
  console.log('Marked the reference tasks complete. This does not run tests; run them and review assertions before using this mode.');
} else {
  const files = mode === 'plan'
    ? plan.map(p => [path.join(source, 'change', p), `${change}/${p}`])
    : implementation.map(p => [path.join(source, p), p]);
  for (const [, to] of files) if (fs.existsSync(to)) throw Error(`Refusing to overwrite ${to}`);
  for (const [from, to] of files) { fs.mkdirSync(path.dirname(to), {recursive: true}); fs.copyFileSync(from, to); }
  console.log(`Copied reference ${mode} files. Review the files before continuing.`);
}
