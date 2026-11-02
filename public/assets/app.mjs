import {chapters} from './chapter-config.mjs';
const $=s=>document.querySelector(s);
const gsap=window.gsap;
const body=document.body;
const scroller=$('#deck-scroll');
const main=$('#main');
let signatureBridge=null;
const slides=[...document.querySelectorAll('[data-chapter]')];
const ids=slides.map(s=>s.dataset.chapter);
const video=$('#ocuwatch-demo');
const heading=s=>s.querySelector('[data-heading]');
const subject=s=>s.querySelector('[data-entry="subject"]');
const reading=s=>s.querySelector('[data-reading]');
const pref=matchMedia('(prefers-reduced-motion: reduce)');
const safeGet=(k,f)=>{try{return sessionStorage.getItem(k)??f}catch{return f}};
const safeSet=(k,v)=>{try{sessionStorage.setItem(k,v)}catch{}};
let active=Math.max(0,ids.indexOf(location.hash.slice(1))),requested=active;
let mode=safeGet('portfolio-motion-mode','full');
let paused=safeGet('portfolio-motion-paused','false')==='true';
let reduced=false,flow=false,busy=false,initialized=false;
let freezeTime=false,holdThreshold=false,transition=null,loops=[],routeOwners=[];
let entranceHold=false;
let wheelEvents=0,lastWheel=-Infinity,cooldownUntil=0,lastDirection=0;
let frameRequest=0,navSource='initial',opener=null,systemPausing=false,eligibleMedia=false,userPaused=true;
const completedEntrances=new Set();
const pose={p:0};
const vectors=Object.fromEntries(Object.entries(chapters).map(([id,c])=>[id,c.vectors]));
const slideParts=slides.map(s=>({foreground:s.querySelector('[data-motion="foreground"]'),midground:s.querySelector('[data-motion="midground"]'),backplane:s.querySelector('[data-motion="backplane"]'),ambient:s.querySelector('[data-motion="ambient"]'),idle:s.querySelector('[data-motion="idle"]')}));
const quick=gsap?slideParts.map(p=>Object.fromEntries(Object.entries(p).map(([key,el])=>[key,{x:gsap.quickSetter(el,'x','px'),y:gsap.quickSetter(el,'y','px')}]))):[];
function paintPose(){
 if(!gsap)return;
 ['foreground','midground','backplane'].forEach((key,i)=>{const [x,y]=vectors[ids[active]][i];quick[active][key].x(x*pose.p);quick[active][key].y(y*pose.p)});
 gsap.set('#intent-marker',{scaleX:Math.abs(pose.p)});
 const out=$('#qa-native-readout');if(out)out.textContent=`Actual scrollTop: ${scroller.scrollTop.toFixed(2)} · progress: ${pose.p.toFixed(4)}`;
}
const catchup=gsap?.quickTo(pose,'p',{duration:.08,ease:'none',onUpdate:paintPose});
function setNeutral(){scroller.scrollTop=180;catchup?.tween.pause();pose.p=0;paintPose();wheelEvents=0;lastDirection=0}
// Full is the normal presentation. A default selection is never consent to
// override an operating-system accessibility preference.
function isReduced(){return mode==='reduced'||pref.matches}
function suspendMedia(){if(!video.paused&&!video.ended){eligibleMedia=true;systemPausing=true;video.pause()}}
function restoreMedia(){if(eligibleMedia&&!userPaused&&ids[active]==='vision'&&!document.hidden&&!reduced){eligibleMedia=false;video.play().catch(()=>{$('#video-status').textContent='Playback is paused. Use the native play control to continue.'})}}
video.addEventListener('play',()=>{userPaused=false;$('#video-status').textContent=''});
video.addEventListener('pause',()=>{if(systemPausing){systemPausing=false;return}userPaused=true;eligibleMedia=false});
video.addEventListener('ended',()=>{userPaused=true;eligibleMedia=false});
video.addEventListener('error',()=>{$('#video-status').textContent='The demo could not load. The recorded frame and case details remain available.'});
function pauseLoops(){loops.forEach(l=>l.pause())}
function runLoops(){if(reduced||paused||freezeTime||document.hidden||busy)return;loops.forEach(l=>l.resume())}
function createLoops(){
 loops.forEach(l=>l.kill());loops=[];routeOwners=[];
 if(!gsap||reduced)return;
 const p=slideParts[active];
 const c=chapters[ids[active]],idle=c.idle,ambient=c.ambient;
 loops=[gsap.fromTo(p.ambient,{x:0,y:0},{x:ambient.to[0],y:ambient.to[1],duration:ambient.durationMs/1000,ease:'none',repeat:-1,yoyo:true,paused:true}),gsap.fromTo(p.idle,{x:0,y:0},{x:idle.to[0],y:idle.to[1],duration:idle.durationMs/1000,ease:'none',repeat:-1,yoyo:true,paused:true})];
 slides[active].querySelectorAll('[data-route-signal]').forEach((signal,i)=>{
  const path=signal.querySelector('[data-route-track]'),packet=signal.querySelector('[data-route-packet]'),cursor={p:0};let length=0;
  const paint=()=>{const point=path.getPointAtLength(cursor.p*length);packet.setAttribute('transform',`translate(${point.x} ${point.y})`)};
  const configure=()=>{const mobile=innerWidth<=650;path.ownerSVGElement.setAttribute('viewBox',mobile?'0 0 320 900':'0 0 1600 900');path.setAttribute('d',mobile?path.dataset.mobileRoute:path.dataset.desktopRoute);length=path.getTotalLength();paint()};
  configure();routeOwners.push({configure});
  const tween=gsap.to(cursor,{p:1,duration:2.8+i*.17,ease:'none',repeat:-1,paused:true,onUpdate:paint});
  tween.progress((i*.23)%1);loops.push(tween);
 });
 if(ids[active]==='vision')loops.push(gsap.fromTo('.registration-signal',{x:0},{x:52,duration:3,ease:'none',repeat:-1,yoyo:true,paused:true}));
 runLoops();
}
function syncChrome({announce=true,push=false}={}){
 const s=slides[active],id=ids[active];
 // Section visibility belongs to the settled CSS state. Never retain the
 // incoming override or an outgoing timeline's hide after its owner stops.
 gsap?.set(slides,{clearProps:'visibility,opacity,top,transform'});
 slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===active);slide.inert=!reduced&&i!==active;slide.setAttribute('aria-hidden',String(!reduced&&i!==active));});
 const palette=chapters[id].palette;
 body.dataset.activeChapter=id;body.style.setProperty('--stage',palette[0]);body.style.setProperty('--accent',palette[1]);body.style.setProperty('--line',palette[1]+'55');body.style.setProperty('--soft','#d7d9de');
 $('#slide-progress').textContent=`${active+1} / ${slides.length}`;
 $('#slide-prev').disabled=active===0;$('#slide-next').disabled=active===slides.length-1;
 $('#slide-prev').setAttribute('aria-label',active?`Previous: ${slides[active-1].dataset.title}`:'First chapter');
 $('#slide-next').setAttribute('aria-label',active<slides.length-1?`Next: ${slides[active+1].dataset.title}`:'Last chapter');
 if(push&&location.hash!==`#${id}`)history.pushState({chapter:id},'',`#${id}`);
 if(announce)$('#active-announcement').textContent=`Chapter ${active+1} of ${slides.length}. ${heading(s).textContent.trim()}.`;
}
function clearFinitePose(s){gsap?.set([heading(s),reading(s),subject(s)],{clearProps:'transform,opacity,visibility'});const assembly=s.querySelectorAll?.('[data-assembly]');if(assembly?.length)gsap?.set(assembly,{clearProps:'transform,opacity,visibility'});const media=s.querySelector('.demo-plane');if(media)gsap?.set(media,{clearProps:'opacity,visibility'})}
function assembleScene(timeline,s,at=0){
 for(const a of chapters[s.dataset.chapter].assembly||[]){const target=s.querySelector(`[data-assembly="${a.layer}"]`);if(target)timeline.fromTo(target,{x:a.from[0],y:a.from[1]},{x:0,y:0,duration:a.durationMs/1000,ease:a.ease},at+a.delayMs/1000)}
 return timeline;
}
function clearSignatureBridge(){signatureBridge?.remove();signatureBridge=null}
function stopFiniteTransition(){
 // Disarm callbacks before touching any DOM or selection state, including
 // reentrant settlement at a timeline's own completion boundary.
 const owner=transition;transition=null;
 if(owner){owner.eventCallback('onComplete',null);owner.eventCallback('onUpdate',null);owner.kill()}
 clearSignatureBridge();slides.forEach(clearFinitePose);main.classList.remove('is-transitioning');
}
function completeNavigation(push=true){
 stopFiniteTransition();
 active=requested;busy=false;main.scrollTop=0;
 setNeutral();syncChrome({push});completedEntrances.add(ids[active]);
 createLoops();if(ids[active]!=='vision')suspendMedia();else restoreMedia();
 if(navSource!=='transport'&&navSource!=='initial'&&navSource!=='history')heading(slides[active]).focus({preventScroll:true});
 measureFit();
}
function settle(){if(!initialized)return;if(busy)completeNavigation(navSource!=='history');else{stopFiniteTransition();syncChrome({announce:false})}completedEntrances.add(ids[active])}
function enterInitial(){
 if(reduced||paused){completedEntrances.add(ids[active]);createLoops();return}
 busy=true;pauseLoops();const s=slides[active],entry=chapters[ids[active]].entry;
 transition=gsap.timeline({paused:entranceHold,onComplete(){completeNavigation(false)}})
 .fromTo(heading(s),{y:22},{y:0,duration:.34,ease:'power3.out'},0)
 .fromTo(subject(s),{x:entry.from[0],y:entry.from[1]},{x:0,y:0,duration:entry.durationMs/1000,ease:entry.ease},entry.delayMs/1000);
 assembleScene(transition,s,entry.delayMs/1000);
 if(entranceHold)transition.pause(0);
}
function navigate(next,source='transport',{push=true}={}){
 if(busy||next<0||next>=slides.length||next===active)return false;
 if($('#technical-panel').open||$('#overview-panel').open)return false;
 requested=next;navSource=source;
 if(reduced){active=next;syncChrome({push});slides[next].scrollIntoView({block:'start'});return true}
 if(paused){completeNavigation(push);return true}
 busy=true;pauseLoops();suspendMedia();
 const outgoing=slides[active],incoming=slides[next],readingOffset=main.scrollTop;
 // Both chapters share one reserved visual plane. Compensate only the outgoing
 // flow position, so native media pixels do not jump when the scroll is reset.
 main.classList.add('is-transitioning');
 outgoing.style.top=`${-readingOffset}px`;main.scrollTop=0;
 incoming.classList.add('is-active');incoming.style.visibility='visible';incoming.style.opacity='1';incoming.inert=true;
 incoming.style.top='0px';
 gsap.set([reading(incoming),subject(incoming)],{opacity:0});
 const incomingMedia=incoming.querySelector('.demo-plane');if(incomingMedia)gsap.set(incomingMedia,{opacity:0});
 const isSignaturePair=[ids[active],ids[next]].sort().join('|')==='inference|vision';
 const forward=ids[next]==='inference';
 const edges=[];
 if(isSignaturePair){
 const media=video.getBoundingClientRect();
 const partitions=[...slides[ids.indexOf('inference')].querySelectorAll('[data-memory-partition]')].map(el=>el.getBoundingClientRect());
 // The bridge owns only registration geometry; none of the media/reading
 // ancestors or scroll-linked owners participates in its transform.
 const mediaEdges=[{x:media.left-5,y:media.top-5,width:media.width/2+5,height:media.height+10},{x:media.left+media.width/2,y:media.top-5,width:media.width/2+5,height:media.height+10}];
 const memoryEdges=partitions.map(r=>({x:r.left,y:r.top,width:r.width,height:r.height}));
 signatureBridge=document.createElement('div');signatureBridge.className='signature-bridge';signatureBridge.dataset.signatureOwner='registration-to-memory';signatureBridge.setAttribute('aria-hidden','true');
 mediaEdges.forEach(()=>{const edge=document.createElement('i');edge.className='bridge-edge';signatureBridge.append(edge);edges.push(edge)});document.body.append(signatureBridge);
 const from=forward?mediaEdges:memoryEdges,to=forward?memoryEdges:mediaEdges;
 edges.forEach((edge,i)=>gsap.set(edge,{x:from[i].x,y:from[i].y,width:to[i].width,height:to[i].height,scaleX:from[i].width/to[i].width,scaleY:from[i].height/to[i].height,transformOrigin:'0 0',opacity:1}));
 }
 const entry=chapters[ids[next]].entry;
 transition=gsap.timeline({onComplete(){cooldownUntil=performance.now()+220;completeNavigation(push)}})
 .to(reading(outgoing),{opacity:0,duration:.18,ease:'none'},.10)
 .to(subject(outgoing),{opacity:0,duration:.18,ease:'none'},.12)
 .set(outgoing,{visibility:'hidden'},.30)
 .fromTo(heading(incoming),{y:22},{y:0,duration:.34,ease:'power3.out'},.20)
 .to(reading(incoming),{opacity:1,duration:.18,ease:'none'},.10)
 .fromTo(subject(incoming),{x:entry.from[0],y:entry.from[1]},{x:0,y:0,duration:isSignaturePair ? .36 : entry.durationMs/1000,ease:entry.ease},.20)
 .to(subject(incoming),{opacity:1,duration:.18,ease:'none'},.28);
 assembleScene(transition,incoming,.20);
 if(isSignaturePair){
 const media=video.getBoundingClientRect(),partitions=[...slides[ids.indexOf('inference')].querySelectorAll('[data-memory-partition]')].map(el=>el.getBoundingClientRect());
 const mediaEdges=[{x:media.left-5,y:media.top-5},{x:media.left+media.width/2,y:media.top-5}];
 const to=forward?partitions.map(r=>({x:r.left,y:r.top})):mediaEdges;
 edges.forEach((edge,i)=>transition.to(edge,{x:to[i].x,y:to[i].y,scaleX:1,scaleY:1,color:forward?'#a8c1f5':'#c1d98e',duration:.42,ease:'power2.inOut'},.08));
 }
 // Fade into the identical labelled boundaries rather than replacing a subject.
 if(edges.length)transition.to(edges,{opacity:0,duration:.06,ease:'none'},.50);
 const outgoingMedia=outgoing.querySelector('.demo-plane');if(outgoingMedia)transition.to(outgoingMedia,{opacity:0,duration:.18,ease:'none'},0);
 if(incomingMedia)transition.to(incomingMedia,{opacity:1,duration:.18,ease:'none'},.28);
 return true;
}
function excluded(event){return event.composedPath().some(n=>n instanceof Element&&n.matches('video,audio,input,textarea,select,[contenteditable]:not([contenteditable="false"]),dialog,[data-native-scroll],[data-panel-copy],#qa-tools,[data-victoria-observer]'))}
function maybeCommit(){
 if(!busy&&!reduced&&!holdThreshold&&wheelEvents>=3&&Math.abs(scroller.scrollTop-180)>=179.99){
  const direction=Math.sign(scroller.scrollTop-180);
  if(!navigate(active+direction,'wheel')){setNeutral();}
 }
}
scroller.addEventListener('scroll',()=>{
 if(!initialized||reduced||busy)return;
 catchup?.((scroller.scrollTop-180)/180);maybeCommit();
},{passive:true});
scroller.addEventListener('wheel',event=>{
 if(reduced||excluded(event)||event.ctrlKey||event.metaKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
 if(flow&&!event.composedPath().some(n=>n instanceof Element&&n.matches('[data-visual-field]'))){
  const canRead=event.deltaY<0?main.scrollTop>1:main.scrollTop+main.clientHeight<main.scrollHeight-1;
  if(canRead){if(wheelEvents)setNeutral();return;}
 }
 event.preventDefault();const now=performance.now(),quiet=now-lastWheel;lastWheel=now;
 if(busy||now<cooldownUntil||quiet<160&&wheelEvents===0)return;
 const multiplier=event.deltaMode===1?16:event.deltaMode===2?Math.min(scroller.clientHeight,600):1;
 const delta=Math.max(-60,Math.min(60,event.deltaY*multiplier));if(!delta)return;
 const dir=Math.sign(delta);if(lastDirection&&dir!==lastDirection)wheelEvents=0;lastDirection=dir;wheelEvents++;
 scroller.scrollTop=Math.max(0,Math.min(360,scroller.scrollTop+delta));
 catchup?.((scroller.scrollTop-180)/180);maybeCommit();
},{passive:false});
$('#slide-prev').addEventListener('click',()=>navigate(active-1,'transport'));
$('#slide-next').addEventListener('click',()=>navigate(active+1,'transport'));
document.addEventListener('keydown',event=>{
 if(event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||excluded(event)||document.querySelector('dialog[open]'))return;
 if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();navigate(active+(event.key==='ArrowRight'?1:-1),'keyboard')}
});
let touch=null;
document.querySelectorAll('[data-visual-field]').forEach(field=>{
 field.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&e.isPrimary)touch={x:e.clientX,y:e.clientY,id:e.pointerId}});
 field.addEventListener('pointerup',e=>{if(!touch||touch.id!==e.pointerId)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;touch=null;if(Math.abs(dx)>=64&&Math.abs(dx)>1.3*Math.abs(dy))navigate(active+(dx<0?1:-1),'swipe')});
 field.addEventListener('pointercancel',()=>touch=null);
});
const panel=$('#technical-panel'),overview=$('#overview-panel');
document.querySelectorAll('[data-open-details]').forEach(button=>button.addEventListener('click',()=>{
 opener=button;settle();$('#technical-panel-title').textContent=slides[ids.indexOf(button.dataset.openDetails)].dataset.title;
 $('[data-panel-copy]').replaceChildren($(`#dossier-${button.dataset.openDetails}`).content.cloneNode(true));
 panel.showModal();$('#technical-panel-close').focus({preventScroll:true});
 panel.scrollTop=0;$('[data-panel-copy]').scrollTop=0;
}));
function closePanel(){panel.close();opener?.focus({preventScroll:true})}
$('#technical-panel-close').addEventListener('click',closePanel);panel.addEventListener('cancel',e=>{e.preventDefault();closePanel()});
$('#open-overview').addEventListener('click',()=>{settle();overview.showModal();$('#overview-close').focus()});
function closeOverview(){overview.close();$('#open-overview').focus({preventScroll:true})}
$('#overview-close').addEventListener('click',closeOverview);overview.addEventListener('cancel',e=>{e.preventDefault();closeOverview()});

const education=$('.education-details'),backgroundPanel=$('.career-ledger');
function syncBackgroundPanel(){
 const expanded=education.open;
 backgroundPanel.toggleAttribute('data-native-scroll',expanded);
 if(expanded){
  backgroundPanel.setAttribute('tabindex','0');
  if(getComputedStyle(backgroundPanel).overflowY==='auto')backgroundPanel.scrollTop=Math.max(0,education.offsetTop-12);
 }else{backgroundPanel.removeAttribute('tabindex');backgroundPanel.scrollTop=0;}
 measureFit();
}
education.addEventListener('toggle',syncBackgroundPanel);
syncBackgroundPanel();

document.querySelectorAll('[data-go]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();if(overview.open)overview.close();navigate(ids.indexOf(a.dataset.go),'overview')}));
document.querySelector('.identity').addEventListener('click',e=>{e.preventDefault();navigate(0,'transport')});
window.addEventListener('popstate',()=>{const next=Math.max(0,ids.indexOf(location.hash.slice(1)));if(busy){requested=next;navSource='history';completeNavigation(false)}else navigate(next,'history',{push:false})});
window.addEventListener('hashchange',()=>{const next=ids.indexOf(location.hash.slice(1));if(next>=0&&next!==active&&!busy)navigate(next,'history',{push:false})});
$('#motion-pause').addEventListener('click',()=>{
 paused=!paused;safeSet('portfolio-motion-paused',String(paused));$('#motion-pause').setAttribute('aria-pressed',String(paused));$('#motion-pause').textContent=paused?'Resume motion':'Pause motion';
 if(paused){settle();pauseLoops()}else runLoops();
});
function measureFit(){
 if(reduced||!initialized)return;
 cancelAnimationFrame(frameRequest);frameRequest=requestAnimationFrame(()=>{
  const s=slides[active],main=$('#main');
  // Edge-cropped backgrounds intentionally reach the stage boundary. They do
  // not force overflow; real reading, media, inventory and mobile flow do.
  const contentBottom=Math.max(...[...s.children].filter(el=>!el.matches('template,.base-dossier,.technical-stage,.chapter-anchor')&&getComputedStyle(el).display!=='none').map(el=>el.offsetTop+el.offsetHeight));
  const next=innerHeight<540||contentBottom+16>main.clientHeight||main.scrollWidth>main.clientWidth+1;
  if(next!==flow){flow=next;body.classList.toggle('native-flow',flow)}
 });
}
function applyMode(){
 settle();const readingOffset=main.scrollTop;pauseLoops();reduced=isReduced();body.classList.toggle('reduced',reduced);body.classList.toggle('enhanced',!reduced);body.classList.remove('native-flow');flow=false;
 slides.forEach(s=>{s.style.removeProperty('visibility');s.style.removeProperty('opacity');clearFinitePose(s);gsap?.set(Object.values(slideParts[ids.indexOf(s.dataset.chapter)]),{x:0,y:0})});
 syncChrome({announce:false});if(!reduced)setNeutral();else{suspendMedia();catchup?.tween.pause();pose.p=0;paintPose()}
 createLoops();measureFit();requestAnimationFrame(()=>{main.scrollTop=readingOffset});
}
$('#motion-mode').value=mode;$('#motion-mode').addEventListener('change',e=>{mode=e.target.value;safeSet('portfolio-motion-mode',mode);applyMode()});
pref.addEventListener('change',()=>applyMode());
document.addEventListener('visibilitychange',()=>{if(document.hidden){settle();pauseLoops();suspendMedia()}else{runLoops();restoreMedia()}});
window.addEventListener('pagehide',()=>{settle();pauseLoops();suspendMedia()});
window.addEventListener('pageshow',()=>{if(initialized){settle();runLoops();restoreMedia()}});
function configureScenery(){document.querySelectorAll('[data-mobile-box]').forEach(svg=>svg.setAttribute('viewBox',innerWidth<=650?svg.dataset.mobileBox:svg.dataset.desktopBox))}
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{settle();configureScenery();routeOwners.forEach(owner=>owner.configure());measureFit()},80)});
new ResizeObserver(()=>measureFit()).observe($('.site-header'));
document.fonts?.ready.then(()=>measureFit());
async function init(){
 if(!gsap)throw Error('The local motion engine did not load.');
 configureScenery();
 /* DEVELOPMENT_QA_START */
 if(new URLSearchParams(location.search).get('victoriaQA')==='1'){
  const {mountPrototypeQA}=await import('./victoria-qa/prototype-controls.mjs');
  entranceHold=safeGet('victoria-qa-entrance-hold','false')==='true';
  await mountPrototypeQA({scroller,main,slides,playEntrance(){entranceHold=false;transition?.play()},getActive:()=>ids[active],setFreeze(value){freezeTime=value;if(value)pauseLoops();else runLoops()},setHold(value){holdThreshold=value},settle,getReduced:()=>reduced});
 }
 /* DEVELOPMENT_QA_END */
 initialized=true;$('#motion-pause').setAttribute('aria-pressed',String(paused));$('#motion-pause').textContent=paused?'Resume motion':'Pause motion';
 applyMode();syncChrome();
 if(!reduced)enterInitial();
}
init().catch(error=>{
 transition?.kill();loops.forEach(l=>l.kill());body.classList.remove('enhanced','native-flow','reduced');
 slides.forEach(s=>{s.inert=false;s.removeAttribute('aria-hidden');s.classList.remove('is-active');s.removeAttribute('style');clearFinitePose(s)});
 $('#active-announcement').textContent=`Motion is unavailable. All eighteen chapters and fifteen complete case studies remain readable. ${error.message}`;
});
