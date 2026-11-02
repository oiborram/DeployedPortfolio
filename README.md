# DeployedPortfolio

Oscar Iborra's English software engineering and applied AI portfolio.

[Read the portfolio](https://oiborram.github.io/DeployedPortfolio/) · [Read the complete JSON Resume](https://oiborram.github.io/DeployedPortfolio/resume.json) · [Read the raw JSON source](https://raw.githubusercontent.com/oiborram/DeployedPortfolio/main/public/resume.json)

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

The active target is `https://oiborram.github.io/DeployedPortfolio/`. `src/site-config.mjs` defaults to that publication base; `PORTFOLIO_BASE_URL` can override it at build time using an HTTPS URL with simple path segments and a trailing slash. `npm run build` regenerates the JSON so HTML, JSON, sitemap and HTTP relationships share that identity. The checked-in raw JSON also uses Pages URLs, avoiding links to the retired homelab deployment. `HOST`, `PORT` and `BASE_PATH` configure the optional standalone server; local development defaults to loopback. The retained Docker image listens on port 8080 and has no runtime dependency on `src/` or `node_modules/`.

The JSON is a direct anonymous `application/json` GET/HEAD resource. Its public data permits anonymous cross-origin browser fetch through `Access-Control-Allow-Origin: *`, exposes the `Link` response header, and grants no credential access. `meta.canonical` identifies its exact intended public URL; `custom.deployedPortfolio` documents English language, factual authorship, claim policy and JSON Pointers to all detailed project sections. The standard `projects` array retains the summaries, contribution roles, highlights and technologies. Visible links, an HTML alternate and HTTP canonical/alternate links connect the two representations, with the same metadata on GET and HEAD for browsers and agents.

The project-level robots file advertises its sitemap, which lists the human HTML URL; the JSON is discoverable through alternate links. GitHub owns origin-root crawler policy on `oiborram.github.io`. The former homelab `/portfolio/` deployment is retired. Successful HTTP delivery does not prove indexing or AI citation.

## Lisa and GitHub

### GitHub Pages publication

The same repository also publishes the production portfolio and complete JSON Resume to `https://oiborram.github.io/DeployedPortfolio/` and `https://oiborram.github.io/DeployedPortfolio/resume.json`. The `Publish portfolio and JSON Resume` workflow runs for `main` pushes and manual dispatches. It installs locked dependencies, builds from the shared source, validates JSON Resume, runs the application tests and checks that the uploaded `dist/` contains only public resources. No server credentials are needed. Action versions are pinned to immutable commit hashes.

The Pages build obtains its publication base from GitHub and sets `PORTFOLIO_BASE_URL` for that build. HTML canonical links, JSON metadata, project URLs and sitemap identify the HTTPS Pages publication. The full technical dossiers are in ordinary HTML as well as JSON, so retrieving project details does not require JavaScript. JSON Resume is a direct static file. The Pages workflow does not use a `deploy` branch. Only this project's repository is public; publishing it does not change any other repository's visibility.

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

### Retired Lisa deployment

This portfolio was originally published through Lisa under the homelab's `/portfolio/` route on port 9443. That deployment was retired at the owner's request on 2 November 2026, after publication on GitHub Pages. Removing the remote `deploy` branch lets Lisa's watcher retire the application through its normal managed cleanup. Do not recreate that branch without a new explicit request to deploy with Lisa.

The original `lisa.deploy.json`, Dockerfile and prefix-stripping integration test are retained as recoverable configuration and historical engineering evidence. The contract selects the `portfolio` route with primary-service `BASE_PATH=/`; it does not activate a deployment by itself.

The application owns no database and requires no secrets or persistent mounts. Do not add server paths, tokens or runtime state to its contract. The build and tests run without `.victoria/`; `tests/fixtures/approved-motion-contract.json` retains only the approved numeric motion expectations used by the tests.

Private local review history is kept under the ignored `.victoria/` directory; it is not included in the source repository or container. Rebuild and validate after editing the shared source, and commit the regenerated public representations together with source changes. Adding the live URL to LinkedIn and the CV remains separate work.

## Media

The vision demo is the supplied original recording, with native video controls and a seekable HTTP range response. `.victoria/media-provenance.json` records its source and digest. The portrait is the previously approved CV photo.
