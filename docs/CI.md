# Continuous integration policy

This document describes the workflows versioned in `.github/workflows/` and distinguishes configured automation from validation that actually ran.

## Branch lifecycle

The repository uses two long-lived branches:

- `develop` is the integration branch for ordinary implementation, documentation and maintenance pull requests;
- `main` is the default and production branch and receives focused promotion pull requests from `develop`.

The supported lifecycle is:

```text
short-lived branch -> develop -> main -> production
```

Pull-request quality, security and preview workflows cover both long-lived base branches. `Main Quality` and normal production deployment remain restricted to the integrated `main` revision.

## Configured workflows

| Trigger                                                               | Workflow                      | Implemented purpose                                                                                                                                                                                           |
| --------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pull request to `develop` or `main`                                   | `Continuous Integration`      | Repository checks, unit tests, production build, route budgets, Chromium smoke/Axe gates and exact base/head Portfolio Retro evidence.                                                                        |
| Pull request to `develop` or `main`                                   | `Deploy to Vercel Preview`    | Builds and deploys the exact pull-request head to a Vercel preview when credentials are available.                                                                                                            |
| Pull request to `develop` or `main`; push to `main`; scheduled/manual | `CodeQL`                      | Security and code-quality analysis for integration and production changes.                                                                                                                                    |
| Pull request to `main` or manual run                                  | `Main Quality`                | Repository checks, scoped coverage, build, generated-link validation, route budgets, a Chromium Playwright run and a single-run performance-only Lighthouse pass — a required check gating merge into `main`. |
| Weekly or manual                                                      | `Scheduled Extended Quality`  | Extended desktop/mobile, visual, coverage, generated-link, bundle and full four-category/three-run Lighthouse audits.                                                                                         |
| Dev Container changes or manual run                                   | `Build Dev Container`         | Validates the versioned development environment.                                                                                                                                                              |
| Push to `main`; manual/resume dispatch                                | `Deploy to Vercel Production` | Deploys the pushed `main` revision or the explicitly selected current `main` revision.                                                                                                                        |

Workflow YAML is **Implemented** configuration. A workflow result is evidence only when a run exists for the exact commit and completes successfully.

## Pull requests into develop

Ordinary feature, fix, documentation and maintenance branches start from current `develop` and target `develop`.

The stable required checks are:

- `Code Quality & Commits`;
- `Unit Tests (Vitest)`;
- `Build & Bundle Analysis`;
- `Playwright Chromium Smoke`;
- `Analyze Security`.

`PR Summary Report`, `Portfolio Retro Visual Evidence` and `Deploy to Vercel Preview` are informative. They should not be required because summary generation is derivative, the evidence job is change-specific and preview availability depends on hosted secrets and Vercel availability.

A skipped, absent, disabled, cancelled, quota-blocked or `action_required` run is **Blocked**, not successful. When hosted automation is unavailable, execute the closest local equivalents and record the limitation explicitly.

## Portfolio Retro visual evidence

`Portfolio Retro Visual Evidence` checks out the exact pull-request base SHA beside the exact head SHA, builds both revisions, starts isolated preview servers and uploads paired screenshots as `portfolio-retro-color-evidence`.

The maintained matrix covers English/light desktop, Spanish/dark desktop, English/dark mobile, light 404, dark CLI and dark retro Splash. This artifact supports review of token migrations; it does not replace the blocking Playwright smoke/Axe job or the pinned maintained visual suite.

## Promotion pull requests into main

A focused `develop` -> `main` pull request is the production promotion boundary. Do not add unrelated implementation work directly to the promotion branch.

No workflow job restricts pull requests into `main` by source branch: ordinary promotions come from `develop`, but a hotfix may go directly to `main`, and [Release Please](DELIVERY.md) opens its own release pull requests from a branch that is never `develop`.

Promotion pull requests use the same required quality and security checks as `develop`, plus the full `Main Quality` suite (a required check on `main` only, not on `develop`):

- `Code Quality & Commits`;
- `Unit Tests (Vitest)`;
- `Build & Bundle Analysis`;
- `Playwright Chromium Smoke`;
- `Analyze Security`;
- `Main Build & Unit Quality`;
- `Main Chromium Suite`;
- `Main Lighthouse`.

`Main Chromium Suite` runs Chromium only, and `Main Lighthouse` audits one run scoped to the `performance` category — this is the fast pre-merge gate, not the full cross-browser and multi-category sweep. Firefox, WebKit, the mobile matrix and the full three-run Lighthouse audit for `performance`, `accessibility`, `best-practices` and `seo` run weekly in `Scheduled Extended Quality`. Axe remains the primary accessibility interaction gate; the scheduled Lighthouse accessibility category is complementary page-level evidence.

The stable job names are an external contract with GitHub rulesets. Do not rename them without coordinating the hosted required-check configuration.

Promotion pull requests are merged with a real merge commit, not a squash — see [DELIVERY.md](DELIVERY.md) "Promotion to main" for why. `main`'s ruleset allows both `merge` and `squash`; squash remains correct for single-purpose pull requests such as hotfixes or Dependabot updates.

Do not require `Deploy to Vercel Production` before merge. It is a post-merge control that runs directly on push to `main`, trusting that `Main Quality` already validated the merged state as a required pull-request check.

## Main integration and production

Because `Main Quality` now gates the pull request itself, a push to `main` is only ever a state that already passed the full suite. After a merge lands on `main`:

1. the production workflow triggers directly on the push, with no separate post-merge validation run to wait for;
2. the deployment checks out `github.sha`, verifies it matches the pushed revision and deploys it with the production Vercel environment;
3. manual and resume-asset dispatches explicitly rebuild the current `main` tip;
4. canonical English and Spanish resume URLs are verified after deployment.

No feature branch, `develop` revision or unvalidated SHA is part of the normal production path.

## Local equivalents

Use the canonical local gate when hosted automation is unavailable or when change-specific validation requires more depth:

```bash
bun install --frozen-lockfile
bun run check
bun run test:unit:ci
bun run build
bun run bundle:analyze
bun run performance:check
bun run check:links
CI=true bun run test:e2e:smoke
```

For a local base/head visual capture, build a baseline checkout in `baseline/`, ensure the current checkout has `dist/`, install Chromium and run:

```bash
DESIGN_SYSTEM_BEFORE_DIR=baseline \
DESIGN_SYSTEM_AFTER_DIR=. \
bun run screenshots:design-system
```

Add the exact commands required by [TESTING.md](TESTING.md), such as desktop, extended, pinned-Docker visual or Lighthouse suites.

The pull-request description must state:

- exact branch head or commit tested;
- environment, including Dev Container or host details when relevant;
- commands executed;
- pass/fail result and every intentionally unavailable gate.

## Scheduled and visual policy

`Scheduled Extended Quality` runs weekly when automation is available and can also be started manually. The pinned Docker image is authoritative for maintained visual snapshots. Native host runs are diagnostics only when the host differs from the baseline environment.

## Reusable setup and caching

`.github/actions/setup-bun/action.yml` owns the pinned Bun setup, dependency cache and frozen installation used by workflows.

Only dependency and `.astro` caches are used. `dist/` is rebuilt and transferred as a short-lived artifact; it is not an incremental cache. The visual Docker route separately pins Playwright and Bun in `docker/Dockerfile.test`.

## Failure artifacts

Playwright workflows upload reports, traces, screenshots, videos, JSON and JUnit diagnostics with `if: always()`. Coverage, Lighthouse, route-budget, bundle and Portfolio Retro before/after evidence are retained by the workflows that generate them.

## GitHub-hosted settings

Branch rulesets, required checks, workflow enablement, Actions quota, secrets and environment protections are not versioned in the repository. Their current state is **Unconfirmed** until inspected in GitHub. See [STATUS.md](STATUS.md) and [the branch-protection guide](../.github/BRANCH_PROTECTION.md).
