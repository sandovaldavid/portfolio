# David Sandoval — Software Engineering Portfolio

[![Live portfolio](https://img.shields.io/badge/live-sandovaldavid.com-0096ff)](https://sandovaldavid.com)
[![CI workflow](https://github.com/sandovaldavid/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/sandovaldavid/portfolio/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A bilingual, static-first portfolio for presenting software-engineering experience, project evidence, research and technical writing.

## Quick access

| Resource                 | Link                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| Live site                | [sandovaldavid.com](https://sandovaldavid.com)                                                |
| English CV               | [david-sandoval-resume.pdf](https://sandovaldavid.com/resume/david-sandoval-resume.pdf)       |
| Spanish CV               | [david-sandoval-resume-es.pdf](https://sandovaldavid.com/resume/david-sandoval-resume-es.pdf) |
| Spanish repository guide | [README.es.md](README.es.md)                                                                  |

## Current implementation

- **Repository identity:** `sandovaldavid/portfolio` and the private package `portfolio` are canonical. `portfolio-v1` is retained only as historical provenance or redirect.
- **Delivery:** Astro generates a static site with progressive client-side interactions.
- **Architecture:** dependencies follow `src/pages → app → widgets → features → entities → shared` and are enforced by `bun run lint:architecture`.
- **Localization:** English is unprefixed and Spanish uses `/es`; typed UI catalogs, localized Content Collections and route checks enforce parity.
- **Quality:** Vitest, Playwright, Axe, generated-link checks, route budgets and Lighthouse are versioned in the repository.
- **Deployment:** `develop` is the integration branch and `main` is the production branch.
- **Resume delivery:** validated public PDFs are supplied through the isolated `resume-assets` branch; editable sources remain private.

## Architecture

```text
src/pages → src/app → src/widgets → src/features → src/entities → src/shared
```

Astro routes are entry points. Product layers depend only downward, peer slices remain isolated and consumers use semantic aliases plus public `index.ts` APIs. `scripts/check-architecture.mjs` is the detailed executable contract.

## Local development

Use the Bun version declared in [package.json](package.json).

```bash
git clone https://github.com/sandovaldavid/portfolio.git
cd portfolio
git switch develop
bun install --frozen-lockfile
bun run dev
```

Canonical validation:

```bash
bun run check
bun run test:unit:ci
bun run build
```

## Documentation

- [Documentation boundary and index](docs/README.md)
- [Development and troubleshooting](docs/DEVELOPMENT.md)
- [Internationalization](docs/I18N.md)
- [Testing and quality](docs/TESTING.md)
- [Branches, deployment and releases](docs/DELIVERY.md)
- [Agent operating manual](AGENTS.md)
- [Contribution workflow](.github/CONTRIBUTING.md)

Detailed decisions, alternatives, architecture reasoning, inventories, historical audits, plans and session handoffs live in the `portfolio` project area of Cortex-L7. Source code, configuration, tests and workflows remain authoritative for current behavior.

## License

[MIT](LICENSE)
