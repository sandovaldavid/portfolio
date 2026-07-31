# Contributing

Contributions are welcome. Keep changes focused, reproducible and aligned with the executable repository contracts.

## Setup

Use the Bun version declared in [package.json](../package.json).

```bash
git clone https://github.com/sandovaldavid/portfolio.git
cd portfolio
git switch develop
bun install --frozen-lockfile
bun run dev
```

The recommended environment and troubleshooting steps are in [docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md).

## Workflow

1. Update `develop` and create a short-lived branch.
2. Read [AGENTS.md](../AGENTS.md), nearby source, tests and the owning operational document.
3. Implement one coherent concern without bypassing architecture, localization or quality gates.
4. Add the relevant unit or browser regression.
5. For user-facing content, follow [docs/I18N.md](../docs/I18N.md) and update English, Spanish, accessibility and metadata together.
6. Run the canonical gate and every change-specific command.
7. Open a pull request into `develop` with a Conventional Commit title.
8. Record exact commands, environment and results.
9. Squash merge only after review and explicit authorization.

Promotion from `develop` to `main` is a separate production pull request governed by [docs/DELIVERY.md](../docs/DELIVERY.md).

## Canonical validation

```bash
bun run check
bun run test:unit:ci
bun run build
```

Add generated-link, Playwright, performance, Lighthouse or pinned-Docker visual validation according to [docs/TESTING.md](../docs/TESTING.md).

A missing, skipped, cancelled, disabled or quota-blocked workflow is not a pass.

## Pull requests

Include:

- the verified problem and chosen solution;
- user or developer impact;
- validation commands, environment and results;
- risks or intentionally deferred work;
- screenshots for visible changes;
- `Closes #<issue>` only when the merge completes that issue.

Do not weaken architecture, localization, accessibility, testing or performance gates merely to make a check pass.

## Documentation

[docs/README.md](../docs/README.md) defines the repository/Cortex-L7 boundary.

Keep repository documentation limited to setup, localization, testing, delivery and working conventions. Do not add point-in-time status reports, folder catalogs, design inventories, architecture decision records or planning notes.

Store decisions, alternatives, detailed architecture reasoning, historical audits, cross-repository strategy, plans and handoffs in Cortex-L7. Git history remains the public record for removed documentation.

Run `bun run check:docs` after changing links or documentation paths.

## Conduct

Be respectful, keep reviews specific and evidence-based, and separate technical disagreement from personal criticism.
