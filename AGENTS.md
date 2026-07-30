# Repository operating manual for agents

`AGENTS.md` is the canonical repository-working contract for human and AI contributors. Tool-specific instruction files may add only tool or path-specific behavior and must link back here instead of copying these rules.

## 1. Sources of truth

| Concern                            | Canonical source                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------------- |
| Product and repository overview    | [README.md](README.md)                                                           |
| Current implementation status      | [docs/STATUS.md](docs/STATUS.md)                                                 |
| Architecture boundaries            | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and `bun run lint:architecture`     |
| Localization and bilingual content | [docs/I18N.md](docs/I18N.md)                                                     |
| Tool and dependency versions       | [package.json](package.json) and `bun.lock`                                      |
| Testing                            | [docs/TESTING.md](docs/TESTING.md)                                               |
| CI behavior                        | [docs/CI.md](docs/CI.md) and `.github/workflows/`                                |
| Branches, releases and deployment  | [docs/DELIVERY.md](docs/DELIVERY.md)                                             |
| Canonical resume artifact delivery | [docs/RESUME-DELIVERY.md](docs/RESUME-DELIVERY.md)                               |
| Performance budgets                | [docs/PERFORMANCE.md](docs/PERFORMANCE.md) and `config/performance-budgets.json` |
| Documentation ownership            | [docs/README.md](docs/README.md)                                                 |
| Contribution flow                  | [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md)                               |

Executable code and configuration override prose when they disagree. Do not copy versions, thresholds, command definitions or architecture rules into a second active document.

### Repository identity and historical naming

The canonical technical identifiers are:

- GitHub repository: `sandovaldavid/portfolio`;
- private package: `portfolio`;
- Cortex-L7 project and workspace: `portfolio` and `20-execution/portfolio/`.

`portfolio-v1` is a **Historical** identifier preserved only where dated provenance, redirects, aliases, issues, pull requests, releases or Git history require it. Do not reintroduce it into current commands, paths, configuration or active documentation, and do not silently rewrite historical records that need the former name to remain understandable.

Before changing branch or delivery documentation, compare `develop` and `main` by ancestry and changed files. A promotion merge, hotfix or Release Please commit can make `main` numerically ahead while still containing the integrated `develop` tree. Reconcile `main` back into `develop` only when a main-only operational or source change must become part of future integration work; commit counts alone are not evidence of drift.

## 2. Status discipline

Classify repository statements using the vocabulary in [docs/STATUS.md](docs/STATUS.md):

- **Implemented:** present in code or configuration and verifiable through the repository;
- **In progress:** partially implemented with an active issue or pull request identifying the remaining work;
- **Blocked:** work or automation cannot proceed because of a named external constraint;
- **Unconfirmed:** plausible but not verified against the current branch or an authoritative result;
- **Deprecated:** still present for compatibility but prohibited for new work;
- **Planned:** approved future work that is not implemented;
- **Historical:** point-in-time context that no longer defines current behavior;
- **Discarded:** explicitly rejected or superseded.

Active repository documentation should describe **Implemented** behavior and only the minimum **In progress**, **Blocked**, **Unconfirmed** or **Deprecated** context needed to operate safely. Decisions, alternatives, historical reasoning, plans and session handoffs belong in the `portfolio` project area of Cortex-L7. Never present an issue, roadmap item or vault note as implemented behavior.

## 3. Branch and pull-request model

The current branch roles are:

- `develop`: integration branch and base for ordinary feature, fix, documentation and maintenance pull requests;
- `main`: default and production branch, updated through a focused promotion pull request from `develop`;
- `resume-assets`: canonical resume artifact branch consumed by preview and production workflows.

Before changing the repository:

1. update local `develop`;
2. read the issue, nearby implementation and owning active documentation;
3. create one short-lived branch from `develop`;
4. identify architecture, bilingual, accessibility and regression-test impact;
5. keep one coherent concern per pull request;
6. open the implementation pull request into `develop`.

Do not work directly on `develop` or `main`. Promotion from `develop` to `main` is a separate release concern governed by [docs/DELIVERY.md](docs/DELIVERY.md). Changes to the public CV payload or its publication path must follow [docs/RESUME-DELIVERY.md](docs/RESUME-DELIVERY.md) and must not copy private resume sources into this repository.

## 4. Architecture and code

The enforced dependency direction is:

```text
src/pages → app → widgets → features → entities → shared
```

Required practices:

- consume slices through semantic aliases and public `index.ts` APIs;
- do not import peer slices from `widgets`, `features` or `entities`;
- avoid catch-all aliases, deep imports and root layer barrels;
- use strict TypeScript and prefer `unknown` over `any`;
- type component props and non-trivial function boundaries;
- keep Astro route files focused on routing and composition;
- explain non-obvious behavior and trade-offs, not self-evident syntax.

`bun run lint:architecture` is authoritative when prose and implementation disagree. A boundary change requires an executable checker update, affected tests and current operational documentation. Maintainers must synchronize durable rationale and rejected alternatives to Cortex-L7 rather than storing planning history in the repository.

## 5. User-facing and localized changes

- Follow [docs/I18N.md](docs/I18N.md) before adding or moving localized content.
- Classify text as UI copy, structured portfolio content, editorial content or language-neutral data and update only its canonical owner.
- Update English and Spanish together, including visible copy, accessibility labels and localized metadata.
- Do not add monolithic locale files, component-local bilingual copy maps, raw HTML translations or a parallel translation runtime.
- Use only the typed granular scalar catalog API, schema-validated localized content collections and Astro-native locale helpers; missing translations are build defects and must fail loudly.
- Preserve keyboard navigation, semantic HTML, reduced-motion behavior and light/dark themes.
- Add browser coverage for interactions, navigation lifecycle or responsive behavior.
- Do not add seniority, impact, coverage or performance claims without verifiable evidence.

## 6. Validation by change type

| Change              | Minimum validation                                                                    |
| ------------------- | ------------------------------------------------------------------------------------- |
| Documentation only  | `bun run check:docs` and `bun run format:check`                                       |
| Pure logic          | relevant unit tests plus `bun run test:unit:ci`                                       |
| Astro/UI behavior   | relevant Playwright regression plus `bun run test:e2e:smoke`                          |
| Architecture        | `bun run lint:architecture` and affected tests                                        |
| Localization        | focused `check:i18n:*`, build, generated-link validation and bilingual smoke coverage |
| Performance/loading | `bun run build`, `bun run performance:check` and relevant browser test                |
| CI/tooling          | `bun run check`, the changed command locally and workflow review                      |

Coverage percentages apply only to the scope documented in [docs/testing/UNIT-COVERAGE.md](docs/testing/UNIT-COVERAGE.md).

A missing, skipped, disabled or quota-blocked GitHub Actions run is **not** a successful validation. Record exactly which commands were executed, their environment and their results. When automation is unavailable, local validation is mandatory and the unavailable automation remains **Blocked** or **Unconfirmed**.

## 7. Documentation rules

- Keep the root README concise and recruiter/developer oriented.
- Update the owning active document instead of repeating guidance elsewhere.
- Quantitative claims require a versioned configuration, reproducible command or linked artifact methodology.
- Keep current behavior, installation, configuration, testing, deployment, troubleshooting and contributor contracts in the repository.
- Move decisions, alternatives, reasoning, historical audits, cross-repository strategy, plans and session handoffs to Cortex-L7.
- Do not add a repository archive for material that belongs in the vault; Git history remains the public change record.
- Run `bun run check:docs` after changing links or moving files.

## 8. Git and pull requests

Use Conventional Commits:

```text
<type>(<scope>): <description>
```

Common branch prefixes are `feat/`, `fix/`, `docs/`, `refactor/`, `perf/`, `test/`, `chore/`, `ci/`, `deps/`, `security/` and `agent/`.

A pull request should state:

- what changed and why;
- user or developer impact;
- validation performed, including commands and environment;
- risks, trade-offs or intentionally deferred work;
- `Closes #<issue>` only when the merge completes that issue.

Use squash merge so the validated pull-request title becomes the integration commit. Do not merge unless explicitly requested. Before marking a pull request ready, confirm that it targets the intended branch, contains no unrelated changes and has the strongest validation currently available.

## 9. Canonical local gate

```bash
bun install --frozen-lockfile
bun run check
bun run test:unit:ci
bun run build
```

Add the relevant generated-link, Playwright, Lighthouse, Docker visual or performance command based on the change. Exact command definitions live in [package.json](package.json).
