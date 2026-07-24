# David Sandoval — Software Engineering Portfolio

[![Live portfolio](https://img.shields.io/badge/live-sandovaldavid.com-0096ff)](https://sandovaldavid.com)
[![CI workflow](https://github.com/sandovaldavid/portfolio-v1/actions/workflows/ci.yml/badge.svg)](https://github.com/sandovaldavid/portfolio-v1/actions/workflows/ci.yml)
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

- **Delivery:** Astro generates a static site; JavaScript is used for progressive interactions and client-navigation lifecycle behavior.
- **Architecture:** dependencies follow `src/pages → app → widgets → features → entities → shared` and are checked by `bun run lint:architecture`.
- **Localization:** English is unprefixed and Spanish uses `/es`; granular UI catalogs, localized Content Collections, metadata and generated-route checks enforce the bilingual contract.
- **Quality:** repository checks, unit tests, Playwright, Axe, route budgets and Lighthouse commands are versioned in the repository.
- **Development environment:** a pinned Playwright/Bun Dev Container supports the complete local validation workflow.
- **Deployment:** `develop` is the integration branch; `main` is the default and production branch. Promotion to `main` is handled through a separate pull request.

The removed localization compatibility runtime must not be reintroduced. Current source ownership and enforcement are documented in [docs/I18N.md](docs/I18N.md) and [docs/I18N-ENFORCEMENT.md](docs/I18N-ENFORCEMENT.md).

## Quality gates

| Area                            | Repository contract                                     |
| ------------------------------- | ------------------------------------------------------- |
| Formatting, lint and types      | `bun run check`                                         |
| Documentation links             | `bun run check:docs`                                    |
| Unit behavior                   | `bun run test:unit:ci` and the scoped coverage command  |
| Production output               | `bun run build` and `bun run check:links`               |
| Browser and accessibility flows | Playwright smoke, desktop, extended and visual commands |
| Performance                     | route budgets and Lighthouse commands                   |
| Development environment         | `bun run check:devcontainer`                            |

GitHub workflow definitions automate selected promotion, production and scheduled gates. A missing, disabled or quota-blocked workflow run is not validation evidence; pull requests must list the commands that actually ran.

## Architecture

```text
src/pages → src/app → src/widgets → src/features → src/entities → src/shared
```

Astro route files are framework entry points. Product code consumes lower layers through semantic aliases and slice public APIs. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the executable rules.

## Local development

Use the Bun version declared by `packageManager` in [package.json](package.json).

```bash
git clone https://github.com/sandovaldavid/portfolio-v1.git
cd portfolio-v1
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

Add generated-link, browser, performance or visual validation according to [docs/TESTING.md](docs/TESTING.md).

## Documentation

- [Documentation ownership and status vocabulary](docs/README.md)
- [Current implementation status](docs/STATUS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Internationalization](docs/I18N.md)
- [Testing](docs/TESTING.md)
- [CI policy](docs/CI.md)
- [Delivery and release policy](docs/DELIVERY.md)
- [Toolchain](docs/TOOLCHAIN.md)
- [Performance methodology](docs/PERFORMANCE.md)
- [Dev Container](docs/DEVCONTAINER.md)
- [Agent guidelines](AGENTS.md)
- [Contribution workflow](CONTRIBUTING.md)

Decisions, alternatives, historical audits, plans and session handoffs are maintained in the `portfolio-v1` project area of Cortex-L7 instead of the active repository documentation.

## License

[MIT](LICENSE)
