# Contributing

Contributions are welcome. Keep changes focused, reproducible and aligned with the current repository documentation.

## Setup

Use the Bun version declared in [package.json](../package.json).

```bash
git clone https://github.com/sandovaldavid/portfolio.git
cd portfolio
git switch develop
bun install --frozen-lockfile
bun run dev
```

The recommended environment is the Dev Container documented in [docs/DEVCONTAINER.md](../docs/DEVCONTAINER.md).

## Branch workflow

1. Update `develop` and create a short-lived prefixed branch from it.
2. Read [AGENTS.md](../AGENTS.md), [docs/STATUS.md](../docs/STATUS.md) and the owning document for the area being changed.
3. Implement one coherent concern without reintroducing removed compatibility paths or bypassing executable gates.
4. Add the relevant unit or browser regression.
5. For user-facing content, follow [docs/I18N.md](../docs/I18N.md), update English and Spanish together and include accessibility and metadata copy.
6. Run the canonical local checks and every change-specific check.
7. Open a pull request into `develop` using a Conventional Commit title.
8. Record exact validation commands, environment and results in the pull request.
9. Squash merge only after review and explicit authorization.

`main` is the default and production branch. Promotion from `develop` to `main` is a separate pull request governed by [docs/DELIVERY.md](../docs/DELIVERY.md); ordinary feature branches do not target `main` directly.

## Canonical validation

```bash
bun run check
bun run test:unit:ci
bun run build
```

Add `bun run check:links`, the relevant Playwright command, route budgets, Lighthouse or pinned-Docker visual validation according to [docs/TESTING.md](../docs/TESTING.md).

A missing, skipped, disabled or quota-blocked GitHub Actions run is not a pass. When automation is unavailable, local validation remains mandatory and the unavailable automation must be reported as **Blocked** or **Unconfirmed**.

## Pull requests

A pull request should include:

- the problem and verified current state;
- the chosen solution and its impact;
- validation performed, including commands and environment;
- risks, trade-offs or intentionally deferred work;
- screenshots for visible changes;
- `Closes #<issue>` only when the merge completes that issue.

Do not weaken architecture, localization, testing, accessibility or performance gates merely to make a check pass. Update configuration only with evidence and a documented operational reason.

## Documentation

[docs/README.md](../docs/README.md) defines ownership, status classification and the repository/Cortex-L7 boundary.

Keep in the repository:

- current behavior and architecture;
- installation, configuration and development instructions;
- testing, deployment and troubleshooting contracts;
- conventions required by contributors and agents.

Keep in Cortex-L7:

- decisions and alternatives;
- historical reasoning and audits;
- cross-repository strategy;
- plans and session handoffs;
- private or durable context that should survive repository refactors.

Do not document an issue, roadmap item or vault note as existing functionality. Update the canonical owner and run `bun run check:docs` after changing links or moving files.

## Conduct

Be respectful, keep reviews specific and evidence-based, and separate technical disagreement from personal criticism.
