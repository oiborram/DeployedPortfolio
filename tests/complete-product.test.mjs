import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {projects} from '../src/content.mjs';
import {chapters} from '../public/assets/chapter-config.mjs';
import {createPortfolioServer} from '../server.mjs';
const root=new URL('../',import.meta.url);
const html=await readFile(new URL('public/index.html',root),'utf8');
const production=await readFile(new URL('dist/index.html',root),'utf8');
const plan=JSON.parse(await readFile(new URL('tests/fixtures/approved-motion-contract.json',root)));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
test('18 semantic chapters preserve the complete factual dossier in ordinary base HTML',()=>{
 assert.deepEqual([...html.matchAll(/data-chapter="([^"]+)"/g)].map(m=>m[1]),Object.keys(chapters));
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 for(const p of projects){
  const section=html.split(`data-chapter="${p.id}"`)[1].split('</section>')[0];
  const base=section.split('<div class="base-dossier">')[1];
  assert.ok(base,`${p.id}: no-JS dossier`);
  for(const s of p.sections)for(const point of s.points)assert.ok(base.includes(esc(point)),`${p.id}: full point preserved`);
  assert.ok(section.includes(`data-open-details="${p.id}"`));
  for(const owner of ['foreground','midground','backplane','ambient','idle'])assert.equal((section.match(new RegExp(`data-motion="${owner}"`,'g'))||[]).length,1,`${p.id}/${owner}`);
 }
 assert.doesNotMatch(html,/AuraBones|F:\\dev\\|C:\\Users\\/i);
 assert.match(html,/<link rel="alternate" type="application\/json" href="resume.json"/);
});
test('all approved IDs, numeric scroll tracks, entry and idle trajectories survive expansion',()=>{
 assert.equal(Object.keys(chapters).length,18);
 for(const blueprint of plan.sceneBlueprints){
  const c=chapters[blueprint.id];
  assert.deepEqual(c.entry,blueprint.entry);
  assert.deepEqual(c.idle,blueprint.idle);
  assert.deepEqual(c.vectors,plan.scenes.find(s=>s.id===`${blueprint.id}-intent`).tracks.map(t=>t.values.at(-1)));
 }
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size,'unique DOM IDs');
});
test('production package excludes QA imports, observer assets and proposal gallery',async()=>{
 const app=await readFile(new URL('dist/assets/app.mjs',root),'utf8');
 assert.doesNotMatch(app,/victoriaQA|import\(['"]\.\/victoria-qa|mountPrototypeQA/);
 assert.doesNotMatch(production,/dev-loader|victoriaQA|prototype-controls|observer-panel/);
 const files=await readdir(new URL('dist/assets/',root));
 assert.ok(!files.some(n=>n.includes('victoria-qa')||n.startsWith('proposal-')));
 assert.equal((production.match(/data-chapter=/g)||[]).length,18);
});
test('actual production package serves beneath /portfolio/ with JSON and local assets',async()=>{
 const server=createPortfolioServer({publicRoot:decodeURIComponent(new URL('dist/',root).pathname).replace(/^\/([A-Za-z]:)/,'$1'),basePath:'/portfolio/'});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin=`http://127.0.0.1:${server.address().port}`;
 try{
  const response=await fetch(origin+'/portfolio/');assert.equal(response.status,200);
  const text=await response.text();
  for(const match of text.matchAll(/(?:src|href)="(assets\/[^"?]+)(?:\?[^" ]*)?"/g))assert.equal((await fetch(origin+'/portfolio/'+match[1],{method:'HEAD'})).status,200,match[1]);
  const resume=await fetch(origin+'/portfolio/resume.json');assert.match(resume.headers.get('content-type'),/application\/json/);assert.equal((await resume.json()).projects.length,15);
  assert.equal((await fetch(origin+'/portfolio/assets/victoria-qa/prototype-controls.mjs')).status,404);
  assert.equal((await fetch(origin+'/portfolio/projects/')).status,404);
 }finally{await new Promise(resolve=>server.close(resolve))}
});
