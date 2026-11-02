import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createPortfolioServer} from '../server.mjs';
import {site} from '../src/site-config.mjs';

test('Lisa prefix-stripping proxy serves HTML, JSON and assets with the checked-in contract',async()=>{
 const contract=JSON.parse(await readFile(new URL('../lisa.deploy.json',import.meta.url),'utf8'));
 assert.equal(contract.route,'portfolio');
 assert.equal(contract.service.environment.BASE_PATH,'/');
 assert.equal(contract.database,undefined,'read-only portfolio has no owned database');
 const upstream=createPortfolioServer({publicRoot:fileURLToPath(new URL('../dist/',import.meta.url)),basePath:contract.service.environment.BASE_PATH});
 await new Promise(resolve=>upstream.listen(0,'127.0.0.1',resolve));
 const upstreamOrigin=`http://127.0.0.1:${upstream.address().port}`,prefix=`/${contract.route}/`;
 const proxy=createServer(async(req,res)=>{
  if(!req.url.startsWith(prefix)){res.writeHead(404);res.end();return;}
  try{
   const response=await fetch(upstreamOrigin+'/'+req.url.slice(prefix.length),{method:req.method});
   res.writeHead(response.status,Object.fromEntries(response.headers));
   res.end(req.method==='HEAD'?undefined:Buffer.from(await response.arrayBuffer()));
  }catch{res.writeHead(502);res.end();}
 });
 await new Promise(resolve=>proxy.listen(0,'127.0.0.1',resolve));
 const origin=`http://127.0.0.1:${proxy.address().port}`;
 try{
  const page=await fetch(origin+prefix);assert.equal(page.status,200);
  const html=await page.text();
  for(const match of html.matchAll(/(?:src|href)="(assets\/[^"?]+)(?:\?[^" ]*)?"/g))assert.equal((await fetch(origin+prefix+match[1],{method:'HEAD'})).status,200,match[1]);
  const response=await fetch(origin+prefix+'resume.json');assert.equal(response.status,200);
  assert.match(response.headers.get('content-type'),/application\/json/);
  const body=await response.text();assert.equal(body,await readFile(new URL('../dist/resume.json',import.meta.url),'utf8'));
  const resume=JSON.parse(body);assert.equal(resume.basics.url,site.publicBaseUrl);
  if(!process.env.PORTFOLIO_BASE_URL)assert.equal(new URL(resume.basics.url).pathname,prefix);
  for(const path of ['src/content.mjs','.victoria/active-run.json','assets/victoria-qa/prototype-controls.mjs'])assert.equal((await fetch(origin+prefix+path)).status,404,path);
 }finally{
  await new Promise(resolve=>proxy.close(resolve));
  await new Promise(resolve=>upstream.close(resolve));
 }
});
