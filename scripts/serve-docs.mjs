import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../site-dist/', import.meta.url));
export const prefix = '/cliewen-openspec/';
export async function serveDocs(port = 4173) {
  if (!fs.existsSync(path.join(root, 'index.html'))) throw Error('Run npm run docs:build first');
  const server = http.createServer((req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/') { res.writeHead(302, {Location: prefix}); res.end(); return; }
      if (!url.pathname.startsWith(prefix)) { res.writeHead(404); res.end(); return; }
      const relative = decodeURIComponent(url.pathname.slice(prefix.length)) || 'index.html';
      const file = path.resolve(root, relative), within = path.relative(root, file);
      if (within.startsWith('..') || path.isAbsolute(within) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
      const types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2'};
      res.writeHead(200, {'Content-Type': types[path.extname(file)] ?? 'application/octet-stream'});
      fs.createReadStream(file).pipe(res);
    } catch { res.writeHead(400); res.end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return {server, url: `http://127.0.0.1:${server.address().port}${prefix}`};
}
if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  const {url} = await serveDocs();
  console.log(`Documentation preview: ${url}`);
}
