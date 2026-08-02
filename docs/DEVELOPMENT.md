# Development

## Prerequisites

Use the Bun version declared by `packageManager` in `package.json`. The recommended environment is the versioned Dev Container because it aligns Bun, Playwright, browser binaries and Docker-backed validation with CI.

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
- `docker/Dockerfile.test` for pinned visual testing;
- `scripts/check-devcontainer.mjs` and `scripts/check-devcontainer-port.mjs`.

Validate it with:

```bash
bun run check:devcontainer
```

VS Code forwards Astro on port `4321` and the Playwright report on port `9323`.

## Toolchain ownership

Do not duplicate patch versions in documentation. Use these sources:

- `package.json` and `bun.lock` for Bun packages and commands;
- `astro.config.mjs` for Astro behavior;
- `playwright.config.ts` for browser projects and diagnostics;
- `vitest.config.ts` for unit-test and coverage scope;
- `eslint.config.js` and TypeScript configs for static analysis;
- `config/` for Lighthouse, commit and performance contracts.

Compatibility-sensitive updates must keep the package, Dev Container image, test image, setup actions and executable checks aligned.

## Daily validation

```bash
bun run check
bun run test:unit:ci
bun run build
```

Add generated-link, browser, performance or visual checks according to [TESTING.md](TESTING.md).

## Troubleshooting

### Dependency or ownership errors

Run the maintained lifecycle repair and reinstall from the lockfile:

```bash
bash .devcontainer/scripts/post-start.sh
bun install --frozen-lockfile
```

Do not recursively change ownership of the repository. A corrupted disposable `node_modules` volume may be removed from the host and recreated by rebuilding the Dev Container.

### Docker-backed tests fail

Confirm that the host Docker daemon is running and that the container can execute:

```bash
docker --version
docker compose version
```

The Dev Container reuses the host Docker daemon; only trusted repository code should run with that access.

### Forwarded port conflict

Stop the process already using `4321` or `9323`, then reload the window or rebuild the container. The configuration intentionally requires the expected local ports instead of silently remapping them.

### Playwright report

After a browser run:

```bash
bun run test:e2e:report
```

The report is served at `http://localhost:9323` until the command is stopped.
