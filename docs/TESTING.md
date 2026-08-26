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

- frozen dependency synchronization for the isolated container `node_modules` volume;
- `bun run check`;
- `bun run test:unit:ci`;
- `bun run build` in an explicit production environment;
- `bun run check:links`, including production-output and generated-locale contracts;
- `bun run performance:check`;
- `bun run test:e2e:extended` against the already-built production preview.

The Dev Container does not force `NODE_ENV` globally. Development commands and production validation choose their execution mode independently, so a reused development container cannot cause draft or `developmentOnly` fixtures to appear in the production-style validation build.

### Persistent local validation logs

`validate:local` streams the in-container gate to the terminal and also saves the complete output below the ignored `validation-logs/` directory:

```text
validation-logs/validate-local-<ISO timestamp>.log
```

The wrapper prints the exact path before the gate starts. This log contains the high-volume quality, unit, build, performance and Playwright output that may be truncated by a terminal scrollback buffer. Because the workspace is bind-mounted into the Dev Container, the file is available directly from the host after either a pass or a failure.

An explicit workspace-relative name can be supplied when useful:

```bash
VALIDATION_LOG_FILE=validation-logs/repro.log bun run validate:local
```

The wrapper validates that the log path remains inside the workspace, launches validation without a shell, mirrors child `stdout`/`stderr` to both the terminal and a Node file stream, and preserves the child exit code. Generated validation logs are evidence artifacts and must not be committed.

Use `PLAYWRIGHT_WORKERS=<positive integer>` only when an explicit override is useful. The wrapper validates and normalizes the value before passing it into the Dev Container. Local DevContainer runs otherwise let Playwright choose its default concurrency. GitHub Actions retains its reviewed fixed worker policy independently.

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
- The compatibility matrix is capability-scoped rather than a blind Cartesian product. Specs that already set their own canonical 390/834/1440-style responsive viewports and verify exact computed geometry/typography/tokens run once on canonical Chromium; Firefox/WebKit/mobile projects retain cross-browser behavior, accessibility, routing, overflow and interaction coverage.
- Responsive shell tests must follow the product ownership model: Recruiter HUD on desktop and Mobile Menu on tablet/mobile. A mobile project must not make a hidden desktop HUD visible merely to satisfy a desktop-oriented assertion.
- Playwright uses production-preview port `4322`, separate from Astro development on `4321`, and never reuses an existing server.
- The HTML reporter is generated under `playwright-report/` with `open: 'never'`. Validation must return its exit status without starting an interactive report server; use `bun run test:e2e:report` explicitly when a human wants to inspect the report.
- `CI` controls generic CI-only safety such as `forbidOnly`.
- `GITHUB_ACTIONS` controls the reviewed GitHub worker/retry policy.
- `PLAYWRIGHT_WORKERS` is an explicit positive-integer override.
- `E2E_USE_PRODUCTION_PREVIEW=1` selects an already-built production preview without conflating that choice with CI.

## Visual regression

```bash
bun run test:e2e:visual:docker
```

Visual snapshots are an explicit gate: `visual.spec.ts` does not participate in normal smoke/desktop/extended runs unless `RUN_VISUAL_TESTS=true` is set by the dedicated visual command.

The maintained baseline is canonical Chromium in the pinned Docker visual appliance. Firefox, WebKit and mobile projects validate behavior and compatibility rather than multiplying pixel snapshots whose rendering and viewport capabilities differ by engine/device. Do not update snapshots only to silence differences, and do not regenerate the baseline until the current redesigned UI has been reviewed and approved as the intended reference.

When a deliberate redesign makes the maintained baseline obsolete, regenerate only the canonical Chromium snapshots in the pinned Docker visual appliance:

```bash
CI=true RUN_VISUAL_TESTS=true E2E_USE_PRODUCTION_PREVIEW=1 \
  bash docker/docker-test.sh tests/e2e/visual.spec.ts \
  --update-snapshots --project=chromium
```

Review every changed image before committing it. A baseline update records an approved visual decision; it is not a mechanism for making a failing visual test green. Legacy Firefox, WebKit and mobile snapshot files are not maintained baselines now that visual regression is capability-scoped to canonical Chromium and should be removed when the approved v2 baseline refresh is committed.

The Docker visual command is authoritative for maintained snapshot comparison. Its Playwright image is version-aligned with the project and Dev Container, but remains a separate appliance only because visual regression requires a pinned rendering baseline. It is not the canonical general-purpose local test runtime.

## Build and generated links

```bash
bun run build
bun run check:links
```

Generated-output validation requires a fresh `dist`. It rejects draft and development-only fixture routes before validating generated links and localized route metadata.

The historical `/atena` and `/es/atena` routes remain redirect artifacts to their canonical localized Experience pages. The route checker validates their canonical and refresh destinations instead of applying canonical-page requirements such as `<html lang>` and a self-referential canonical URL. Content, typography and layout tests use `/experience/atena-software-engineer` and `/es/experience/atena-software-engineer`; only the redirect contract tests the historical URLs as redirects.

Normal pages continue to require locale, canonical, alternate and language-picker correctness.

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
