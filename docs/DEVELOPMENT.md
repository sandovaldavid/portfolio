# Development

## Prerequisites

Use the Bun version declared by `packageManager` in `package.json`. The recommended environment is the versioned Dev Container because it aligns Bun, Playwright, browser binaries and Docker-backed validation with CI.

For hosts outside Playwright's supported Linux matrix, including Fedora, browser-sensitive validation must run through the repository Dev Container rather than through a native host browser installation.

## Quick start

```bash
git clone https://github.com/sandovaldavid/portfolio.git
cd portfolio
git switch develop
bun install --frozen-lockfile
bun run dev
```

Astro is served at `http://localhost:4321`.

## Dev Container

Open the repository with **Dev Containers: Reopen in Container**. Rebuild without cache after changing the image, Features, mounts, users or lifecycle configuration.

The executable environment contract lives in:

- `.devcontainer/devcontainer.json` and its lockfile;
- `.devcontainer/Dockerfile` and lifecycle scripts;
- `scripts/run-local-validation.mjs` and `scripts/run-local-validation-inside.mjs` for host-to-container validation;
- `docker/Dockerfile.test` only for pinned visual-regression execution;
- `scripts/check-devcontainer.mjs` and `scripts/check-local-browser-validation.mjs`.

Validate the environment contract with:

```bash
bun run check:devcontainer
```

VS Code forwards Astro on port `4321` and the Playwright report on port `9323`. Playwright production preview uses the dedicated loopback port `4322`; it is not reused as the development server.

## Canonical local validation

From the host, including Fedora:

```bash
bun run validate:local
```

The wrapper requires the Dev Containers CLI, starts or reuses the repository Dev Container and executes the maintained validation gate inside it. If the CLI is unavailable, the command fails with an actionable error instead of falling back to native Playwright.

Inside the Dev Container the same command is safe:

```bash
bun run validate:local
```

It detects `DEVCONTAINER=true` and delegates directly to `validate:local:inside` without creating a nested container.

The canonical local gate runs formatting/docs/devcontainer/i18n/lint/type checks, unit tests, production build, generated-link validation, route performance budgets and the maintained Chromium/Firefox/WebKit/mobile Playwright matrix. Lighthouse remains a separate explicit validation because the maintained configuration uploads reports to temporary public storage.

An explicit worker override may be passed from the host:

```bash
PLAYWRIGHT_WORKERS=4 bun run validate:local
```

## Toolchain ownership

Do not duplicate patch versions in documentation. Use these sources:

- `package.json` and `bun.lock` for Bun packages and commands;
- `astro.config.mjs` for Astro behavior;
- `playwright.config.ts` for browser projects, workers, retries and production-preview behavior;
- `vitest.config.ts` for unit-test and coverage scope;
- `eslint.config.js` and TypeScript configs for static analysis;
- `config/` for Lighthouse, commit and performance contracts.

Compatibility-sensitive updates must keep the package, Dev Container image, visual-regression image, setup actions and executable checks aligned.

`CI`, `GITHUB_ACTIONS`, `PLAYWRIGHT_WORKERS` and `E2E_USE_PRODUCTION_PREVIEW` have separate responsibilities. Do not use generic `CI` as a proxy for provider, worker count, browser availability and preview selection simultaneously.

## Daily validation

For non-browser development work inside the supported environment:

```bash
bun run check
bun run test:unit:ci
bun run build
```

For complete local release-oriented validation from any host, prefer:

```bash
bun run validate:local
```

Add Lighthouse or pinned visual-regression checks according to [TESTING.md](TESTING.md).

## Troubleshooting

### Dev Containers CLI unavailable

`bun run validate:local` intentionally does not fall back to native Playwright. Install the Dev Containers CLI and rerun the command, or reopen the repository in its Dev Container.

### Dependency or ownership errors

Run the maintained lifecycle repair and reinstall from the lockfile:

```bash
bash .devcontainer/scripts/post-start.sh
bun install --frozen-lockfile
```

Do not recursively change ownership of the repository. A corrupted disposable `node_modules` volume may be removed from the host and recreated by rebuilding the Dev Container.

### Docker-backed visual tests fail

Confirm that the host Docker daemon is running and that the container can execute:

```bash
docker --version
docker compose version
```

The Dev Container reuses the host Docker daemon; only trusted repository code should run with that access. The separate Docker test image is maintained for visual-regression reproducibility, not as the general local browser runtime.

### Forwarded port conflict

Stop the process already using `4321` or `9323`, then reload the window or rebuild the container. Playwright itself uses isolated port `4322` with `reuseExistingServer: false`; a process occupying that port causes an explicit test harness failure instead of silent reuse.

### Playwright report

After a browser run:

```bash
bun run test:e2e:report
```

The report is served at `http://localhost:9323` until the command is stopped.
