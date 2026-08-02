# Testing and quality

Executable configuration owns exact test scope, thresholds, browser projects and workflow behavior. This document explains which commands to run.

## Canonical gate

```bash
bun install --frozen-lockfile
bun run check
bun run test:unit:ci
bun run build
```

`bun run check` validates formatting, documentation links, the Dev Container contract, i18n, ESLint, architecture boundaries and TypeScript.

## Change-specific validation

- Documentation: `bun run format:check` and `bun run check:docs`.
- Architecture: `bun run lint:architecture` and affected tests.
- Localization: `bun run check:i18n`, build, generated links and bilingual smoke coverage.
- UI or navigation: focused Playwright regression plus `bun run test:e2e:smoke`.
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

```bash
bun run test:e2e:smoke
bun run test:e2e:desktop
bun run test:e2e:extended
bun run test:e2e:visual:docker
bun run test:e2e:report
```

- Smoke is the fastest Chromium route, interaction and Axe gate.
- Desktop adds Chromium, Firefox and WebKit.
- Extended adds the maintained mobile projects.
- The Docker visual command is authoritative for maintained snapshot comparison.
- Native visual runs are diagnostic when the host differs from the pinned baseline.

Do not update snapshots only to silence a host-specific rendering difference.

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
