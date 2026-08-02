# Repository documentation

This directory contains only the operational documentation needed to understand, develop, validate and deliver the portfolio.

## Active documents

- [DEVELOPMENT.md](DEVELOPMENT.md) — local setup, Dev Container usage and troubleshooting.
- [I18N.md](I18N.md) — English/Spanish ownership and localization rules.
- [TESTING.md](TESTING.md) — quality gates, browser tests and performance checks.
- [DELIVERY.md](DELIVERY.md) — branches, pull requests, deployment, releases and resume assets.

The root [README.md](../README.md) explains the project, [AGENTS.md](../AGENTS.md) owns repository-working rules and [.github/CONTRIBUTING.md](../.github/CONTRIBUTING.md) owns the contributor workflow.

## Sources of truth

Executable sources override prose:

- `package.json` and `bun.lock` own commands and dependency versions;
- configuration files own thresholds and framework behavior;
- `.github/workflows/` owns automated validation and deployment behavior;
- `scripts/` and tests own executable repository contracts;
- `src/` owns implemented architecture and product behavior;
- Figma owns designed intent, while production styles own rendered behavior.

Do not add catalogs that restate folders, components, features, widgets, tests, colors or dependencies. Inspect the corresponding source and public APIs instead.

## Repository and Cortex-L7 boundary

The repository keeps only current operational information required to work safely without private context:

- setup and troubleshooting;
- implemented architecture rules summarized in `README.md` and `AGENTS.md`;
- localization ownership;
- testing and delivery procedures;
- contributor and agent conventions.

Cortex-L7 keeps:

- decisions, alternatives and consequences;
- detailed architecture reasoning;
- historical audits and migration context;
- design-system investigations and inventories;
- cross-repository strategy;
- plans, bugs and session handoffs.

Git history, issues, pull requests and releases remain the public historical record. Do not create an archive inside `docs/` for material moved to Cortex-L7.

## Naming

`portfolio` is the canonical repository, package and Cortex-L7 project identifier. `portfolio-v1` is retained only as historical provenance, redirect or alias where rewriting it would obscure what happened.

## Change rule

Update the smallest owning document and run:

```bash
bun run format:check
bun run check:docs
```

A document should be added only when a contributor cannot safely derive the required operational contract from the existing five documents and executable configuration.
