import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

// Execute the actual wheel listener and commit threshold. Browser-native
// scrolling is left to the browser; these tests verify which input it owns.
const source=await readFile(new URL('../public/assets/app.mjs',import.meta.url),'utf8');
const routing=source.slice(source.indexOf('function excluded(event)'),source.indexOf("$('#slide-prev').addEventListener"));
function fixture({flow=true,top=0,height=700,total=1000,reduced=false}={}){
 const handlers={},navigations=[];let clock=0;
 const c={flow,reduced,busy:false,initialized:true,holdThreshold:false,active:3,
  wheelEvents:0,lastDirection:0,lastWheel:-Infinity,cooldownUntil:0,catchup:null,
  performance:{now:()=>clock+=200},main:{scrollTop:top,clientHeight:height,scrollHeight:total},
  scroller:{scrollTop:180,clientHeight:800,addEventListener:(name,handler)=>handlers[name]=handler},
  Element:class{constructor(kind){this.kind=kind}matches(selector){return this.kind==='visual'?selector==='[data-visual-field]':this.kind==='dialog'&&selector.includes('dialog')}},
  navigate:(to,origin)=>{navigations.push({to,origin});return true;}
 };
 c.setNeutral=()=>{c.scroller.scrollTop=180;c.wheelEvents=0;c.lastDirection=0;};
 runInNewContext(routing,c);
 const wheel=(deltaY,path=[])=>{let prevented=false;handlers.wheel({deltaY,deltaX:0,deltaMode:0,ctrlKey:false,metaKey:false,composedPath:()=>path,preventDefault(){prevented=true}});return prevented;};
 return {c,navigations,wheel};
}

test('reading-mode wheel advances at the bottom and reverses at the top',()=>{
 for(const [top,delta,to] of [[300,120,4],[0,-120,2]]){
  const f=fixture({top});
  assert.equal(f.wheel(delta),true);assert.equal(f.wheel(delta),true);
  assert.deepEqual(f.navigations,[],'keep the existing multi-notch threshold');
  assert.equal(f.wheel(delta),true);
  assert.deepEqual(f.navigations,[{to,origin:'wheel'}]);
 }
});

test('reading-mode wheel remains native while content can scroll in that direction',()=>{
 for(const [top,delta] of [[0,120],[100,120],[100,-120],[300,-120]]){
  const f=fixture({top});
  for(let i=0;i<4;i++)assert.equal(f.wheel(delta),false);
  assert.deepEqual(f.navigations,[]);assert.equal(f.c.scroller.scrollTop,180);
 }
});

test('returning to native reading cancels a partial chapter gesture',()=>{
 const f=fixture({top:300});f.wheel(120);f.wheel(120);
 assert.equal(f.c.scroller.scrollTop,300);
 assert.equal(f.wheel(-120),false);
 assert.equal(f.c.scroller.scrollTop,180);assert.equal(f.c.wheelEvents,0);
 f.c.main.scrollTop=0;f.wheel(-120);f.wheel(-120);f.wheel(-120);
 assert.deepEqual(f.navigations,[{to:2,origin:'wheel'}]);
});

test('full-stage navigation preserves its threshold and native dialogs/reduced mode remain excluded',()=>{
 const f=fixture({flow:false});f.wheel(120);f.wheel(120);f.wheel(120);
 assert.deepEqual(f.navigations,[{to:4,origin:'wheel'}]);
 const dialog=fixture({top:300});
 assert.equal(dialog.wheel(120,[new dialog.c.Element('dialog')]),false);
 assert.deepEqual(dialog.navigations,[]);
 const reduced=fixture({reduced:true,top:300});
 assert.equal(reduced.wheel(120),false);assert.deepEqual(reduced.navigations,[]);
});
