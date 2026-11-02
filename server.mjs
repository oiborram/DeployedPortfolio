import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {stat, realpath, readFile} from 'node:fs/promises';
import {resolve, dirname, extname, sep} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), 'public');
const types = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.json', 'application/json; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'], ['.xml', 'application/xml; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'], ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'], ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'], ['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'], ['.woff2', 'font/woff2'], ['.mp4', 'video/mp4'], ['.webm', 'video/webm']
]);

export function createPortfolioServer({publicRoot = root, basePath = '/'} = {}) {
  const base = resolve(publicRoot);
  if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(basePath)) throw new Error('BASE_PATH must start and end with / and contain only simple path segments.');
  // Read the built publication identity, so the standalone image needs only
  // server.mjs + dist. Request Host and forwarding headers never define it.
  let publication;
  const publicationLinks = () => publication ??= readFile(resolve(base, 'resume.json'), 'utf8').then(text => {
    const resume = JSON.parse(text);
    if (!resume.meta?.canonical) return null; // Small injected test fixtures may omit publication metadata.
    const home = new URL(resume.basics.url), json = new URL(resume.meta.canonical);
    if (home.protocol !== 'https:' || home.username || home.password || home.search || home.hash || !/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(home.pathname) || json.href !== new URL('resume.json', home).href) {
      throw new Error('Invalid built publication identity');
    }
    return {home: home.href, json: json.href};
  });
  return createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, {Allow: 'GET, HEAD'}); return res.end('Method not allowed');
    }
    let path;
    try { path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch {res.writeHead(400); return res.end('Invalid request');}
    // These two approved discovery resources live at the origin root even
    // when the content is mounted beneath /portfolio/.
    const technicalFile = new Map([['/robots.txt', 'robots.txt'], ['/sitemap.xml', 'sitemap.xml']]).get(path);
    if (!technicalFile && basePath !== '/') {
      if (path === basePath.slice(0, -1)) {
        res.writeHead(308, {Location: basePath}); return res.end();
      }
      if (!path.startsWith(basePath)) {res.writeHead(404); return res.end('Not found');}
      path = '/' + path.slice(basePath.length);
    }
    let filename;
    if (technicalFile) filename = technicalFile;
    else if (path === '/') filename = 'index.html';
    else if (path === '/resume.json') filename = 'resume.json';
    else if (path.startsWith('/assets/') && !path.includes('\\') && !path.includes('\0')) {
      filename = path.slice(1);
      if (!types.has(extname(filename).toLowerCase()) || ['.html', '.json', '.txt', '.xml'].includes(extname(filename).toLowerCase())) {
        res.writeHead(404); return res.end('Not found');
      }
    } else {res.writeHead(404); return res.end('Not found');}
    try {
      const target = await realpath(resolve(base, filename));
      const actualBase = await realpath(base);
      if (!target.startsWith(actualBase + sep)) {res.writeHead(404); return res.end('Not found');}
      const info = await stat(target);
      if (!info.isFile()) {res.writeHead(404); return res.end('Not found');}
      const headers = {
        'Content-Type': types.get(extname(target).toLowerCase()),
        'Cache-Control': path.startsWith('/assets/') && process.env.NODE_ENV === 'production' ? 'public, max-age=3600' : 'no-cache',
        'Content-Length': info.size,
        'Accept-Ranges': 'bytes'
      };
      if (path === '/' || path === '/resume.json') {
        const links = await publicationLinks();
        if (links) headers.Link = path === '/resume.json'
          ? `<${links.json}>; rel="canonical"; type="application/json", <${links.home}>; rel="alternate"; type="text/html"; hreflang="en"`
          : `<${links.home}>; rel="canonical"; type="text/html", <${links.json}>; rel="alternate"; type="application/json"; hreflang="en"`;
        if (path === '/resume.json') {
          headers['Access-Control-Allow-Origin'] = '*';
          headers['Access-Control-Expose-Headers'] = 'Link';
        }
      }
      // Bounded byte ranges keep the supplied demo seekable without loading the full video.
      let start = 0, end = info.size - 1, status = 200;
      if (req.headers.range) {
        const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if (!range || (!range[1] && !range[2])) {
          res.writeHead(416, {'Content-Range': `bytes */${info.size}`}); return res.end();
        }
        if (!range[1]) start = Math.max(0, info.size - Number(range[2]));
        else {start = Number(range[1]); if (range[2]) end = Math.min(end, Number(range[2]));}
        if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= info.size) {
          res.writeHead(416, {'Content-Range': `bytes */${info.size}`}); return res.end();
        }
        status = 206; headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
        headers['Content-Length'] = end - start + 1;
      }
      res.writeHead(status, headers);
      if (req.method === 'HEAD') return res.end();
      const stream = createReadStream(target, {start, end});
      stream.on('error', () => res.destroy());
      res.on('close', () => stream.destroy());
      stream.pipe(res);
    } catch (error) {
      if (!res.headersSent) res.writeHead(error.code === 'ENOENT' ? 404 : 500);
      res.end(error.code === 'ENOENT' ? 'Not found' : 'Unable to serve resource');
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const port = Number(process.env.PORT || 4179);
  const host = process.env.HOST || '127.0.0.1';
  const basePath = process.env.BASE_PATH || '/';
  const server = createPortfolioServer({basePath});
  server.on('error', error => {console.error(error.message); process.exitCode = 1;});
  server.listen(port, host, () => console.log(`DeployedPortfolio: http://${host}:${server.address().port}${basePath}`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
}
