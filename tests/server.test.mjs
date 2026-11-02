import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve, sep} from 'node:path';
import {createPortfolioServer} from '../server.mjs';

for (const basePath of ['/', '/portfolio/']) test(`two content routes and seekable video under ${basePath}`, async () => {
  const root = await mkdtemp(join(tmpdir(), 'deployedportfolio-'));
  await mkdir(join(root, 'assets'));
  await writeFile(join(root, 'index.html'), '<h1>Portfolio</h1>');
  await writeFile(join(root, 'resume.json'), '{"basics":{"name":"Oscar"}}');
  await writeFile(join(root, 'assets/demo.mp4'), '0123456789');
  const server = createPortfolioServer({publicRoot: root, basePath});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const host = `http://127.0.0.1:${server.address().port}`;
  const origin = host + basePath.slice(0, -1);
  try {
    const home = await fetch(origin + '/');
    assert.equal(home.status, 200); assert.match(await home.text(), /Portfolio/);
    const resume = await fetch(origin + '/resume.json');
    assert.match(resume.headers.get('content-type'), /application\/json/);
    assert.equal((await resume.json()).basics.name, 'Oscar');
    for (const path of ['/projects/', '/api/', '/src/content.mjs', '/.victoria/task.json', '/assets/%2e%2e/server.mjs', '/assets/secret.json', '/resume.json/']) {
      assert.equal((await fetch(origin + path)).status, 404, path);
    }
    assert.equal((await fetch(origin + '/', {method: 'POST'})).status, 405);
    const range = await fetch(origin + '/assets/demo.mp4', {headers: {Range: 'bytes=2-5'}});
    assert.equal(range.status, 206); assert.equal(await range.text(), '2345');
    assert.equal(range.headers.get('content-range'), 'bytes 2-5/10');
    assert.equal((await fetch(origin + '/assets/demo.mp4', {headers: {Range: 'bytes=20-'}})).status, 416);
    const head = await fetch(origin + '/assets/demo.mp4', {method: 'HEAD'});
    assert.equal(head.headers.get('content-length'), '10'); assert.equal(await head.text(), '');
    if (basePath !== '/') {
      assert.equal((await fetch(host + '/resume.json')).status, 404);
      assert.equal((await fetch(origin, {redirect: 'manual'})).status, 308);
    }
  } finally {
    await new Promise(resolve => server.close(resolve));
    assert.ok(resolve(root).startsWith(resolve(tmpdir()) + sep + 'deployedportfolio-'));
    await rm(root, {recursive: true, force: true});
  }
});
