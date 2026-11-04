# Delivery

## Branch model

```text
short-lived branch -> main (dev environment) -> release tag -> production
```

- `main` is the default and only long-lived development branch.
- `resume-assets` is the isolated handoff for validated public CV files.

Ordinary changes start from current `main`, target `main` and use a focused Conventional Commit pull-request title. Do not push directly to `main`.

## Pull requests into main

The stable required checks are:

- `Code Quality & Unit Tests`;
- `Build & Bundle Analysis`;
- `Playwright Chromium Smoke`;
- `Analyze Security`;
- `Main Build & Unit Quality`;
- `Main Chromium Suite`;
- `Main Lighthouse`.

Preview deployment and before/after visual evidence are informative because they depend on hosted services or change-specific review needs.

Single-purpose pull requests into `main` use squash merge. Delete their short-lived source branch explicitly after merge. Release Please pull requests may use squash or merge commits.

## Preview and development environment

Vercel native Git integration handles preview and development deployments directly on push, without consuming GitHub Actions runner minutes.

- Pull requests targeting `main` generate Vercel Preview deployments with automated deployment status checks and preview comments.
- Pushes to `main` automatically deploy to the preview/development environment and assign to `https://dev.sandovaldavid.com`.
- The build command in `vercel.json` (`bash scripts/install-resume-assets.sh && bun run build`) automatically installs and validates canonical resume assets from the `resume-assets` branch before building the static output.

Repository configuration and `vercel.json` are implemented configuration. Current rulesets, required checks, secrets, quotas and environment protections remain external settings until verified in GitHub.

## Resume assets

The private `sandovaldavid/resume` repository owns editable resume content and PDF generation. This repository delivers only the validated public payload from `resume-assets`:

```text
public/resume/
├── david-sandoval-resume.pdf
├── david-sandoval-resume-es.pdf
└── manifest.json
```

The manifest identifies the authoritative source commit. Private source files and intermediate build output must never be copied into this public repository.

Validate or install a checked-out payload with:

```bash
node scripts/validate-resume-assets.mjs .resume-assets/public/resume
bash scripts/install-resume-assets.sh
```

Build, main-quality and Vercel deployment commands must use the same branch, filenames, manifest and installer. Recovery must preserve all three files as one provenance-matched payload; do not synthesize a source commit or bypass PDF validation.

## Releases and production deployment

Production deployment is driven exclusively by GitHub Releases.

Release Please runs from pushes to `main`. It opens or updates a reviewed release pull request, maintains `CHANGELOG.md` and creates plain stable `vX.Y.Z` tags after merge.

When a release is published (`on: release: types: [published]`), GitHub Actions triggers the `Deploy Production` workflow (`.github/workflows/deploy-production.yml`), which builds the static production output with canonical resume assets and deploys it to Vercel Production (`https://www.sandovaldavid.com` and `https://sandovaldavid.com`).

Do not hand-edit generated release state or create ad hoc beta tags. A stale, conflicted or non-mergeable release pull request is blocked until refreshed or regenerated against current `main` and validated on its exact head.

## Rollback

To revert an unreleased change, merge a revert pull request into `main`.

To rollback production, redeploy a previous stable release tag via workflow dispatch in GitHub Actions, or merge a revert into `main` and publish a patch release. Do not rewrite shared history.

## Evidence

Before merge or release, record the exact commit, commands and hosted results. Missing, cancelled, skipped or quota-blocked automation is not successful validation.
