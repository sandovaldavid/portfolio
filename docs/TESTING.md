# Testing and quality

Executable configuration owns exact test scope, thresholds, browser projects and workflow behavior. This document explains which commands to run.

## Canonical gate

```bash
bun install --frozen-lockfile
bun run check
bun run test:unit:ci
bun run build
```

`bun run check` validates formatting, documentation links, the Dev Container and local browser-validation contracts, i18n, ESLint, architecture boundaries and TypeScript.

## Canonical local validation

For complete local validation from the host, including Fedora or another Linux distribution outside Playwright's supported host matrix, use:

```bash
bun run validate:local
```

This command fails closed unless the Dev Containers CLI is available. It starts or reuses the repository Dev Container and runs the maintained local gate there; it does not install or depend on Playwright browser binaries on the host.

The in-container gate covers:

- `bun run check`;
- `bun run test:unit:ci`;
- `bun run build`;
- `bun run check:links`;
- `bun run performance:check`;
- `bun run test:e2e:extended` against the already-built production preview.

Use `PLAYWRIGHT_WORKERS=<positive integer>` only when an explicit override is useful. Local DevContainer runs otherwise let Playwright choose its default concurrency. GitHub Actions retains its reviewed fixed worker policy independently.

Lighthouse is intentionally not part of `validate:local`: the maintained Lighthouse configuration uses temporary public report storage. Run Lighthouse explicitly when it is required.

## Change-specific validation

- Documentation: `bun run format:check` and `bun run check:docs`.
- Architecture: `bun run lint:architecture` and affected tests.
- Localization: `bun run check:i18n`, build, generated links and bilingual smoke coverage.
- UI or navigation: focused Playwright regression plus `bun run test:e2e:smoke` from the Dev Container, or the complete `bun run validate:local` from the host.
- Performance: build, route budgets and the applicable Lighthouse configuration.
- Visual changes: browser smoke and the pinned Docker visual suite when maintained snapshots are affected.

## Unit tests

```bash
bun run test:unit:ci
bun run test:unit:coverage
bun run test:unit:ui
```

Coverage is intentionally limited to deterministic modules listed in `unitCoverageScope` inside `vitest.config.ts`. Its percentages are not whole-repository coverage and must not be presented as such.

## Browser and accessibility tests

Inside the repository Dev Container:

```bash
bun run test:e2e:smoke
bun run test:e2e:desktop
bun run test:e2e:extended
bun run test:e2e:report
```

From the host, prefer `bun run validate:local`. Direct local Playwright execution outside the Dev Container fails explicitly so unsupported hosts cannot silently become a second browser runtime.

- Smoke is the fastest Chromium route, interaction and Axe gate.
- Desktop adds Chromium, Firefox and WebKit.
- Extended adds the maintained mobile projects.
- Playwright uses production-preview port `4322`, separate from Astro development on `4321`, and never reuses an existing server.
- `CI` controls generic CI-only safety such as `forbidOnly`.
- `GITHUB_ACTIONS` controls the reviewed GitHub worker/retry policy.
- `PLAYWRIGHT_WORKERS` is an explicit positive-integer override.
- `E2E_USE_PRODUCTION_PREVIEW=1` selects an already-built production preview without conflating that choice with CI.

## Visual regression

```bash
bun run test:e2e:visual:docker
```

The Docker visual command is authoritative for maintained snapshot comparison. Its Playwright image is version-aligned with the project and Dev Container, but remains a separate appliance only because visual regression requires a pinned rendering baseline. It is not the canonical general-purpose local test runtime.

Native visual runs are diagnostic when the host differs from the pinned baseline. Do not update snapshots only to silence a host-specific rendering difference.

## Build and generated links

```bash
bun run build
bun run check:links
```

Generated-link validation requires fresh `dist` output and includes locale, canonical, alternate and language-picker targets.

## Performance and Lighthouse

```bash
bun run build
bun run performance:check
bun run lighthouse:collect
bun run lighthouse:assert
```

Route thresholds live in `config/performance-budgets.json`. The fast Lighthouse contract lives in `config/lighthouse/lighthouserc.json`; the scheduled multi-category contract lives in `config/lighthouse/lighthouserc.extended.json`.

The current Lighthouse upload target is temporary public storage. Local Lighthouse assertions do not require a GitHub token, but generated report URLs may be public temporarily. Do not propagate GitHub secrets into the local Dev Container merely to suppress integration messages.

Generated reports are evidence artifacts, not maintained documentation. Do not copy current scores, inventories or thresholds into `docs/`.

## Screenshots

With the development server running:

```bash
bun run screenshots
```

The helper in `scripts/capture-screenshots.mjs` writes ad-hoc captures below `test-results/manual-screenshots/`. Maintained visual baselines remain under the Playwright test suite.

## Pull-request evidence

Record:

- the exact head or commit validated;
- the environment used;
- every command executed and its result;
- checks that were blocked, skipped or not applicable.

A missing, cancelled, disabled or quota-blocked workflow is not a pass. Exact workflow definitions and artifact retention live in `.github/workflows/`.
