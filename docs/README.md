# Documentation index and ownership

English is the primary repository documentation language. Spanish is maintained for the root project guide and user-facing content.

## Active operational documentation

| Document                                             | Owns                                                             |
| ---------------------------------------------------- | ---------------------------------------------------------------- |
| [README.md](../README.md)                            | Recruiter/developer overview, live resources and quick start     |
| [README.es.md](../README.es.md)                      | Spanish repository overview                                      |
| [AGENTS.md](../AGENTS.md)                            | Shared operating rules for human and AI contributors             |
| [CONTRIBUTING.md](../CONTRIBUTING.md)                | Contribution workflow and pull-request expectations              |
| [STATUS.md](STATUS.md)                               | Verified current state and status classification                 |
| [ARCHITECTURE.md](ARCHITECTURE.md)                   | Current FSD boundaries and executable architecture policy        |
| [DEVCONTAINER.md](DEVCONTAINER.md)                   | Reproducible development environment and troubleshooting         |
| [I18N.md](I18N.md)                                   | English/Spanish content ownership and localization rules         |
| [I18N-CATALOGS.md](I18N-CATALOGS.md)                 | Current granular UI catalog and localized-content API            |
| [I18N-METADATA.md](I18N-METADATA.md)                 | SEO, social, RSS, JSON-LD and accessibility metadata             |
| [I18N-ENFORCEMENT.md](I18N-ENFORCEMENT.md)           | Executable locale parity, copy and route quality gates           |
| [TESTING.md](TESTING.md)                             | Test strategy and local commands                                 |
| [testing/UNIT-COVERAGE.md](testing/UNIT-COVERAGE.md) | Measured Vitest coverage scope                                   |
| [CI.md](CI.md)                                       | Configured workflows, local evidence and automation availability |
| [DELIVERY.md](DELIVERY.md)                           | Integration, promotion, production and release policy            |
| [RESUME-DELIVERY.md](RESUME-DELIVERY.md)             | Canonical CV artifact provenance, validation and recovery        |
| [TOOLCHAIN.md](TOOLCHAIN.md)                         | Runtime and dependency classification policy                     |
| [PERFORMANCE.md](PERFORMANCE.md)                     | Route-budget methodology and loading contracts                   |
| [STYLE-GUIDE.md](STYLE-GUIDE.md)                     | Maintained visual tokens, typography and semantic styling rules  |
| [features-catalog.md](features-catalog.md)           | Current feature slices                                           |
| [widgets-catalog.md](widgets-catalog.md)             | Current widget slices                                            |
| [tools.md](tools.md)                                 | Maintained developer-tool usage notes                            |

Catalogs describe current slices but do not redefine architecture rules.

## Repository and Cortex-L7 boundary

### The repository owns

- implemented behavior and current architecture;
- public contracts and canonical source locations;
- installation, configuration and development instructions;
- test commands, expected gates and troubleshooting;
- workflow definitions, deployment behavior and release procedure;
- conventions required by contributors and coding agents.

### Cortex-L7 owns

- decisions and rejected alternatives;
- reasoning, consequences and historical context;
- private evidence and knowledge that should not be published;
- cross-repository strategy;
- plans, backlogs that are not GitHub issues and session handoffs;
- consolidated context from completed audits and migrations.

A repository document may link to a public issue or pull request for current work, but it must remain usable without access to the private vault. Git history, merged pull requests, closed issues and `CHANGELOG.md` remain the public historical record.

## Status classification

Use the definitions in [STATUS.md](STATUS.md):

- **Implemented** for verifiable current behavior;
- **In progress** for partially implemented work with a concrete active issue or PR;
- **Blocked** for a named external constraint;
- **Unconfirmed** for facts not verified against current authoritative state;
- **Deprecated** for compatibility code that must not gain new consumers;
- **Planned**, **Historical** and **Discarded** for context that belongs in GitHub planning/history or Cortex-L7 rather than active behavior documentation.

Do not describe an issue, roadmap item, previous audit or vault decision as implemented functionality.

## Ownership and update policy

1. Update the owning document instead of copying guidance elsewhere.
2. `package.json`, `bun.lock` and executable configuration own versions, commands and thresholds.
3. Quantitative statements require a reproducible command, versioned configuration or artifact methodology.
4. Tool-specific instruction files may contain only tool/path deltas and must reference [AGENTS.md](../AGENTS.md).
5. Keep only operational consequences of a decision in repository documentation; synchronize durable rationale and alternatives to Cortex-L7.
6. Update [STATUS.md](STATUS.md) when an item changes classification.
7. Run `bun run check:docs` after adding, removing or moving documentation.

Any pull request changing behavior must update the owning document in the same change when the operational contract changes.
