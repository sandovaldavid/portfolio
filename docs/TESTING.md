# Testing and quality assurance

The portfolio uses executable repository rules, focused unit tests, browser tests, accessibility scans, documentation/generated-link validation, Lighthouse and route-level performance budgets.

## Local setup

```bash
bun install --frozen-lockfile
```

## Recommended command guide

### Daily development

```bash
bun run dev
bun run check
bun run test:unit:ci
bun run build
bun run test:e2e:smoke
bun run test:e2e:report
```

- `check` is the main non-mutating quality gate and matches the PR validation contract.
- `test:unit:ci` is the deterministic one-shot unit suite.
- `test:e2e:smoke` is the fastest browser, color-contract and accessibility gate.
- `test:e2e:report` serves the generated Playwright report at `http://localhost:9323`.

### Focused quality commands

The `format:*`, `lint:*`, `typecheck:*`, `check:docs`, `check:devcontainer`, `check:i18n:*` and `check:links` scripts reproduce individual parts of `check`. `format` and `lint:fix` modify files; their corresponding check commands do not.

### Internationalization quality gates

```bash
bun run check:i18n:catalogs
bun run check:i18n:content
bun run check:i18n:hardcoded
bun run check:i18n

bun run build
bun run check:i18n:routes
```

The source-level catalog, content and hardcoded-copy checks are mandatory parts of `bun run check`. Generated locale routes require fresh build output and run through `bun run check:links`. See [I18N-ENFORCEMENT.md](I18N-ENFORCEMENT.md).

### Browser test depth

- `test`, `test:local`, `test:e2e:desktop` and `test:e2e:extended` cover progressively broader browser/device matrices.
- `test:ui` and `test:debug` are interactive diagnostics.
- `test:e2e:visual` is a host-sensitive comparison; `test:e2e:visual:docker` is the reproducible merge-grade visual gate.
- `test:snapshots` and `test:snapshots:all` modify baselines and are only for deliberate reviewed updates.
- `screenshots:design-system` captures paired base/head Portfolio Retro evidence when both built checkouts are available.

## Repository quality

```bash
bun run check
```

`check` runs Prettier validation, documentation links, Dev Container contracts, source-level i18n enforcement, ESLint, Feature-Sliced Design boundaries, Astro diagnostics and strict tooling type-checking.

Documentation links can also be checked independently:

```bash
bun run check:docs
```

## Unit tests

```bash
bun run test:unit:ci
bun run test:unit:coverage
bun run test:unit:ui
```

The design-system contract suite verifies token-layer order, required aliases, contrast pairs, representative component migration, terminal literal removal, logo roles and inventory classifications. Coverage thresholds remain limited to the risk-based pure-unit scope in [testing/UNIT-COVERAGE.md](testing/UNIT-COVERAGE.md).

## Playwright

```bash
bun run test:e2e:smoke
bun run test:e2e:report
bun run test:e2e:desktop
bun run test:e2e:extended
RUN_VISUAL_TESTS=true bun run test:e2e:visual
bun run test:e2e:visual:docker
bun run test:ui
bun run test:debug
```

- `test:e2e:smoke` checks critical English and Spanish routes in Chromium, computed Portfolio Retro colors, primary-button contrast, CLI keyboard behavior, Splash dismissal and serious/critical Axe violations.
- `test:e2e:desktop` runs Chromium, Firefox and WebKit.
- `test:e2e:extended` adds Mobile Chrome and Mobile Safari.
- `test:e2e:visual` runs maintained Chromium, Firefox and Mobile Chrome snapshots on the host.
- `test:e2e:visual:docker` is the merge-grade Linux comparison using the pinned Playwright/Bun image.

Screenshot rendering can vary with the host operating system, browser build, font stack, hardware and headless configuration. Never update maintained snapshots merely to make a host-specific mismatch pass.

The Docker visual command must leave `tests/e2e/visual.spec.ts-snapshots/` unchanged. Any deliberate baseline update must be generated in the pinned environment and followed by a complete comparison without update mode.

Playwright retains first-retry traces, failure screenshots and videos. CI uploads HTML, JSON and JUnit diagnostics even when tests fail.

## Portfolio Retro before/after evidence

The PR workflow builds the exact base SHA and downloads the exact head build, then runs:

```bash
DESIGN_SYSTEM_BEFORE_DIR=baseline \
DESIGN_SYSTEM_AFTER_DIR=. \
DESIGN_SYSTEM_EVIDENCE_DIR=design-system-evidence \
bun run screenshots:design-system
```

The artifact contains paired captures for English/light desktop, Spanish/dark desktop, English/dark mobile, light 404, dark CLI and dark Splash. It is review evidence, not a replacement for smoke/Axe or maintained visual snapshots.

## Production build and generated links

```bash
bun run build
bun run check:links
```

`check:links` validates emitted internal `href`/`src` references and generated locale, canonical, alternate and language-picker targets.

## Lighthouse

```bash
bun run build
bun run lighthouse:collect
bun run lighthouse:assert
```

Thresholds are owned by `.lighthouserc.json`; do not duplicate or weaken them in prose.

## Route performance budgets

```bash
bun run build
bun run performance:check
```

Configuration lives in `performance-budgets.json`; methodology lives in [PERFORMANCE.md](PERFORMANCE.md).

## Bundle inspection

```bash
bun run build
bun run bundle:analyze
bun run bundle:visualize
```

`bundle:analyze` creates an informational emitted-file inventory. Route budgets remain the blocking performance gate.

## CI policy

Validation depth follows the branch lifecycle. Workflow responsibilities, stable required-check names, cache policy and artifact retention are documented in [CI.md](CI.md).
