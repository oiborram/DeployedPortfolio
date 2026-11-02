import {writeFile, copyFile, mkdir, readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {projects} from '../src/content.mjs';
import {sceneGraphic} from '../public/assets/scene-graphics.mjs';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const selected=projects.filter(p=>['vision','inference'].includes(p.id));
const asset=async name=>`assets/${name}?v=${createHash('sha256').update(await readFile(new URL(`../public/assets/${name}`,import.meta.url))).digest('hex').slice(0,12)}`;
const cssAsset=await asset('styles.css'),gsapAsset=await asset('gsap.min.js'),appAsset=await asset('app.mjs');
const dossier=p=>p.sections.map(s=>`<h3>${esc(s.title)}</h3>${s.points.map(t=>`<p>${esc(t)}</p>`).join('')}`).join('');
const slides=selected.map((p,i)=>`<section id="slide-${p.id}" data-chapter="${p.id}" aria-labelledby="heading-${p.id}">
  <div class="reading-plane" data-reading>
    <h1 id="heading-${p.id}" data-heading tabindex="-1">${p.id==='vision'?'OcuWatch <span>&amp; Vision Studio</span>':'Local inference <span>engineering.</span>'}</h1>
    <p class="summary" data-summary>${esc(p.id==='vision'?'From reviewed labels to a live detector.':p.title)}</p>
    <p class="brief">${esc(p.id==='vision'?'YOLO experiments, temporal splits and baseline comparisons. Annotation, tracking and model rollback in Vision Studio.':'Quantisation. Memory placement. Concurrency. Engineering the runtime around the machine, with prefill and decode treated as different workloads.')}</p>
    <button class="details-button" data-open-details="${p.id}" aria-haspopup="dialog">Technical details <span aria-hidden="true">+</span></button>
  </div>
  ${p.id==='vision'?`<figure class="demo-plane"><div class="demo-registration" aria-hidden="true"><i class="registration-scan-rail"></i><i class="registration-signal"></i><i class="registration-half cpu-edge"></i><i class="registration-half gpu-edge"></i></div><video id="ocuwatch-demo" width="816" height="612" controls playsinline muted preload="none" poster="assets/ocuwatch-poster.jpg"><source src="assets/ocuwatch-demo.mp4" type="video/mp4"><p>Your browser cannot play this video. <a href="assets/ocuwatch-demo.mp4">Open the OcuWatch desktop demo</a>.</p></video><figcaption>Actual desktop demonstration · OcuWatch</figcaption><p id="video-status" role="status"></p></figure>`:''}
  ${sceneGraphic(p.id)}
  <template id="dossier-${p.id}"><p class="dossier-intro">${esc(p.contribution)}</p><p class="technology-list">${p.technologies.map(esc).join(' · ')}</p>${dossier(p)}</template>
  <div class="base-dossier">${dossier(p)}</div>
</section>`).join('');
await writeFile(new URL('../public/index.html',import.meta.url),`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Oscar Iborra Maldonado — software engineering and applied AI. Computer vision and local inference engineering."><title>Oscar Iborra — Engineering in motion</title><link rel="stylesheet" href="${cssAsset}"><script defer src="${gsapAsset}"></script><script type="module" src="${appAsset}"></script></head>
<body><a class="skip-link" href="#main">Skip to engineering cases</a><div id="deck-scroll"><div id="intent-runway"><div id="deck-stage">
<header class="site-header"><a class="identity" href="#vision">Oscar Iborra<span>Software Engineer | Applied AI</span></a><div class="header-actions"><button id="open-overview" aria-haspopup="dialog">Index</button><button id="motion-pause" aria-pressed="false">Pause motion</button><label class="mode-label"><span class="sr-only">Motion mode</span><select id="motion-mode" aria-label="Motion mode"><option value="system">System motion</option><option value="reduced">Reduced motion</option><option value="full">Full motion</option></select></label></div></header>
<main id="main" aria-label="Engineering case studies">${slides}</main>
<footer class="transport"><span id="slide-progress" aria-hidden="true">12 / 18</span><button id="slide-prev" aria-label="Previous scene"><span aria-hidden="true">←</span><span class="transport-word">Previous</span></button><span class="transport-hint">← → keys <span>/</span> wheel</span><button id="slide-next" aria-label="Next scene"><span class="transport-word">Next</span><span data-control-mark aria-hidden="true">→</span></button><div class="intent-track" aria-hidden="true"><div id="intent-progress"></div></div></footer>
</div></div></div><p id="active-announcement" class="sr-only" aria-live="polite" aria-atomic="true"></p>
<dialog id="technical-panel" aria-labelledby="technical-panel-title" data-native-scroll><header><h2 id="technical-panel-title">Technical details</h2><button id="technical-panel-close" aria-label="Close technical details">Close ×</button></header><div data-panel-copy tabindex="0"></div></dialog>
<dialog id="overview-panel" aria-labelledby="overview-title"><header><h2 id="overview-title">Engineering cases</h2><button id="overview-close" aria-label="Close index">Close ×</button></header><p>This motion prototype covers two consecutive chapters of the portfolio.</p><nav aria-label="Prototype chapters"><a href="#vision">12 — OcuWatch &amp; Vision Studio <span>Computer vision →</span></a><a href="#inference">13 — Local Inference Engineering <span>Memory &amp; runtime →</span></a></nav><a class="resume-link" href="resume.json">Read the JSON Resume ↗</a></dialog>
<noscript><p class="no-script">Both engineering cases and their complete technical details are available below. <a href="resume.json">JSON Resume</a></p></noscript></body></html>`);
await copyFile(new URL('../node_modules/gsap/dist/gsap.min.js',import.meta.url),new URL('../public/assets/gsap.min.js',import.meta.url));
await mkdir(new URL('../public/assets/victoria-qa/',import.meta.url),{recursive:true});
for(const file of ['observer-panel.mjs','browser-snapshot.mjs'])await copyFile(`F:/dev/Ilicilabs/Victoria/runtime/capture/${file}`,new URL(`../public/assets/victoria-qa/${file}`,import.meta.url));
console.log('Built scoped vision + inference signature prototype. JSON data unchanged.');
