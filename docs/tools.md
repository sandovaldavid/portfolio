# Testing and quality tools

This page explains the role of each tool without duplicating versions, thresholds or workflow names. Those values are owned by [package.json](../package.json), versioned configuration and [CI.md](CI.md).

## Repository quality

- **Prettier** checks maintained source and documentation formatting.
- **ESLint** validates JavaScript, TypeScript and Astro source.
- **Astro Check** validates Astro components and content configuration.
- **TypeScript** checks tests, scripts and supported configuration.
- **Architecture checker** enforces the dependency rules in [ARCHITECTURE.md](ARCHITECTURE.md).
- **Documentation checker** validates relative links in active documentation and archive indexes.

Run the canonical gate with:

```bash
bun run check
```

## Unit behavior

**Vitest** covers deterministic, risk-selected behavior. Coverage percentages apply only to the scope documented in [testing/UNIT-COVERAGE.md](testing/UNIT-COVERAGE.md).

```bash
bun run test:unit:ci
bun run test:unit:coverage
```

## Browser and accessibility behavior

**Playwright** covers navigation, responsive behavior, Astro client-navigation lifecycles and critical user flows. **Axe** runs inside the browser suite and blocks serious or critical accessibility regressions.

```bash
bun run test:e2e:smoke
bun run test:e2e:desktop
bun run test:e2e:extended
```

Project definitions and retained diagnostics are configured in `playwright.config.ts` and the GitHub Actions workflows.

## Performance

- **Route budgets** measure emitted assets referenced by representative English and Spanish routes. See [PERFORMANCE.md](PERFORMANCE.md).
- **Lighthouse CI** provides browser-level performance, accessibility, best-practices and SEO audits. Thresholds are owned by `config/lighthouse/lighthouserc.json`.
- **Rollup visualizer** is an opt-in composition audit, not a blocking size metric.

```bash
bun run build
bun run performance:check
bun run lighthouse:collect
bun run lighthouse:assert
bun run bundle:visualize
```

## Generated reports

Coverage, Playwright, Lighthouse, bundle and route-budget outputs are generated artifacts and are not maintained as repository documentation. CI retention and artifact names are documented in [CI.md](CI.md).
