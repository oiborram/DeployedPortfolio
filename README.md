# DeployedPortfolio

Oscar Iborra's English software engineering and applied AI portfolio.

## Local preview

```powershell
npm ci
npm run build:data
npm run build
npm run validate:data
npm test
powershell -NoProfile -File scripts/start-local.ps1
```

The local server binds to `127.0.0.1:4179`. Its process and logs are recorded in `.victoria/local/`. The preview was stopped at the owner's request before deployment preparation. It serves the complete 18-chapter human portfolio at `/`, JSON Resume at `/resume.json`, required static assets under `/assets/`, and the approved technical discovery resources `/robots.txt` and `/sitemap.xml`. Application source, research and Victoria evidence are not public routes.

`npm run build` regenerates the semantic HTML in `public/` and the clean production package in `dist/`. The Dockerfile builds that production package from checked-in source in a separate stage; it does not require an ignored local `dist/` directory, private Victoria evidence, or installed npm packages. The runtime copies only `server.mjs` and the resulting `dist/` into its public root. This package omits Victoria QA imports, observer assets and proposal galleries. All asset links are relative and support the reserved `/portfolio/` prefix.

Development-only observation is available at `/?victoriaQA=1#opening`. Its visible controls apply a host-supplied observer request, record real DOM samples, set actual intent or reading scroll positions, and instrument an explicitly labelled entrance hold. Arm hold + reload freezes the real GSAP start; Play entrance releases the actual animation clock. Hide panels and Escape restore are available. These controls are not in the production package.

## Editorial source

`src/content.mjs` is the shared public source for the portfolio and JSON Resume. After editing it, rebuild and validate the JSON. `schemas/provenance.json` records the official JSON Resume schema snapshot used for validation. Keep benchmark context and the distinction between configured evaluation gates and measured results when editing technical claims.

## Publication target

The reserved target is `https://iborrero.duckdns.org:9443/portfolio/`. `src/site-config.mjs` validates the publication base shared by both builds; `PORTFOLIO_BASE_URL` can override it at build time using an HTTPS URL with simple path segments and a trailing slash. `npm run build` also regenerates the JSON so HTML, JSON, sitemap and HTTP relationships share that identity. Set `BASE_PATH=/portfolio/` when running behind that prefix. `HOST` and `PORT` configure the listener; local development defaults to loopback. The prepared Docker image listens on port 8080. Its server derives HTTP publication links from the built JSON and has no runtime dependency on `src/` or `node_modules/`.

The JSON is a direct anonymous `application/json` GET/HEAD resource. Its public data permits anonymous cross-origin browser fetch through `Access-Control-Allow-Origin: *`, exposes the `Link` response header, and grants no credential access. `meta.canonical` identifies its exact intended public URL; `custom.deployedPortfolio` documents English language, factual authorship, claim policy and JSON Pointers to all detailed project sections. The standard `projects` array retains the summaries, contribution roles, highlights and technologies. Visible links, an HTML alternate and HTTP canonical/alternate links connect the two representations, with the same metadata on GET and HEAD for browsers and agents.

The portfolio robots file advertises the reachable `/portfolio/sitemap.xml`, rather than assuming ownership of the domain root. Its sitemap lists only the human HTML URL; the JSON is discoverable through alternate links. HomeLabDashboard owns the origin-root `/robots.txt` and `/sitemap.xml`: two exact public GET/HEAD handlers provide a fixed portfolio allowlist and a sitemap index pointing to this application's sitemap. Those handlers run before dashboard session authentication; private pages and APIs keep their existing authentication. Both applications are deployed through Lisa, without router, nginx or port changes. The publication origin remains HTTPS on port 9443. Successful HTTP delivery does not prove indexing or AI citation.

## Lisa and GitHub

### GitHub Pages mirror

The same repository also publishes the production portfolio and complete JSON Resume to `https://oiborram.github.io/DeployedPortfolio/` and `https://oiborram.github.io/DeployedPortfolio/resume.json`. The `Publish portfolio and JSON Resume` workflow runs for `main` pushes and manual dispatches. It installs locked dependencies, builds from the shared source, validates JSON Resume, runs the application tests and checks that the uploaded `dist/` contains only public resources. No server credentials are needed. Action versions are pinned to immutable commit hashes.

The Pages build obtains its publication base from GitHub and overrides `PORTFOLIO_BASE_URL` only for that build. HTML canonical links, JSON metadata, project URLs and sitemap consequently identify the HTTPS Pages mirror. The full technical dossiers are in the ordinary HTML as well as the JSON, so retrieving project details does not require JavaScript. JSON Resume remains a direct static file. The original Lisa deployment and its 9443 publication target are independent; `deploy` is not moved by the Pages workflow. Only this project's repository is public; publishing it does not change any other repository's visibility.

To verify the Pages package locally in PowerShell:

```powershell
$env:PORTFOLIO_BASE_URL = 'https://oiborram.github.io/DeployedPortfolio/'
npm run build
npm run validate:data
npm test
npm run check:pages
Remove-Item Env:PORTFOLIO_BASE_URL
npm run build
```

GitHub owns origin-root crawler policy on `oiborram.github.io`; the project-level sitemap and visible HTML/JSON links provide discovery within this project's path. Successful publication and anonymous HTTP access do not guarantee immediate search indexing or retrieval by every AI provider.

The deployment source repository is `oiborram/DeployedPortfolio` on GitHub. Lisa watches the `deploy` branch; updating `main` alone does not publish the site. The root `lisa.deploy.json` selects the `portfolio` route. Lisa's nginx proxy removes that route prefix before forwarding requests, so the contract sets the primary service's `BASE_PATH` to `/`. Public canonical URLs remain under `/portfolio/`. The integration test exercises this exact prefix-stripping boundary.

The application owns no database and requires no secrets or persistent mounts. Do not add server paths, tokens or runtime state to its contract. The build and tests run without `.victoria/`; `tests/fixtures/approved-motion-contract.json` retains only the approved numeric motion expectations used by the tests.

Deployment must still satisfy the current release acceptance checks before moving `deploy`. Preparing or pushing the normal source branch does not grant publication approval. Private local review history is kept under the ignored `.victoria/` directory; it is not included in the source repository or container. Origin-root robots/sitemap routing must be checked through the managed deployment pipeline without replacing other applications' policies. Adding the eventual live URL to LinkedIn and the CV remains separate work.

## Media

The vision demo is the supplied original recording, with native video controls and a seekable HTTP range response. `.victoria/media-provenance.json` records its source and digest. The portrait is the previously approved CV photo.
