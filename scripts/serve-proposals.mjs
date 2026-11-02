// Temporary local presentation of Victoria proposal assets, not the final portfolio UI.
import {readFile, writeFile, mkdir, copyFile, realpath} from 'node:fs/promises';
import {resolve, dirname, extname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const file = resolve(process.argv[2] || '');
const artifactRoot = await realpath(resolve(root, '.victoria'));
if (!(await realpath(file)).startsWith(artifactRoot + sep)) throw new Error('Use an actual local Victoria proposal artifact.');
const direction = JSON.parse(await readFile(file, 'utf8'));
if (!Array.isArray(direction.proposals) || direction.proposals.length < 2) throw new Error('At least two actual proposals are required.');
const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
await mkdir(resolve(root, 'public/assets'), {recursive: true});
const sections = [];
const copied = [];
for (const [index, proposal] of direction.proposals.entries()) {
  if (!/^[a-zA-Z0-9_-]+$/.test(proposal.id)) throw new Error('Invalid proposal identity');
  const images = [];
  for (const [i, preview] of proposal.previews.entries()) {
    const source = await realpath(resolve(dirname(file), preview));
    if (!source.startsWith(artifactRoot + sep) || !['.png', '.jpg', '.jpeg', '.webp'].includes(extname(source).toLowerCase())) throw new Error('Invalid proposal image source');
    const name = `proposal-${proposal.id}-${i + 1}${extname(source).toLowerCase()}`;
    await copyFile(source, resolve(root, 'public/assets', name));
    copied.push({proposalId: proposal.id, source, url: `assets/${name}`});
    images.push(`<figure><a href="assets/${name}" target="_blank" rel="noopener"><img src="assets/${name}" alt="${esc(proposal.title)} — composition preview ${i + 1}" ${i > 0 ? 'loading="lazy"' : ''}></a><figcaption>Composition ${i + 1} · Open image for full-size inspection</figcaption></figure>`);
  }
  sections.push(`<section id="${esc(proposal.id)}"><p class="number">Direction ${index + 1}</p><h2>${esc(proposal.title)}</h2><p>${esc(proposal.description)}</p><p class="intent">${esc(proposal.motionIntent)}</p>${images.join('')}</section>`);
}
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>DeployedPortfolio — Design proposals</title><style>
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:90px}body{margin:0;background:#f2f1ee;color:#182532;font-family:Segoe UI,Arial,sans-serif;line-height:1.55}header{position:sticky;top:0;z-index:2;background:#fffefbf5;border-bottom:1px solid #d8d8d3;padding:14px clamp(18px,4vw,64px);display:flex;align-items:center;justify-content:space-between;gap:24px;backdrop-filter:blur(12px)}header strong{font-size:17px}nav{display:flex;flex-wrap:wrap;gap:18px}a{color:#194b98;text-underline-offset:4px}main{max-width:1480px;margin:auto;padding:48px clamp(18px,4vw,64px)}h1{font-size:clamp(32px,4.4vw,62px);line-height:1.06;letter-spacing:-.045em;max-width:850px;margin:8px 0 22px}h2{font-size:clamp(27px,3vw,43px);letter-spacing:-.035em;line-height:1.15;margin:4px 0 18px}p{max-width:850px;font-size:17px}.intro{padding-bottom:30px}.notice{background:#fffdf5;border-left:3px solid #b18a3e;padding:14px 18px;max-width:950px;font-size:15px}.number{font-size:14px;font-weight:600;color:#4b6275}.intent{font-size:15px;color:#50616c}section{border-top:1px solid #c9cdd0;padding:46px 0 62px}figure{margin:26px 0}img{display:block;width:100%;height:auto;border:1px solid #d3d7da;border-radius:6px;background:white;box-shadow:0 10px 35px #172b3c10}figcaption{font-size:13px;color:#5a6973;margin:8px 2px}footer{border-top:1px solid #c9cdd0;padding:24px 0;color:#50616c;font-size:14px}@media(max-width:600px){header{position:static;align-items:flex-start;flex-direction:column;gap:8px}main{padding-top:28px}p{font-size:16px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
</style></head><body><header><strong>Oscar Iborra · DeployedPortfolio</strong><nav aria-label="Proposal navigation">${direction.proposals.map((p, i) => `<a href="#${esc(p.id)}">Direction ${i + 1}</a>`).join('')}<a href="resume.json">JSON Resume</a></nav></header><main><div class="intro"><p>Software Engineer | Applied AI</p><h1>A visual direction for the engineering behind the work.</h1><p>Two Victoria proposals for an English presentation portfolio. Each project gets its own composition, palette and meaningful motion. Full-size compositions and transition storyboards follow.</p><p class="notice">Local design review. These are concept previews, not the completed animated portfolio. The final implementation follows an explicit direction selection in the chat. The JSON Resume resource is already available.</p></div>${sections.join('')}<footer>Prepared locally. Nothing has been deployed to the public server, LinkedIn or the CV.</footer></main></body></html>`;
await writeFile(resolve(root, 'public/index.html'), html);
await writeFile(resolve(root, '.victoria/local/proposal-gallery.json'), JSON.stringify({artifact: file, proposals: direction.proposals.map(p => p.id), images: copied}, null, 2));
console.log(JSON.stringify({url: 'http://127.0.0.1:4179/', proposals: direction.proposals.length, images: copied.length}));
