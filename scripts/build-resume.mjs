import {mkdir, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve, dirname} from 'node:path';
import {profile, experience, projects, supporting} from '../src/content.mjs';
import {site} from '../src/site-config.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = site.publicBaseUrl;
export const resume = {
  $schema: 'https://raw.githubusercontent.com/jsonresume/jsonresume.org/master/packages/schema/schema.json',
  basics: {
    name: profile.name, label: profile.label, email: profile.email,
    url: baseUrl, image: new URL('assets/portrait.jpg', baseUrl).href,
    summary: profile.summary + ' ' + profile.practice,
    location: {city: 'Alicante', region: 'Valencian Community', countryCode: 'ES'},
    profiles: [{network: 'LinkedIn', username: 'oscar-iborra-maldonado-09b39116b', url: profile.linkedin}]
  },
  work: experience,
  education: [
    {institution: 'University of Alicante', area: 'Computer Engineering', studyType: 'First-year studies', startDate: '2018', endDate: '2019', summary: 'First-year studies; degree not completed.'},
    {institution: 'I.E.S. Mare Nostrum', area: 'Computer Systems and Network Administration', startDate: '2016', endDate: '2018'},
    {institution: 'I.E.S. Mare Nostrum', area: 'Science and Technology', studyType: 'Baccalaureate', startDate: '2014', endDate: '2016'},
    {institution: 'EOI / Everis-NTT DATA', area: 'C#/.NET and Testing', studyType: 'Bootcamp', startDate: '2019-07', endDate: '2019-08'},
    {institution: 'Cisco coursework', area: 'CCNA1', studyType: 'Coursework', startDate: '2016-09', endDate: '2016-12', summary: 'CCNA1 coursework; not a full CCNA certification.'}
  ],
  skills: [
    {name: 'Software engineering', keywords: ['TypeScript', 'JavaScript', 'C#', '.NET', 'Python', 'Rust', 'Angular', 'Vue.js', 'React', 'SQL']},
    {name: 'Applied AI and agents', keywords: ['Generative AI', 'AI agents', 'LangGraph', 'LangChain', 'Model Context Protocol', 'WebMCP', 'Context engineering', 'Persistent memory', 'Tool calling', 'Structured outputs']},
    {name: 'RAG and knowledge quality', keywords: ['Retrieval-augmented generation', 'SQLite FTS5', 'BM25', 'sqlite-vec', 'Local embeddings', 'RRF', 'Reranking', 'Incremental indexing', 'Provenance']},
    {name: 'Models and local inference', keywords: ['PyTorch', 'YOLO', 'ONNX Runtime', 'llama.cpp', 'GGUF', 'Quantisation', 'GPU offloading', 'Flash Attention', 'KV cache', 'Whisper', 'TTS']},
    {name: 'Quality and delivery', keywords: ['Evals', 'Regression testing', 'Vitest', 'Playwright', 'BrowserStack', 'Azure DevOps', 'GitLab CI/CD', 'Docker', 'Nginx', 'Observability', 'Performance profiling']}
  ],
  languages: profile.languages.map(language => ({language})),
  projects: projects.map(p => ({
    name: p.name, description: p.summary,
    highlights: p.highlights, keywords: p.technologies,
    url: baseUrl + '#' + p.id,
    roles: [p.contribution],
    type: p.id === 'bluecode' ? 'Professional engineering' : 'Independent engineering',
    ...(p.id === 'bluecode' ? {entity: 'BlueCode Solutions'} : {}),
    custom: {deployedPortfolio: {id: p.id, status: p.status, category: p.category, technicalSections: p.sections, ...(p.media ? {media: p.media} : {})}}
  })),
  meta: {canonical: new URL('resume.json', baseUrl).href, version: '1.7.0', lastModified: profile.updated},
  custom: {deployedPortfolio: {
    language: 'en', updated: profile.updated,
    author: {name: profile.name, url: profile.linkedin},
    authorship: 'Oscar Iborra Maldonado describes his engineering decisions and contributions in these case studies. Development included AI assistance; each project records its contribution and claim boundaries.',
    projectDetails: projects.map((p, index) => ({id: p.id, pointer: `/projects/${index}/custom/deployedPortfolio/technicalSections`})),
    aiPracticeSince: '2023-03',
    adoptionStatement: 'Adopted coding agents as they became available; daily AI study and hands-on practice since March 2023.',
    metricPolicy: 'Configured acceptance gates, historical bounded tests and owner-reported product adoption are identified separately in the case studies.',
    supportingInfrastructure: supporting
  }}
};
await mkdir(resolve(root, 'public'), {recursive: true});
await writeFile(resolve(root, 'public/resume.json'), JSON.stringify(resume, null, 2) + '\n');
console.log(JSON.stringify({resource: '/resume.json', projects: resume.projects.length, intendedPublicBaseUrl: baseUrl}));
