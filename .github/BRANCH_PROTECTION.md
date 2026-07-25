# Branch protection and ruleset contract

This document records the GitHub-hosted protection expected for `develop` and `main`. Rulesets, required checks, Actions quota, repository secrets and environment protection are not stored in Git; verify them in repository settings before relying on them.

## Branch lifecycle

```text
short-lived branch -> develop -> main -> production
```

- `develop` is the integration branch for ordinary pull requests.
- `main` is the default and production branch.
- Only a pull request whose head branch is `develop` may promote into `main`.
- Both long-lived branches use squash merge and reject direct or force pushes.

## Stable pull-request checks

The versioned workflows expose these stable checks for pull requests targeting `develop` or `main`:

- `Promotion Source`;
- `Code Quality & Commits`;
- `Unit Tests (Vitest)`;
- `Build & Bundle Analysis`;
- `Playwright Chromium Smoke`;
- `Analyze Security`.

`PR Summary Report` and `Deploy to Vercel Preview` are informative and should not be required. The summary is derivative, while preview deployment depends on Vercel credentials and service availability.

Do not configure `Deploy to Vercel Production` as a required pull-request check. It is a post-merge workflow triggered only after `Main Quality` succeeds for the integrated `main` SHA.

## Ruleset for develop

Use branch target `develop` and configure:

- require a pull request before merge;
- require the branch to be up to date before merge;
- require conversation resolution;
- require these checks:
    - `Promotion Source`;
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

The `Promotion Source` job passes for ordinary pull requests into `develop` and keeps one stable policy check across both branch lifecycles.

## Ruleset for main

Use branch target `main` and configure:

- require a pull request before merge;
- require the branch to be up to date before merge;
- require conversation resolution;
- require these checks:
    - `Promotion Source`;
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

`Promotion Source` is the executable source-branch policy. It fails when a pull request targets `main` from any head other than `develop`.

## Environment protection

### Preview

The `Preview` environment is used by pull requests targeting `develop` or `main`.

Recommended configuration:

- allow deployments from pull-request refs;
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
- merge commits disabled;
- rebase merge disabled;
- automatic deletion of merged short-lived branches enabled;
- auto-merge enabled only when the maintainer intentionally uses it;
- `main` remains the default branch.

## Verification checklist

- [ ] `develop` accepts ordinary pull requests and rejects direct/force pushes.
- [ ] `main` accepts promotion pull requests and rejects direct/force pushes.
- [ ] A test pull request into `main` from a non-`develop` branch fails `Promotion Source`.
- [ ] Pull requests into both bases report all six required checks.
- [ ] Check names in rulesets exactly match the workflow job names above.
- [ ] Preview runs for pull requests into `develop` and `main` when credentials are available.
- [ ] Preview and PR summary remain informative rather than required.
- [ ] `Main Quality` runs only after integration into `main` or manual dispatch.
- [ ] Production deploys only the exact successful `Main Quality` SHA from `main`, except documented manual/resume dispatches.
- [ ] Production deployment is not configured as a pre-merge requirement.

Treat unchecked hosted settings as **Unconfirmed** and unavailable automation as **Blocked**, not passed.
