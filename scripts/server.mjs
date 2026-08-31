import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const root = resolve(process.argv[2] || 'public');
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };
const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const candidate = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (candidate !== root && !candidate.startsWith(root + sep)) { response.writeHead(403).end('Forbidden'); return; }
  const file = existsSync(candidate) && statSync(candidate).isFile() ? candidate : resolve(root, 'index.html');
  if (!existsSync(file)) { response.writeHead(404).end('Not found'); return; }
  response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
  if (request.method === 'HEAD') response.end(); else createReadStream(file).pipe(response);
});
server.listen(port, '127.0.0.1', () => console.log(`IBI Company Finder: http://127.0.0.1:${port}`));

