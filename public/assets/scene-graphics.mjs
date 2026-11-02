const svg=(body,cls='')=>`<svg class="${cls}" viewBox="0 0 220 140" aria-hidden="true" focusable="false">${body}</svg>`;
const frame='<path d="M1 32V1H38M182 1H219V32M219 108V139H182M38 139H1V108"/>';
export function sceneGraphic(id){
 if(id==='inference')return inferenceGraphic();
 const vision=id==='vision';
 const back=vision?'<path d="M12 18H204V126H12Z M66 18V126M120 18V126M174 18V126M12 54H204M12 90H204"/>':'<path d="M8 10H212V130H8Z M18 22H98V118H18ZM122 22H202V118H122Z"/>';
 const mid=vision?'<path d="M20 14H86V76H20ZM132 58H198V124H132Z"/><path d="M26 46H80M52 20V70M138 90H192M164 64V118"/>':'<path d="M4 34H80V100H4ZM140 34H216V100H140Z M80 54H140M80 80H140" stroke-dasharray="5 5"/>';
 const fore=vision?'<path d="M10 20H72V82H10Z M10 20H36M10 20V46M156 60H212V120H156Z M186 120H212V92"/>':'<path d="M16 34H68V58H16ZM16 68H68V92H16ZM152 34H204V58H152ZM152 68H204V92H152Z"/>';
 const idle=vision?'<path d="M5 20H60V42H5ZM72 55H130V77H72ZM139 90H202V112H139Z"/><path d="M12 31H48M79 66H118M146 101H190" class="packet-ink"/>':'<path d="M4 22H52V48H4ZM68 57H116V83H68ZM132 92H180V118H132Z"/><path d="M12 30H44M12 39H36M76 65H108M76 74H100M140 100H172M140 109H164" class="packet-ink"/>';
 return `<div class="technical-stage ${vision?'vision-support':'inference-support'}" data-visual-field aria-label="${vision?'Annotation and registration schematic':'Qualitative CPU, GPU and memory topology'}">
 <div class="stage-title">${vision?'ANNOTATION → EVALUATION':'MODEL RESIDENCY / RUNTIME TOPOLOGY'}</div>
 <div class="support-field" data-entry="subject">
  <div class="static-topology" aria-hidden="true">${vision?'<span class="fixed-label label-a">HUMAN REVIEW</span><span class="fixed-label label-b">TEMPORAL SPLIT</span>':'<svg class="residency-routes" viewBox="0 0 760 380" preserveAspectRatio="none"><path d="M16 64H260V308H16ZM500 64H744V308H500Z M260 115H500M260 190H500M260 265H500"/><path d="M310 92V288M450 92V288" stroke-dasharray="5 7"/><path class="memory-slots" d="M36 90H236M36 130H236M36 170H236M36 210H236M36 250H236M524 90H724M524 130H724M524 170H724M524 210H724M524 250H724"/></svg><span class="memory-label cpu">CPU / RAM</span><span class="memory-label gpu">GPU / VRAM</span><span class="kv-label">KV CACHE</span><span class="lane-label prefill">PREFILL →</span><span class="lane-label decode">DECODE →</span>'}</div>
  <div class="motion-owner backplane" data-motion="backplane">${svg(back)}</div>
  <div class="motion-owner midground" data-motion="midground">${svg(mid)}</div>
  <div class="motion-owner foreground" data-motion="foreground">${svg(fore)}</div>
  <div class="motion-owner ambient" data-motion="ambient">${svg(frame+'<path d="M14 14H140M14 14V110M80 128H204"/>')}</div>
  <div class="motion-owner idle" data-motion="idle">${svg(idle)}</div>
 </div>
 <div class="stage-footnote">${vision?'Reviewed labels · baseline comparison':'Qualitative architecture · no live telemetry'}</div>
 ${vision?'':'<div class="runtime-ledger"><div><span>01</span><strong>Quantisation</strong><p>Model weights &amp; memory footprint</p></div><div><span>02</span><strong>Offloading</strong><p>Layers, experts &amp; residency</p></div><div><span>03</span><strong>Coexistence</strong><p>LLM + local speech workloads</p></div></div>'}</div>`;
}

function inferenceGraphic(){
 return `<div class="technical-stage inference-support" data-visual-field aria-label="Qualitative model residency and inference workload routes">
 <div class="stage-title">MODEL RESIDENCY / RUNTIME TOPOLOGY</div>
 <div class="support-field memory-instrument" data-entry="subject">
  <div class="memory-partitions">
   <div class="memory-region cpu-region" data-memory-partition="cpu"><strong>CPU / RAM</strong><span class="memory-kind">Model weights</span><p>Offloaded layers<br>or experts</p><div class="weight-blocks" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div>
   <div class="memory-region gpu-region" data-memory-partition="gpu"><strong>GPU / VRAM</strong><span class="memory-kind">Model weights</span><p>Resident blocks<br>or experts</p><div class="weight-blocks resident" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div>
  </div>
  <div class="offload-link"><span aria-hidden="true">←</span> Layer / expert offload <span aria-hidden="true">→</span></div>
  <div class="kv-reserve"><strong>KV cache</strong><span>Reserved for attention state</span><span class="cache-cells" aria-hidden="true">▏▏▏▏▏▏▏▏</span></div>
  <div class="workload-lanes">
   <div class="workload-lane prefill-lane"><strong>Prefill</strong><span>Prompt batch</span><div class="lane-route" aria-hidden="true"><b>RAM</b><i></i><b>GPU</b></div></div>
   <div class="workload-lane decode-lane"><strong>Decode</strong><span>One token / step</span><div class="lane-route" aria-hidden="true"><b>KV</b><i></i><b>GPU</b></div></div>
   <div class="workload-motion" aria-hidden="true">
    <div class="motion-owner backplane" data-motion="backplane">${svg('<path d="M1 20H218V36H1Z M1 100H218V116H1Z" fill="currentColor" stroke="none"/>')}</div>
    <div class="motion-owner midground" data-motion="midground">${svg('<path d="M10 60H210M170 32L210 60L170 88" stroke-width="10"/>')}</div>
    <div class="motion-owner foreground" data-motion="foreground">${svg('<path d="M30 24H190V116H30Z M70 24V116M110 24V116M150 24V116" stroke-width="8"/>')}</div>
    <div class="motion-owner ambient" data-motion="ambient">${svg('<path d="M8 8H100M8 8V90M120 132H212M212 132V50"/>')}</div>
    <div class="motion-owner idle" data-motion="idle">${svg('<path d="M24 24H196V116H24Z"/><path d="M65 50H155M65 90H130" class="packet-ink"/>')}</div>
   </div>
  </div>
 </div>
 <div class="stage-footnote">Qualitative architecture · no live telemetry</div>
 <div class="runtime-ledger"><div><span>01</span><strong>Quantisation</strong><p>Weight precision &amp; footprint</p></div><div><span>02</span><strong>Offloading</strong><p>Layers, experts &amp; residency</p></div><div><span>03</span><strong>Coexistence</strong><p>LLM + local speech workloads</p></div></div>
 </div>`;
}
