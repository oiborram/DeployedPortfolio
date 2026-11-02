import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import {site} from '../src/site-config.mjs';
import {projects} from '../src/content.mjs';

const root = new URL('../dist/', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const resume = JSON.parse(await readFile(new URL('resume.json', root), 'utf8'));
assert.equal(new URL(site.publicBaseUrl).port, '', 'Pages must use standard HTTPS');
assert.equal(resume.meta.canonical, new URL('resume.json', site.publicBaseUrl).href);
assert.equal(resume.basics.url, site.publicBaseUrl);
assert.ok(html.includes(`<link rel="canonical" href="${site.publicBaseUrl}">`));
assert.match(html, /<link rel="alternate" type="application\/json" href="resume.json"/);
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
for (const project of projects) {
  const section = html.split(`data-chapter="${project.id}"`)[1]?.split('</section>')[0];
  const readable = section?.split('<div class="base-dossier">')[1];
  assert.ok(readable, `${project.id}: missing readable HTML dossier`);
  for (const point of project.sections.flatMap(section => section.points)) {
    assert.ok(readable.includes(esc(point)), `${project.id}: technical content requires JavaScript`);
  }
}
const files = (await readdir(root, {recursive:true, withFileTypes:true}));
const allowedRoot = new Set(['index.html', 'resume.json', 'robots.txt', 'sitemap.xml', 'assets']);
for (const entry of await readdir(root)) assert.ok(allowedRoot.has(entry), `Unexpected public entry: ${entry}`);
for (const entry of files) {
  assert.ok(!entry.isSymbolicLink(), 'Pages package must not contain symbolic links');
  assert.doesNotMatch(entry.name, /^\.|\.map$|victoria-qa|proposal-|server\.mjs|package\.json|Dockerfile/);
}
for (const match of html.matchAll(/(?:src|href|poster)="(assets\/[^"?]+)(?:\?[^" ]*)?"/g)) {
  await readFile(new URL(match[1], root));
}
console.log(JSON.stringify({pagesReady: true, baseUrl: site.publicBaseUrl, projects: resume.projects.length, publicFiles: files.filter(entry => entry.isFile()).length, javascriptRequiredForDossiers: false}));
