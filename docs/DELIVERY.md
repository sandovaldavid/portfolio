# Delivery

## Branch model

```text
short-lived branch -> develop -> main -> production
```

- `develop` is the integration base for ordinary work.
- `main` is the default and production branch.
- `resume-assets` is the isolated handoff for validated public CV files.

Ordinary changes start from current `develop`, target `develop` and use a focused Conventional Commit pull-request title. Do not push directly to either long-lived source branch.

## Pull requests into develop

The stable required checks are:

- `Code Quality & Commits`;
- `Unit Tests (Vitest)`;
- `Build & Bundle Analysis`;
- `Playwright Chromium Smoke`;
- `Analyze Security`.

Preview deployment and before/after visual evidence are informative because they depend on hosted services or change-specific review needs.

Single-purpose pull requests into `develop` use squash merge. Delete their short-lived source branch explicitly after merge.

## Promotion to main

Production promotion is a focused `develop` to `main` pull request. It must not contain unrelated implementation work.

Pull requests into `main` run the checks above plus:

- `Main Build & Unit Quality`;
- `Main Chromium Suite`;
- `Main Lighthouse`.

The promotion uses a real merge commit so the integrated commits remain ancestors of `main`. Squash remains appropriate for direct hotfixes, dependency updates and Release Please pull requests.

`main` may be numerically ahead because of promotion merge commits, hotfixes or releases. Compare ancestry and changed files before treating ahead/behind counts as drift.

## Preview and production

`Deploy to Vercel Preview` builds the exact pull-request head for changes targeting `develop` or `main` when credentials are available. It also runs after every push to `develop`, including a merged pull request, and assigns that deployment to `https://dev.sandovaldavid.com`.

`main` is the only normal production source. A push to `main` triggers the production workflow, which verifies the selected revision, installs the canonical resume assets and deploys through the Vercel production environment.

Workflow YAML is implemented configuration. Current rulesets, required checks, secrets, quotas and environment protections remain external settings until verified in GitHub.

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

Preview, main-quality and production workflows must use the same branch, filenames, manifest and installer. Recovery must preserve all three files as one provenance-matched payload; do not synthesize a source commit or bypass PDF validation.

## Releases

Production deployment is independent from GitHub Releases.

Release Please runs only from pushes to `main`. It opens or updates a reviewed release pull request, maintains `CHANGELOG.md` and creates plain stable `vX.Y.Z` tags after merge.

Do not hand-edit generated release state or create ad hoc beta tags. A stale, conflicted or non-mergeable release pull request is blocked until refreshed or regenerated against current `main` and validated on its exact head.

## Rollback

Revert a faulty integration through a pull request into the affected long-lived branch. After a production revert, reconcile `develop` when the main-only change must be reflected in future integration work. Do not rewrite shared history.

## Evidence

Before merge or promotion, record the exact commit, commands and hosted results. Missing, cancelled, skipped or quota-blocked automation is not successful validation.
