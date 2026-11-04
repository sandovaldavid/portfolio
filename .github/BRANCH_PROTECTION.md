# Branch protection and ruleset contract

This document records the GitHub-hosted protection expected for `main` and release tags. Rulesets, required checks, Actions quota, repository secrets and environment protection are not stored in Git; verify them in repository settings before relying on them.

## Branch lifecycle

```text
short-lived branch -> main (dev environment) -> release tag -> production
```

- `main` is the default and only long-lived development branch.
- Ordinary changes come from short-lived branches into `main` via pull request.
- `main` uses squash merge for single-purpose pull requests (features, fixes, Dependabot), and allows merge commits for Release Please pull requests.
- Direct and force pushes to `main` are prohibited.

## Stable pull-request checks

The versioned workflows expose these stable checks for pull requests targeting `main`:

- `Code Quality & Unit Tests`;
- `Build & Bundle Analysis`;
- `Playwright Chromium Smoke`;
- `Analyze Security`;
- `Main Build & Unit Quality`;
- `Main Chromium Suite`;
- `Main Lighthouse`.

`PR Summary Report` and Vercel preview deployment checks are informative and should not be required. Preview deployments and status reporting are handled natively by Vercel.

Do not configure deployment status checks as blocking merge requirements. `Main Quality` and `Continuous Integration` gate the pull request before merge (see the `main` ruleset below). Production deployment runs via GitHub Actions upon release publication.

## Ruleset for main

Use branch target `main` and configure:

- require a pull request before merge;
- require these checks:
    - `Code Quality & Unit Tests`;
    - `Build & Bundle Analysis`;
    - `Main Build & Unit Quality`;
    - `Main Chromium Suite`;
    - `Main Lighthouse`;
- block direct pushes;
- block force pushes;
- block branch deletion;
- allow both squash and merge methods at repository level;
- optionally require one approval when an independent reviewer is available.

`main` accepts pull requests from feature branches, Dependabot, and Release Please release pull requests.

## Ruleset for release tags

Use tag target `refs/tags/v*` and configure:

- block tag deletion;
- block non-fast-forward tag updates.

## Environment protection

- `Preview / Dev`: Managed by Vercel for pull requests and pushes to `main` (assigned to `https://dev.sandovaldavid.com`).
- `Production`: Triggered by GitHub Actions on release publication (`deploy-production.yml`), deploying static assets and canonical resume payload directly to Vercel Production (`https://www.sandovaldavid.com` and `https://sandovaldavid.com`).
- Build and domain settings are configured in `vercel.json` and the Vercel project configuration.

## Repository merge settings

Verify:

- squash merge enabled;
- merge commits enabled (allowed for Release Please; feature PRs use squash);
- rebase merge disabled;
- auto-merge enabled only when the maintainer intentionally uses it;
- `main` remains the default branch.

## Verification checklist

- [ ] `main` accepts feature, Dependabot and Release Please pull requests and rejects direct/force pushes.
- [ ] Pull requests into `main` report the stable checks and `Main Quality` jobs.
- [ ] Check names in rulesets exactly match the workflow job names above.
- [ ] Release tags `v*` cannot be deleted or force-updated.
- [ ] Preview runs for pull requests into `main` when credentials are available, and pushes to `main` update `https://dev.sandovaldavid.com`.
- [ ] Preview and PR summary remain informative rather than required.
- [ ] Production deploys exclusively when a release is published.
- [ ] Production deployment is not configured as a pre-merge requirement.

Treat unchecked hosted settings as **Unconfirmed** and unavailable automation as **Blocked**, not passed.
