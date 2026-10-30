import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import MarkdownIt from 'markdown-it';
import { JSDOM } from 'jsdom';
import { parse, stringify } from 'yaml';
import { defaults } from '../dist/core.js';
import { pages as mainPages } from '../site/pages.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'site-dist');
const staging = path.join(root, '.tmp/vitepress-content');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const strip = s => s.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
const pages = mainPages;
const bySource = new Map(pages.map(p => [p.source, p.output]));
const md = new MarkdownIt();
function expand(text) {
  return text.replace(/\{\{include:([^}]+)\}\}/g, (_, source) => {
    if (!/^docs\/examples\/csv\/[\w./-]+$/.test(source) || source.includes('..')) throw Error(`Invalid include ${source}`);
    const content = read(source);
    if (source.endsWith('.md')) return strip(content).replace(/^# .+\r?\n/, '');
    return `\n\`\`\`${source.endsWith('.yaml') ? 'yaml' : 'js'}\n${content.trimEnd()}\n\`\`\`\n`;
  });
}

const config = read('docs/configuration.md').match(/<!-- defaults -->\s*```yaml\r?\n([\s\S]*?)```/);
if (!config) throw Error('Missing documented defaults');
assert.deepEqual(parse(config[1]), defaults(), 'Documented defaults must match the CLI');
for (const target of [output, staging]) {
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative) || !['site-dist', path.join('.tmp', 'vitepress-content')].includes(relative)) throw Error('Unsafe generated directory');
  fs.rmSync(target, {recursive: true, force: true});
  fs.mkdirSync(target, {recursive: true});
}
const diagrams = [];
for (const p of pages) {
  let content = expand(strip(read(p.source))).replace('<!-- defaults -->', '');
  // Remap source links to stable flat URLs; unrendered repository files link to GitHub.
  content = content.replace(/\]\(([^)]+)\)/g, (original, href) => {
    if (/^(?:[a-z]+:|\/|#)/i.test(href)) return original;
    const [filename, anchor] = href.split('#');
    const source = path.posix.normalize(path.posix.join(path.posix.dirname(p.source), filename));
    if (!fs.existsSync(path.join(root, source))) throw Error('Missing source link: ' + p.source + ' -> ' + href);
    const target = bySource.get(source);
    const destination = target ? './' + target.replace(/\.html$/, '.md') : 'https://github.com/flemming-n-larsen/cliewen-openspec/blob/main/' + source;
    return '](' + destination + (anchor ? '#' + anchor : '') + ')';
  });
  for (const token of md.parse(content, {})) if (token.type === 'fence' && token.info.trim() === 'mermaid') diagrams.push(token.content);
  const original = read(p.source).match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const frontmatter = {...(original ? parse(original[1]) : {}), sourcePath: p.source};
  fs.writeFileSync(path.join(staging, p.output.replace(/\.html$/, '.md')), '---\n' + stringify(frontmatter) + '---\n' + content);
}
// Mermaid sanitizes labels while parsing; supply its DOM only during syntax checks.
const {window} = new JSDOM('');
globalThis.window = window;
globalThis.document = window.document;
const {default: mermaid} = await import('mermaid');
mermaid.initialize({startOnLoad: false, securityLevel: 'strict'});
for (const diagram of diagrams) await mermaid.parse(diagram);
delete globalThis.window;
delete globalThis.document;
const {build} = await import('vitepress');
await build(path.join(root, 'site'));
fs.writeFileSync(path.join(output, '.nojekyll'), '');
let links = 0;
for (const p of pages) {
  const dom = new JSDOM(fs.readFileSync(path.join(output, p.output), 'utf8'));
  for (const element of dom.window.document.querySelectorAll('[href], [src]')) {
    const href = element.getAttribute('href') ?? element.getAttribute('src');
    if (/^(?:[a-z]+:|\/\/)/i.test(href)) continue;
    let [filename, fragment] = href.split('#');
    filename = filename.replace(/^\/cliewen-openspec\//, '');
    if (filename === '') filename = fragment ? p.output : 'index.html';
    const target = path.resolve(output, filename);
    const relative = path.relative(output, target);
    if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(target)) throw Error('Broken link: ' + p.output + ' -> ' + href);
    if (fragment && !new JSDOM(fs.readFileSync(target, 'utf8')).window.document.getElementById(decodeURIComponent(fragment))) throw Error('Missing anchor: ' + p.output + ' -> ' + href);
    links++;
  }
}
console.log('Built ' + pages.length + ' VitePress pages; checked ' + links + ' local links, ' + diagrams.length + ' diagrams, and CLI defaults.');
