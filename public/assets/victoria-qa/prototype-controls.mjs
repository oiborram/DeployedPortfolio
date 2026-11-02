import {mountObserverPanel} from './observer-panel.mjs';
import {collectDOMSnapshot} from './browser-snapshot.mjs';

// Explicit first-party development UI. The host supplies the real source/build
// receipt here and observes the DOM. It never writes fabricated frame values.
export async function mountPrototypeQA({scroller,main,slides,playEntrance,getActive,setFreeze,setHold,settle,getReduced}){
 const panel=document.createElement('details');panel.id='qa-tools';panel.open=true;panel.dataset.nativeScroll='';
 panel.style.cssText='position:fixed;right:8px;top:72px;width:304px;max-width:calc(100vw - 16px);max-height:calc(100svh - 160px);overflow:auto;z-index:9000;background:#f5f5ef;color:#172019;padding:10px;border:1px solid #536050;font:12px/1.4 system-ui;box-shadow:0 4px 24px #0006';
 panel.innerHTML=`<summary style="cursor:pointer;font-weight:700">Victoria portfolio QA · DEVELOPMENT</summary>
 <p style="font:12px/1.4 system-ui;margin:10px 0">Actual DOM observation. Build identity must be supplied by the host before recording. No visual acceptance is implied.</p>
 <fieldset style="margin:8px 0;border:1px solid #788;padding:6px"><legend>Instrumented entrance capture</legend><p style="font:12px system-ui">Arming holds the real GSAP entrance at its start on next reload. Play releases the actual animation clock.</p><button id="qa-arm-entrance" style="color:#172019;font-size:12px;min-height:32px;padding:4px">Arm hold + reload</button><button id="qa-play-entrance" style="color:#172019;font-size:12px;min-height:32px;padding:4px">Play entrance</button><button id="qa-disarm-entrance" style="color:#172019;font-size:12px;min-height:32px;padding:4px">Disarm hold</button></fieldset>
 <label style="display:block">Native reading position <input id="qa-reading-position" aria-label="Native reading scroll position" type="number" min="0" step="1" value="0" style="width:72px"></label><button id="qa-set-reading-position" style="color:#172019;font-size:12px;min-height:32px;padding:4px">Set native reading position</button><p id="qa-reading-readout" style="font:12px Consolas,monospace">Actual #main.scrollTop: 0.00</p>
 <label style="display:block"><input id="qa-freeze-time" type="checkbox"> Freeze time owners (ambient + idle)</label>
 <label style="display:block"><input id="qa-hold-threshold" type="checkbox"> Hold threshold (prevent chapter commit)</label>
 <label style="display:block"><input id="qa-record-on-load" type="checkbox"> Record DOM sequence on next load</label>
 <label style="display:block;margin-top:8px">Native scroll position <input id="qa-native-position" aria-label="Native scroll position" type="number" min="0" max="360" step="1" value="180" style="width:72px"></label>
 <button id="qa-set-native-position" style="color:#172019;font-size:12px;min-height:32px;padding:4px 8px">Set native scroll position</button>
 <p id="qa-native-readout" style="font:12px/1.4 Consolas,monospace;margin:6px 0">Actual scrollTop: 180.00</p>
 <label style="display:block">Capture phase <select id="qa-capture-phase" aria-label="Capture phase" style="background:white;color:#172019;font-size:12px;min-height:32px"><option>start</option><option>middle</option><option>end</option><option>reverse</option><option>fixed</option><option>time</option><option>entrance</option><option>handoff</option><option>paused</option></select></label>
 <label style="display:block">Scenario ID <input id="qa-capture-scenario" aria-label="Capture scenario ID" value="prototype-vision-desktop-scroll" style="width:100%"></label>
 <label style="display:block;margin-top:8px">Observer request JSON<textarea id="qa-request-json" aria-label="Observer request JSON" spellcheck="false" style="width:100%;height:88px;font:11px Consolas,monospace"></textarea></label>
 <button id="qa-apply-request" style="color:#172019;font-size:12px;min-height:32px;padding:4px 8px">Apply observer request</button>
 <label style="display:block;margin-top:6px">Recording duration (ms) <input id="qa-duration" aria-label="Recording duration in milliseconds" type="number" min="500" max="10000" value="2000" style="width:90px"></label>
 <button id="qa-capture-snapshot" style="color:#172019;font-size:12px;min-height:32px;padding:4px 8px">Capture DOM snapshot</button>
 <label style="display:block">Observed snapshot JSON<textarea id="qa-snapshot-output" aria-label="Victoria observed DOM snapshot" readonly style="width:100%;height:56px;font:11px Consolas,monospace"></textarea></label>
 <p id="qa-status" role="status" style="font:12px/1.4 system-ui;margin:6px 0">Idle; context is not bound to a build.</p>
 <div id="qa-sequence-mount"></div>
 <button id="qa-hide-panels" style="color:#172019;font-size:12px;min-height:32px;padding:4px 8px">Hide QA panels (Escape restores)</button>`;
 document.body.append(panel);
 const $=s=>panel.querySelector(s);
 const emptyRequest={context:{runId:'6237bbe9-6a05-415c-8f14-b0da68f1dad7',buildDigest:null,scenarioId:'prototype-vision-desktop-scroll',routeId:'home',capturePhase:'prototype'},phase:'start',targets:['foreground','midground','backplane'].map((key,i)=>({id:`vision-scroll-${key}`,sceneId:'vision-intent',selector:`#slide-vision [data-motion="${key}"]`,measurement:'transform2d',scrollContainer:'#deck-scroll',progressRange:{start:180,end:360}})),headingSelectors:['#slide-vision [data-heading]'],geometrySelectors:['#slide-vision [data-heading]','#slide-vision [data-summary]','#ocuwatch-demo','#slide-next']};
 const activeId=getActive();
 emptyRequest.context.scenarioId=`final-${activeId}-desktop-scroll`;
 emptyRequest.context.capturePhase='final';
 emptyRequest.targets=emptyRequest.targets.map((t,i)=>({...t,id:`${activeId}-scroll-${['foreground','midground','backplane'][i]}`,sceneId:`${activeId}-intent`,selector:t.selector.replace('slide-vision',`slide-${activeId}`)}));
 emptyRequest.headingSelectors=[`#slide-${activeId} [data-heading]`];
 emptyRequest.geometrySelectors=[`#slide-${activeId} [data-heading]`,`#slide-${activeId} [data-summary]`,'#slide-next'];
 let request=emptyRequest,observer=null;
 $('#qa-request-json').value=JSON.stringify(request,null,2);
 try{const saved=sessionStorage.getItem('victoria-qa-request');if(saved){request=JSON.parse(saved);$('#qa-request-json').value=JSON.stringify(request,null,2);$('#qa-capture-scenario').value=request.context.scenarioId}}catch{}
 function mount(){
  observer?.dispose();const durationMs=Number($('#qa-duration').value);
  observer=mountObserverPanel({request,container:$('#qa-sequence-mount'),durationMs,maxFrames:Math.min(1200,Math.ceil(durationMs*.12))});
  observer.element.style.cssText='position:static;background:#fff;color:#111;font:12px system-ui;padding:8px;border:1px solid #444;margin-top:8px;max-width:100%';
  observer.element.querySelector('textarea').style.width='100%';
  observer.element.querySelectorAll('button').forEach(button=>{button.style.cssText='color:#111;font:12px system-ui;min-height:32px;padding:4px 8px;border:1px solid #666'});
 }
 mount();
 $('#qa-arm-entrance').addEventListener('click',()=>{sessionStorage.setItem('victoria-qa-entrance-hold','true');location.reload()});
 $('#qa-play-entrance').addEventListener('click',()=>{sessionStorage.setItem('victoria-qa-entrance-hold','false');playEntrance();$('#qa-status').textContent='Released the actual GSAP entrance clock.'});
 $('#qa-disarm-entrance').addEventListener('click',()=>{sessionStorage.setItem('victoria-qa-entrance-hold','false');playEntrance();$('#qa-status').textContent='Entrance hold disarmed.'});
 $('#qa-set-reading-position').addEventListener('click',()=>{main.scrollTop=Math.max(0,Number($('#qa-reading-position').value));$('#qa-reading-readout').textContent=`Actual #main.scrollTop: ${main.scrollTop.toFixed(2)} / max ${(main.scrollHeight-main.clientHeight).toFixed(2)}`});
 main.addEventListener('scroll',()=>{$('#qa-reading-readout').textContent=`Actual #main.scrollTop: ${main.scrollTop.toFixed(2)} / max ${(main.scrollHeight-main.clientHeight).toFixed(2)}`},{passive:true});
 $('#qa-freeze-time').addEventListener('change',e=>setFreeze(e.target.checked));
 $('#qa-hold-threshold').addEventListener('change',e=>setHold(e.target.checked));
 $('#qa-set-native-position').addEventListener('click',()=>{
  if(getReduced()){$('#qa-status').textContent='Reduced flow has no intent runway. Choose Full motion for scroll poses.';return}
  settle();const value=Math.max(0,Math.min(360,Number($('#qa-native-position').value)));scroller.scrollTop=value;
  $('#qa-native-readout').textContent=`Actual scrollTop: ${scroller.scrollTop.toFixed(2)} · wait at least 150ms for the progress catchup`;
 });
 $('#qa-capture-phase').addEventListener('change',e=>{request.phase=e.target.value;$('#qa-request-json').value=JSON.stringify(request,null,2)});
 $('#qa-capture-scenario').addEventListener('change',e=>{request.context.scenarioId=e.target.value;$('#qa-request-json').value=JSON.stringify(request,null,2)});
 $('#qa-apply-request').addEventListener('click',()=>{
  try{
   const next=JSON.parse($('#qa-request-json').value);
   if(!next.context?.runId||!next.context?.scenarioId||!next.targets?.length)throw Error('Supply runId, scenarioId and actual target selectors.');
   for(const target of next.targets)if(document.querySelectorAll(target.selector).length!==1)throw Error(`Target must match exactly one element: ${target.selector}`);
   request=next;$('#qa-capture-scenario').value=request.context.scenarioId;$('#qa-capture-phase').value=request.phase??'start';
   sessionStorage.setItem('victoria-qa-request',JSON.stringify(request));mount();
   $('#qa-status').textContent=`Applied ${request.context.scenarioId}. Active scene: ${getActive()}. ${request.context.buildDigest?'Host-supplied build identity present.':'Build identity remains unbound.'}`;
  }catch(error){$('#qa-status').textContent=`Request not applied: ${error.message}`}
 });
 $('#qa-capture-snapshot').addEventListener('click',()=>{
  const snapshot=collectDOMSnapshot({...request,phase:$('#qa-capture-phase').value,clockSource:'epoch'});
  const output=$('#qa-snapshot-output');output.value=JSON.stringify(snapshot);output.textContent=output.value;
  $('#qa-status').textContent=`Observed actual ${snapshot.phase} snapshot at ${snapshot.capturedAt}; ${snapshot.targets.length} targets. Native scrollTop ${scroller.scrollTop}.`;
 });
 const restore=()=>{panel.style.display='';};$('#qa-hide-panels').addEventListener('click',()=>{panel.style.display='none'});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('dialog[open]'))restore()});
 try{
  const auto=sessionStorage.getItem('victoria-qa-record-on-load')==='true';$('#qa-record-on-load').checked=auto;
  $('#qa-record-on-load').addEventListener('change',e=>sessionStorage.setItem('victoria-qa-record-on-load',String(e.target.checked)));
  if(auto)observer.element.querySelector('button').click();
 }catch{}
 return {dispose(){observer?.dispose();panel.remove()}};
}
