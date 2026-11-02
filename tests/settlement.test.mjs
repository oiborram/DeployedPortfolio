import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {chapters} from '../public/assets/chapter-config.mjs';

// Exercise the actual settlement functions without a browser. These doubles
// model inline style ownership, not rendering, geometry or visual acceptance.
const source=await readFile(new URL('../public/assets/app.mjs',import.meta.url),'utf8');
const settlement=source.slice(source.indexOf('function syncChrome('),source.indexOf('function enterInitial('));
function element(){
 const classes=new Set();
 return {style:{removeProperty(key){delete this[key]},setProperty(key,value){this[key]=value}},
  classList:{toggle(key,on){on?classes.add(key):classes.delete(key)},remove(key){classes.delete(key)},contains:key=>classes.has(key)},
  dataset:{},attributes:{},setAttribute(key,value){this.attributes[key]=value},focus(){this.focused=true},textContent:'Chapter'};
}
function fixture({from=0,to=1,hidden=false,reduced=false,busy=true,ids=['vision','inference']}={}){
 const slides=ids.map(()=>element());
 for(const slide of slides){
  slide.parts={heading:element(),reading:element(),subject:element(),media:element()};
  slide.querySelector=()=>slide.parts.media;
  slide.style.visibility='visible';slide.style.opacity='1';slide.style.top='-140px';
  for(const part of Object.values(slide.parts))Object.assign(part.style,{transform:'translate(20px, 32px)',opacity:'.2',visibility:'visible'});
 }
 slides[from].classList.toggle('is-active',true);
 if(hidden)slides[from].style.visibility='hidden';
 slides[to].classList.toggle('is-active',true);
 const controls=new Map(),events=[],owner={callbacks:{onComplete:()=>assert.fail('stale completion'),onUpdate:()=>assert.fail('stale update')},
  eventCallback(key,value){this.callbacks[key]=value;events.push(`disarm:${key}`)},kill(){this.killed=true;events.push('kill')}};
 const context={chapters,slides,ids,active:from,requested:to,reduced,busy,initialized:true,transition:owner,
  main:Object.assign(element(),{scrollTop:140}),body:element(),location:{hash:'#vision'},history:{pushState(){events.push('history')}},
  $:key=>{if(!controls.has(key))controls.set(key,element());return controls.get(key)},
  heading:s=>s.parts.heading,reading:s=>s.parts.reading,subject:s=>s.parts.subject,
  signatureBridge:{remove(){events.push('bridge-remove')}},completedEntrances:new Set(),navSource:'transport',
  setNeutral(){events.push('neutral')},createLoops(){events.push('loops')},suspendMedia(){events.push('media-suspend')},restoreMedia(){events.push('media-restore')},measureFit(){events.push('fit')},
  gsap:{set(targets,vars){
   assert.ok(owner.killed,'finite owner must stop before DOM cleanup');
   for(const target of Array.isArray(targets)?targets:[targets]){
    if(vars.clearProps)for(const key of vars.clearProps.split(','))target.style.removeProperty(key);
    for(const [key,value] of Object.entries(vars))if(key!=='clearProps')target.style[key]=value;
   }
  }}
 };
 context.main.classList.toggle('is-transitioning',true);
 runInNewContext(settlement,context);
 return {context,events,owner,slides};
}
function assertSettled(f,active,{flow=false}={}){
 assert.equal(f.context.active,active);assert.equal(f.context.transition,null);assert.equal(f.context.signatureBridge,null);
 assert.equal(f.context.main.classList.contains('is-transitioning'),false);
 for(const [i,slide] of f.slides.entries()){
  assert.equal(slide.classList.contains('is-active'),i===active);
  assert.equal(slide.inert,!flow&&i!==active);assert.equal(slide.attributes['aria-hidden'],String(!flow&&i!==active));
  for(const property of ['visibility','opacity','top','transform'])assert.equal(slide.style[property],undefined,`parent ${i}/${property}`);
  for(const [partName,part] of Object.entries(slide.parts))for(const property of ['visibility','opacity',...(partName==='media'?[]:['transform'])])assert.equal(part.style[property],undefined,`${i}/${partName}/${property}`);
 }
 assert.deepEqual(f.events.slice(0,3),['disarm:onComplete','disarm:onUpdate','kill']);
}
for(const from of [0,1])for(const hidden of [false,true])test(`settle ${from}→${1-from} ${hidden?'after':'before'} parent hide; repeated settlement stays clean`,()=>{
 const f=fixture({from,to:1-from,hidden});
 f.context.settle();assertSettled(f,1-from);assert.equal(f.context.busy,false);assert.equal(f.context.main.scrollTop,0);
 // A later Pause/resize/visibility settle while dwelling must not move reading.
 f.context.main.scrollTop=97;f.context.settle();assertSettled(f,1-from);assert.equal(f.context.main.scrollTop,97);
 assert.equal(f.events.filter(e=>e==='loops').length,1);
});
test('normal completion uses the same atomic cleanup as interruptions',()=>{
 const f=fixture();f.context.completeNavigation();assertSettled(f,1);
});
test('history settlement adopts the requested chapter without a new history entry',()=>{
 const f=fixture({from:1,to:0});f.context.navSource='history';f.context.settle();assertSettled(f,0);assert.equal(f.events.includes('history'),false);
});
test('reduced flow clears residue and exposes both complete chapters',()=>{
 const f=fixture({reduced:true});f.context.settle();assertSettled(f,1,{flow:true});
});
test('atomic settlement remains exclusive across every expanded forward and reverse chapter edge',()=>{
 const ids=Object.keys(chapters);
 for(let from=0;from<ids.length;from++)for(const to of [from-1,from+1].filter(i=>i>=0&&i<ids.length)){
  const f=fixture({from,to,ids,hidden:from%2===0});
  f.context.settle();assertSettled(f,to);
  assert.equal(f.slides.filter(s=>s.classList.contains('is-active')).length,1);
 }
});
