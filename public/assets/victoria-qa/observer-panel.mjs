import { collectDOMSnapshot } from './browser-snapshot.mjs';

/** Opt-in DEVELOPMENT instrumentation, mounted by project code, never injected
 * through browser evaluation. The host operates visible controls and reads the
 * JSON output from the DOM. This does not capture pixels or grant visual approval.
 * Mount in a dedicated QA route or explicit development flag; call dispose on
 * teardown and exclude this panel from the production bundle. */
export function mountObserverPanel({ request, container = document.body, durationMs = 1500, maxFrames = 300 } = {}) {
  if (!request?.context?.scenarioId || !request.context.runId) throw Error('Observer requires the actual scenario and execution context');
  if (!Number.isFinite(durationMs) || durationMs < 500 || durationMs > 10000 || !Number.isInteger(maxFrames) || maxFrames < 20 || maxFrames > 1200) throw Error('Invalid bounded observation interval');
  const panel = document.createElement('details');
  panel.dataset.victoriaObserver='development';
  panel.style.cssText='position:fixed;bottom:8px;right:8px;z-index:2147483647;max-width:290px;background:#fff;color:#111;font:12px system-ui;padding:8px;border:1px solid #444';
  panel.open=true;
  const title=document.createElement('summary');title.textContent='Victoria development observer';
  const record=document.createElement('button');record.textContent='Record DOM sequence';
  const stop=document.createElement('button');stop.textContent='Stop DOM recording';stop.disabled=true;
  const status=document.createElement('p');status.setAttribute('role','status');status.textContent='Idle — real DOM only, no visual approval';
  const output=document.createElement('textarea');output.setAttribute('aria-label','Victoria observed DOM sequence');output.readOnly=true;output.style.cssText='width:265px;height:45px;display:block';
  panel.append(title,record,stop,status,output);container.append(panel);
  let raf=null,frames=[],startedAt=null,startedClock=0,disposed=false;
  const finish=()=>{
    if(raf!==null)cancelAnimationFrame(raf);raf=null;
    record.disabled=false;stop.disabled=true;
    const sequence={context:structuredClone(request.context),scenarioId:request.context.scenarioId,clockSource:'epoch',provenance:'development-observer',startedAt,endedAt:new Date().toISOString(),frames};
    output.value=JSON.stringify(sequence);
    // Text content also exposes the saved result in read-only DOM environments.
    output.textContent=output.value;
    status.textContent=`Captured ${frames.length} actual DOM frames; screenshots and independent review still required.`;
  };
  const tick=()=>{
    if(disposed)return;
    frames.push(collectDOMSnapshot({...request,clockSource:'epoch'}));
    if(performance.now()-startedClock>=durationMs||frames.length>=maxFrames){finish();return;}
    raf=requestAnimationFrame(tick);
  };
  record.addEventListener('click',()=>{
    if(raf!==null)return;
    frames=[];startedAt=new Date().toISOString();startedClock=performance.now();
    output.value='';output.textContent='';record.disabled=true;stop.disabled=false;
    status.textContent='Recording actual DOM frames…';raf=requestAnimationFrame(tick);
  });
  stop.addEventListener('click',finish);
  return {element:panel,dispose(){disposed=true;if(raf!==null)cancelAnimationFrame(raf);panel.remove();}};
}
