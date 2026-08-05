# Branch protection and ruleset contract

This document records the GitHub-hosted protection expected for `develop` and `main`. Rulesets, required checks, Actions quota, repository secrets and environment protection are not stored in Git; verify them in repository settings before relying on them.

## Branch lifecycle

```text
short-lived branch -> develop -> main -> production
```

- `develop` is the integration branch for ordinary pull requests.
- `main` is the default and production branch.
- Ordinary promotions come from `develop`, but pull requests into `main` are not restricted to that source: a hotfix may go directly to `main`, and Release Please opens its own release pull requests from a branch that is never `develop`.
- `develop` uses squash merge only. `main` allows both squash (single-purpose pull requests: hotfixes, Dependabot, Release Please) and merge (the `develop` → `main` promotion, so `develop`'s individual commit history stays a real ancestor of `main` for future `main` → `develop` syncs). Both branches reject direct or force pushes.

## Stable pull-request checks

The versioned workflows expose these stable checks for pull requests targeting `develop` or `main`:

- `Code Quality & Commits`;
- `Unit Tests (Vitest)`;
- `Build & Bundle Analysis`;
- `Playwright Chromium Smoke`;
- `Analyze Security`.

`PR Summary Report` and `Deploy to Vercel Preview` are informative and should not be required. The summary is derivative, while preview deployment depends on Vercel credentials and service availability.

Do not configure `Deploy to Vercel Production` as a required pull-request check. It is a post-merge workflow triggered directly on push to `main`; `Main Quality` is what gates the pull request before merge (see the `main` ruleset below).

## Ruleset for develop

Use branch target `develop` and configure:

- require a pull request before merge;
- require the branch to be up to date before merge;
- require conversation resolution;
- require these checks:
    - `Code Quality & Commits`;
    - `Unit Tests (Vitest)`;
    - `Build & Bundle Analysis`;
    - `Playwright Chromium Smoke`;
    - `Analyze Security`;
- block direct pushes;
- block force pushes;
- block branch deletion;
- allow squash merge only at repository level;
- optionally require one approval when an independent reviewer is available.

## Ruleset for main

Use branch target `main` and configure:

- require a pull request before merge;
- require the branch to be up to date before merge;
- require conversation resolution;
- require these checks:
    - `Code Quality & Commits`;
    - `Unit Tests (Vitest)`;
    - `Build & Bundle Analysis`;
    - `Playwright Chromium Smoke`;
    - `Analyze Security`;
    - `Main Build & Unit Quality`;
    - `Main Chromium Suite`;
    - `Main Lighthouse`;
- block direct pushes;
- block force pushes;
- block branch deletion;
- allow both squash and merge methods at repository level;
- optionally require one approval when an independent reviewer is available.

`main` intentionally accepts pull requests from more than one kind of source branch: `develop` promotions, direct hotfixes, and Release Please's release pull requests. No job restricts the head branch name.

## Environment protection

### Preview

The `Preview` environment is used by pull requests targeting `develop` or `main`, and by the post-merge deployment from `develop`.

Recommended configuration:

- allow deployments from pull-request refs and the `develop` branch;
- do not make the Preview deployment a required merge check;
- keep Vercel credentials scoped to the Preview environment;
- review deployment history when a preview is used as manual evidence.

### Production

The `Production` environment is used only by `.github/workflows/deploy-production.yml`.

Recommended configuration:

- restrict deployment branches to `main`;
- keep Vercel production credentials scoped to this environment;
- optionally require a maintainer approval;
- retain deployment history;
- do not expose production credentials to pull-request workflows.

## Repository merge settings

Verify:

- squash merge enabled;
- merge commits enabled (used only for the `develop` → `main` promotion; every other pull request still squashes);
- rebase merge disabled;
- automatic deletion of merged branches **disabled** at the repository level — `develop` is a long-lived branch and must survive being the head of a promotion pull request; delete short-lived branches explicitly per merge instead (`gh pr merge --delete-branch`);
- auto-merge enabled only when the maintainer intentionally uses it;
- `main` remains the default branch.

## Verification checklist

- [ ] `develop` accepts ordinary pull requests and rejects direct/force pushes.
- [ ] `main` accepts promotion, hotfix and Release Please pull requests and rejects direct/force pushes.
- [ ] Pull requests into `develop` report the five stable checks; pull requests into `main` report those five plus the three `Main Quality` jobs.
- [ ] Check names in rulesets exactly match the workflow job names above.
- [ ] Preview runs for pull requests into `develop` and `main` when credentials are available, and pushes to `develop` update `https://dev.sandovaldavid.com`.
- [ ] Preview and PR summary remain informative rather than required.
- [ ] `Main Quality` runs as a pull-request check against `main` (or manual dispatch), not on push.
- [ ] Production deploys directly on push to `main`, except documented manual/resume dispatches.
- [ ] Production deployment is not configured as a pre-merge requirement.
- [ ] `develop` survives being the head of a merged promotion pull request (automatic branch deletion on merge is disabled at the repository level).

Treat unchecked hosted settings as **Unconfirmed** and unavailable automation as **Blocked**, not passed.
