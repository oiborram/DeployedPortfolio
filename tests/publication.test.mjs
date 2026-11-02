import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile, mkdtemp, cp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn, execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {projects, profile} from '../src/content.mjs';
import {site, validatePublicationBaseUrl} from '../src/site-config.mjs';
import {createPortfolioServer} from '../server.mjs';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const execute = promisify(execFile);
const read = path => readFile(join(projectRoot, path), 'utf8');
const canonical = new URL('resume.json', site.publicBaseUrl).href;
const esc = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
async function removeFixture(path) {
  assert.ok(resolve(path).startsWith(resolve(tmpdir()) + sep + 'portfolio-publication-'));
  await rm(path, {recursive: true, force: true});
}

test('one validated publication base supports the configured prefix and rejects unsafe identities', () => {
  assert.equal(validatePublicationBaseUrl('https://example.test:9443/portfolio/'), 'https://example.test:9443/portfolio/');
  for (const invalid of ['http://example.test/', 'https://example.test/portfolio', 'https://user:pass@example.test/', 'https://example.test/?q=x/', 'https://example.test/#x/', 'https://example.test/path%2Fother/', 'not a URL']) {
    assert.throws(() => validatePublicationBaseUrl(invalid), /PORTFOLIO_BASE_URL/);
  }
});

for (const output of ['public', 'dist']) {
  test(`${output}: canonical JSON, factual namespace and every detailed section remain discoverable`, async () => {
    const resume = JSON.parse(await read(`${output}/resume.json`));
    assert.equal(resume.meta.canonical, canonical);
    assert.equal(resume.basics.url, site.publicBaseUrl);
    assert.equal(resume.projects.length, 15);
    assert.equal(resume.custom.deployedPortfolio.language, 'en');
    assert.equal(resume.custom.deployedPortfolio.author.name, profile.name);
    assert.match(resume.custom.deployedPortfolio.authorship, /AI assistance/);
    assert.equal(resume.custom.deployedPortfolio.projectDetails.length, 15);
    let sectionCount = 0;
    for (const [i, item] of resume.custom.deployedPortfolio.projectDetails.entries()) {
      assert.equal(item.id, projects[i].id);
      const sections = item.pointer.split('/').slice(1).reduce((value, key) => value[key], resume);
      assert.deepEqual(sections, projects[i].sections);
      sectionCount += sections.length;
      assert.deepEqual(resume.projects[i].highlights, projects[i].highlights);
    }
    assert.equal(sectionCount, 42);
    const html = await read(`${output}/index.html`);
    assert.ok(html.includes(`<link rel="canonical" href="${site.publicBaseUrl}">`));
    assert.match(html, /<link rel="alternate" type="application\/json" href="resume.json"/);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    assert.equal(graph[0]['@type'], 'Person');
    for (const work of graph.slice(1)) assert.deepEqual(work.author, {'@type':'Person', '@id':site.publicBaseUrl+'#person', name:profile.name});
    const vision = projects.find(p => p.id === 'vision');
    const visionBody = html.split('data-chapter="vision"')[1].split('</section>')[0].split('<div class="base-dossier">')[1];
    assert.ok(visionBody.includes(esc(vision.summary)), 'structured vision description is in the real readable dossier');
    assert.match(html, /class="identity" id="site-brand"/);
    assert.match(html, /id="intent-marker"/);
    assert.match(html, /id="technical-panel-title" data-panel-heading/);
    const robots = await read(`${output}/robots.txt`);
    assert.equal(robots, `User-agent: *\nAllow: ${new URL(site.publicBaseUrl).pathname}\nSitemap: ${new URL('sitemap.xml', site.publicBaseUrl).href}\n`);
    assert.doesNotMatch(robots, /Disallow:|noai/i);
    const sitemap = await read(`${output}/sitemap.xml`);
    assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]), [site.publicBaseUrl]);
  });

  for (const basePath of ['/', '/portfolio/']) test(`${output} ${basePath}: anonymous GET/HEAD, equal agent bodies and origin-root discovery`, async () => {
    const server = createPortfolioServer({publicRoot: join(projectRoot, output), basePath});
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const host = `http://127.0.0.1:${server.address().port}`;
    try {
      let firstBody;
      for (const agent of ['Mozilla/5.0 (Portfolio browser)', 'GPTBot/1.2', 'ClaudeBot/1.0']) {
        const response = await fetch(host + basePath + 'resume.json', {headers: {'User-Agent': agent, Host: 'untrusted.example', Origin:'https://recruiting-agent.example'}});
        assert.equal(response.status, 200);
        assert.match(response.headers.get('content-type'), /^application\/json; charset=utf-8$/);
        assert.equal(response.headers.get('content-disposition'), null);
        assert.equal(response.headers.get('x-robots-tag'), null);
        assert.equal(response.headers.get('access-control-allow-origin'), '*');
        assert.equal(response.headers.get('access-control-expose-headers'), 'Link');
        assert.equal(response.headers.get('access-control-allow-credentials'), null);
        assert.equal(response.headers.get('link'), `<${canonical}>; rel="canonical"; type="application/json", <${site.publicBaseUrl}>; rel="alternate"; type="text/html"; hreflang="en"`);
        const body = await response.text();
        firstBody ??= body;
        assert.equal(body, firstBody);
        const head = await fetch(host + basePath + 'resume.json', {method:'HEAD', headers:{'User-Agent':agent, Origin:'https://another-agent.example'}});
        assert.equal(head.status, 200);
        for (const header of ['content-type', 'content-length', 'link']) assert.equal(head.headers.get(header), response.headers.get(header));
        for (const header of ['access-control-allow-origin','access-control-expose-headers','access-control-allow-credentials']) assert.equal(head.headers.get(header), response.headers.get(header));
        assert.equal(await head.text(), '');
      }
      const home = await fetch(host + basePath);
      assert.equal(home.status, 200);
      assert.equal(home.headers.get('access-control-allow-origin'), null);
      assert.ok(home.headers.get('link').includes(`<${canonical}>; rel="alternate"; type="application/json"`));
      const homeHead = await fetch(host + basePath, {method:'HEAD'});
      assert.equal(homeHead.headers.get('link'), home.headers.get('link'));
      for (const [path, type] of [['robots.txt', 'text/plain'], ['sitemap.xml', 'application/xml']]) {
        const get = await fetch(host + '/' + path);
        const head = await fetch(host + '/' + path, {method:'HEAD'});
        assert.equal(get.status, 200); assert.equal(head.status, 200);
        assert.equal(get.headers.get('access-control-allow-origin'), null);
        assert.equal(get.headers.get('content-type'), `${type}; charset=utf-8`);
        assert.equal(head.headers.get('content-length'), get.headers.get('content-length'));
        assert.equal(await get.text(), await read(`${output}/${path}`));
        assert.equal(await head.text(), '');
        assert.equal((await fetch(host + '/' + path, {method:'POST'})).status, 405);
        if (basePath !== '/') assert.equal((await fetch(host + basePath + path)).status, 404);
      }
      if (basePath !== '/') assert.equal((await fetch(host + '/resume.json')).status, 404);
      for (const path of ['llms.txt', 'api/', 'projects/', 'sitemap.xml/extra', 'robots.txt/extra']) assert.equal((await fetch(host + basePath + path)).status, 404, path);
    } finally { await new Promise(resolve => server.close(resolve)); }
  });
}

test('unsafe built canonical fails closed rather than becoming an HTTP relationship', async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'portfolio-publication-invalid-'));
  await writeFile(join(fixture, 'index.html'), '<h1>Portfolio</h1>');
  await writeFile(join(fixture, 'resume.json'), JSON.stringify({basics:{url:site.publicBaseUrl}, meta:{canonical:'https://untrusted.example/resume.json'}}));
  const server = createPortfolioServer({publicRoot:fixture});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/resume.json`);
    assert.equal(response.status, 500); assert.equal(response.headers.get('link'), null);
  } finally { await new Promise(resolve => server.close(resolve)); await removeFixture(fixture); }
});

test('publication override rebuilds every representation and the exact Docker-style standalone package starts', async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'portfolio-publication-package-'));
  let child;
  try {
    await mkdir(join(fixture, 'scripts'));
    await cp(join(projectRoot, 'src'), join(fixture, 'src'), {recursive:true});
    await cp(join(projectRoot, 'public/assets'), join(fixture, 'public/assets'), {recursive:true});
    for (const script of ['build-site.mjs', 'build-resume.mjs']) await cp(join(projectRoot, 'scripts', script), join(fixture, 'scripts', script));
    const override = 'https://publication.example:9443/cases/';
    const env = {...process.env, PORTFOLIO_BASE_URL:override};
    await execute(process.execPath, ['scripts/build-site.mjs'], {cwd:fixture, env});
    await execute(process.execPath, ['scripts/build-site.mjs', '--production'], {cwd:fixture, env});
    for (const output of ['public', 'dist']) {
      assert.equal(JSON.parse(await readFile(join(fixture, output, 'resume.json'), 'utf8')).meta.canonical, override+'resume.json');
      assert.ok((await readFile(join(fixture, output, 'index.html'), 'utf8')).includes(`<link rel="canonical" href="${override}">`));
      assert.ok((await readFile(join(fixture, output, 'robots.txt'), 'utf8')).includes('Sitemap: https://publication.example:9443/cases/sitemap.xml'));
      assert.ok((await readFile(join(fixture, output, 'sitemap.xml'), 'utf8')).includes(`<loc>${override}</loc>`));
    }
    const bundle = join(fixture, 'standalone');
    await mkdir(bundle);
    await cp(join(projectRoot, 'server.mjs'), join(bundle, 'server.mjs'));
    await cp(join(fixture, 'dist'), join(bundle, 'public'), {recursive:true});
    child = spawn(process.execPath, ['server.mjs'], {cwd:bundle, env:{...process.env, NODE_ENV:'production', HOST:'127.0.0.1', PORT:'0', BASE_PATH:'/cases/'}, windowsHide:true, stdio:['ignore','pipe','pipe']});
    const address = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Standalone server did not start in 5 seconds')), 5000);
      let output = '';
      child.stdout.on('data', bytes => { output += bytes; const match = output.match(/http:\/\/127\.0\.0\.1:\d+\/cases\//); if (match) {clearTimeout(timeout); resolve(match[0]);} });
      child.once('error', error => {clearTimeout(timeout); reject(error);});
      child.once('exit', code => {clearTimeout(timeout); reject(new Error(`Standalone server exited ${code}`));});
    });
    const resume = await fetch(address + 'resume.json');
    assert.equal(resume.status, 200);
    assert.equal((await resume.json()).meta.canonical, override+'resume.json');
    assert.ok(resume.headers.get('link').includes(`<${override}resume.json>; rel="canonical"`));
    assert.equal((await fetch(address)).status, 200);
    assert.equal((await fetch(new URL('/robots.txt', address))).status, 200);
    assert.equal((await fetch(new URL('/sitemap.xml', address))).status, 200);
  } finally {
    if (child && child.exitCode === null) {const stopped = new Promise(resolve => child.once('exit', resolve)); child.kill(); await stopped;}
    await removeFixture(fixture);
  }
});
