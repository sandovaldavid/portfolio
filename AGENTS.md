# Repository operating manual for agents

`AGENTS.md` is the canonical working contract for human and AI contributors. Tool-specific instructions may add only path-specific behavior and must link back here.

## Sources of truth

| Concern                            | Canonical source                                    |
| ---------------------------------- | --------------------------------------------------- |
| Project overview                   | [README.md](README.md)                              |
| Development environment            | [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)          |
| Localization and bilingual content | [docs/I18N.md](docs/I18N.md)                        |
| Testing and quality                | [docs/TESTING.md](docs/TESTING.md)                  |
| Branches, deployment and releases  | [docs/DELIVERY.md](docs/DELIVERY.md)                |
| Documentation ownership            | [docs/README.md](docs/README.md)                    |
| Contribution flow                  | [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md)  |
| Commands and dependency versions   | [package.json](package.json) and `bun.lock`         |
| Automated behavior                 | `.github/workflows/`, scripts, tests and config     |

Executable source and configuration override prose when they disagree.

## Repository identity

The canonical technical identifiers are:

- repository: `sandovaldavid/portfolio`;
- private package: `portfolio`;
- Cortex-L7 project: `portfolio` under `20-execution/portfolio/`.

`portfolio-v1` is historical. Preserve it only where dated provenance, redirects, aliases, issues, pull requests, releases or Git history require the former name.

## Status discipline

Use these classifications when reporting repository state:

- **Implemented:** present and directly verifiable in code or configuration;
- **In progress:** partially implemented with an active issue or pull request;
- **Blocked:** a named constraint prevents completion or validation;
- **Unconfirmed:** not verified against an authoritative source;
- **Deprecated:** still present for compatibility but prohibited for new work;
- **Planned:** approved future work not yet implemented;
- **Historical:** point-in-time context that no longer defines behavior;
- **Discarded:** rejected or superseded.

Active documentation should describe implemented operation. Decisions, alternatives, historical reasoning, inventories, plans and session handoffs belong in Cortex-L7.

## Branch and pull-request model

- `develop` is the integration base for ordinary work.
- `main` is the default and production branch.
- `resume-assets` contains only the validated public CV payload.

Before changing the repository:

1. update `develop` and create one short-lived branch;
2. read the issue, nearby source, tests and the smallest owning document;
3. identify localization, accessibility, responsive and regression impact;
4. implement one coherent concern;
5. run the strongest applicable validation;
6. open the pull request into `develop`.

Do not push directly to `develop` or `main`. Production promotion is a separate `develop` to `main` pull request governed by [docs/DELIVERY.md](docs/DELIVERY.md).

## Architecture

The enforced dependency direction is:

```text
src/pages → app → widgets → features → entities → shared
```

Required rules:

- dependencies point only downward;
- widgets, features and entities do not import peer slices;
- consumers use semantic aliases and slice `index.ts` public APIs;
- cross-layer and cross-slice relative imports are forbidden;
- shared code remains domain-agnostic;
- route files remain focused on routing, data resolution and composition;
- the catch-all alias, retired aliases, root layer barrels and deep imports are forbidden.

`bun run lint:architecture` and `scripts/check-architecture.mjs` are authoritative. A boundary change requires a checker change, tests and durable rationale synchronized to Cortex-L7.

## Localization and content

Follow [docs/I18N.md](docs/I18N.md).

- Update English and Spanish together for shared UI, accessibility and metadata copy.
- Use typed granular catalogs for reusable scalar UI text.
- Use localized Content Collections for structured and editorial content.
- Keep URLs, assets, ordering and stable IDs language-neutral.
- Do not add component-local bilingual maps, monolithic locale files, raw HTML translations, silent fallback or a parallel translation runtime.
- Do not invent seniority, impact, metrics or outcomes without verifiable evidence.

## Design and accessibility

David is the brand. The Portfolio Retro style is a channel expression, not a separate identity.

- Figma owns designed intent; production styles own implemented behavior.
- Components consume semantic or component roles rather than raw color literals.
- Preserve light and dark modes, English and Spanish, desktop and mobile behavior, keyboard access and reduced motion.
- Body and interface copy must remain readable; pixel typography is a limited accent.
- Color cannot be the only carrier of state or action.
- Add browser coverage for visible interaction or responsive changes.

Detailed design rationale and inventories belong in Cortex-L7, not `docs/`.

## Validation by change type

| Change              | Minimum validation                                                                    |
| ------------------- | ------------------------------------------------------------------------------------- |
| Documentation       | `bun run format:check` and `bun run check:docs`                                       |
| Pure logic          | focused tests plus `bun run test:unit:ci`                                             |
| Astro or UI         | focused Playwright regression plus `bun run test:e2e:smoke`                           |
| Architecture        | `bun run lint:architecture` and affected tests                                        |
| Localization        | `bun run check:i18n`, build, generated links and bilingual smoke coverage             |
| Performance/loading | build, `bun run performance:check` and applicable browser or Lighthouse validation    |
| CI or tooling       | `bun run check`, the changed command and workflow review                              |

Coverage percentages apply only to `unitCoverageScope` in `vitest.config.ts`; they are not whole-repository coverage.

A missing, skipped, cancelled, disabled or quota-blocked workflow is not a pass. Record exact commands, environment and results.

## Documentation rules

- Keep the root README concise and recruiter/developer oriented.
- Keep only the five operational documents indexed by [docs/README.md](docs/README.md).
- Do not add folder catalogs, dependency inventories, test snapshots, color inventories or point-in-time status reports.
- Update executable configuration instead of duplicating versions, thresholds or route matrices in prose.
- Move decisions, alternatives, architecture reasoning, historical audits, cross-repository strategy, plans and handoffs to Cortex-L7.
- Do not create a repository archive for removed documentation; Git history preserves it.
- Run `bun run check:docs` after moving or deleting files.

## Git and pull requests

Use Conventional Commits:

```text
<type>(<scope>): <description>
```

A pull request should state:

- the verified problem and chosen solution;
- user or developer impact;
- validation commands, environment and results;
- risks and intentionally deferred work;
- screenshots for visible changes;
- `Closes #<issue>` only when the merge completes that issue.

Use squash merge for ordinary focused changes. Do not merge unless explicitly authorized.

## Canonical local gate

```bash
bun install --frozen-lockfile
bun run check
bun run test:unit:ci
bun run build
```

Add generated-link, Playwright, Lighthouse, Docker visual or performance commands according to [docs/TESTING.md](docs/TESTING.md).
