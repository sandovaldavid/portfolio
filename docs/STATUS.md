# Current implementation status

This document classifies repository-level statements as of **2026-07-29**. It is an operational snapshot, not a roadmap. Code, configuration and executable checks remain authoritative.

## Status vocabulary

| Status          | Meaning                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------- |
| **Implemented** | Present in the current `develop` source or versioned configuration and directly verifiable. |
| **In progress** | Partially implemented; an open issue identifies concrete remaining work.                    |
| **Planned**     | Approved future work with no current implementation.                                        |
| **Blocked**     | Work or automation cannot proceed because of a named external constraint.                   |
| **Deprecated**  | Still present for compatibility but prohibited for new work.                                |
| **Historical**  | Point-in-time evidence or context that no longer defines current behavior.                  |
| **Discarded**   | Explicitly rejected or superseded.                                                          |
| **Unconfirmed** | Not verified against the current branch, repository settings or an authoritative result.    |

## Implemented

| Area                      | Verified repository evidence                                                                                                                                                                                                                                                            |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Static site               | Astro build scripts and static route implementation.                                                                                                                                                                                                                                    |
| Toolchain                 | Bun is pinned through `packageManager`; dependencies and scripts are defined in `package.json` and resolved by `bun.lock`.                                                                                                                                                              |
| Architecture              | Pragmatic Feature-Sliced Design with executable import-boundary checks.                                                                                                                                                                                                                 |
| Localization architecture | English-default and `/es` routing, granular typed UI catalogs, localized profile/experience/research/project/editorial content and Astro-native route helpers.                                                                                                                          |
| Localization enforcement  | Source catalog/content/copy checks, generated-route checks, bilingual browser coverage and unit regressions that prohibit the removed legacy runtime.                                                                                                                                   |
| Testing                   | Vitest unit tests, Playwright browser suites, Axe accessibility gates and pinned-Docker visual comparison.                                                                                                                                                                              |
| Performance               | Route-level budgets, bundle reporting and Lighthouse commands.                                                                                                                                                                                                                          |
| Development environment   | Versioned Dev Container with pinned Bun and Playwright, non-root user, Docker access and lifecycle validation.                                                                                                                                                                          |
| Workflow definitions      | Pull-request CI, CodeQL and preview workflows for `develop` and `main`; post-integration quality, scheduled quality and production deployment definitions.                                                                                                                              |
| Branch roles              | `develop` is the current integration base; `main` is the default and production branch; `resume-assets` supplies canonical CV artifacts.                                                                                                                                                |
| Resume asset delivery     | The isolated branch contains both canonical PDFs plus provenance manifest; strict source/destination validation and a successful Preview verify consumption.                                                                                                                            |
| Release automation        | Release Please (`release-please-config.json`, `.release-please-manifest.json`, `.github/workflows/release-please.yml`) runs on `main` only, producing plain `vX.Y.Z` tags and an auto-generated `CHANGELOG.md`; baseline `v1.0.0` is commit `72d8c852a8a518922e705409f4785484e999d53e`. |

The localization runtime no longer contains monolithic locale dictionaries, the flattened mixed-value translator, `useTranslations()`, `useTranslationsList()`, duplicated Atena/Skills/Components route implementations or the six-file hardcoded-copy debt baseline.

## In progress

No repository work is currently classified as **In progress**. Issues #180 and #182 are closed after merged PRs #181, #183 and #184 delivered their versioned branch-policy and resume-delivery contracts.

Any future item belongs here only when current source is partially implemented and an open issue or pull request identifies the concrete remaining work.

## Planned

No future work is currently classified as **Planned** in the active repository documentation. Proposed work must remain in GitHub issues or Cortex-L7 until it becomes an approved operational commitment.

## Deprecated

No localization compatibility runtime remains. Reintroducing monolithic locale files, mixed scalar/array translators, manual locale-prefix helpers or direct locale imports is prohibited and covered by executable checks.

## Blocked

No repository work or configured pull-request validation is currently classified as **Blocked**. A future unavailable, cancelled, skipped or quota-limited workflow must be recorded here rather than represented as passed.

## Unconfirmed

The following GitHub-hosted settings are not versioned in the repository and must be verified in the GitHub UI when relevant:

- current branch rulesets and required-check configuration;
- automatic branch deletion and permitted merge methods;
- Vercel deployment-environment protection.

Repository documentation defines the intended contract but does not claim these settings are active without verification.

## Discarded or superseded

The following policies no longer define current work:

- treating `main` as the base for every ordinary implementation branch;
- deleting or avoiding the long-lived `develop` integration branch;
- the discontinued dual-branch (`main` + `develop`) Release Please setup and its `porfolio-dev-*` beta tags; Release Please is back, but scoped to `main` only, producing plain stable `vX.Y.Z` tags — see [DELIVERY.md](DELIVERY.md);
- total `dist/` size as the blocking performance budget;
- global `prefetchAll` for every internal link.

## Historical

Point-in-time audits, completed branch plans, the completed i18n roadmap, the resolved branch-policy alignment and the recovered resume-asset incident do not define current behavior. Their durable context belongs in Cortex-L7, while Git history, merged pull requests, closed issues and `CHANGELOG.md` remain public historical evidence.

## Update rule

Update this file in the same pull request when an item changes category. A status change requires repository evidence or a linked issue/PR; it must not rely only on intention or a vault note.
