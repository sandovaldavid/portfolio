# Branch, release and deployment policy

## Branch roles

The current repository model is:

- `develop`: integration branch and base for ordinary feature, fix, documentation and maintenance work;
- `main`: default and production branch;
- `resume-assets`: canonical English and Spanish CV artifacts consumed by deployment workflows.

```text
short-lived branch -> develop -> main -> production
```

This model is **Implemented** by the active branch history and pull-request workflow. The previous main-only trunk policy is **Discarded** for current work.

The `resume-assets` payload, provenance rules, validation command and non-destructive recovery procedure are defined in [RESUME-DELIVERY.md](RESUME-DELIVERY.md).

## Ordinary development

1. Update `develop`.
2. Create a short-lived `feat/`, `fix/`, `docs/`, `refactor/`, `perf/`, `test/`, `chore/`, `ci/`, `deps/`, `security/` or `agent/` branch from it.
3. Open the pull request into `develop`.
4. Keep one coherent concern per pull request.
5. Run the canonical local gate and every change-specific validation.
6. Require the configured pull-request quality and security checks when GitHub Actions are available.
7. Use a Conventional Commit pull-request title and squash merge after review and explicit authorization.
8. Delete the short-lived source branch after merge.

Do not push directly to `develop` or `main`.

## Promotion to main

Promotion is a focused pull request from `develop` to `main`. Its purpose is to release the integrated state rather than mix additional implementation work into the promotion diff.

Before promotion:

- confirm that `develop` contains the intended integrated commits;
- review open issues and pull requests for blockers;
- run the strongest available local validation on the promoted head;
- confirm that documentation and `docs/STATUS.md` describe the promoted state;
- record any unavailable GitHub automation as **Blocked**, never as passed.

Ordinary promotions originate from `develop`, but pull requests into `main` are not restricted to that source branch: a hotfix may go directly to `main` when the situation warrants it, and Release Please's own release pull requests (see "Release policy" below) never originate from `develop` either. Required status checks (`Code Quality & Commits`, `Unit Tests (Vitest)`, `Build & Bundle Analysis`) gate every merge into `main` regardless of source branch.

## Preview deployments

`Deploy to Vercel Preview` is configured for pull requests targeting `develop` and `main`.

The workflow:

1. checks out the exact pull-request head SHA;
2. checks out canonical files from `resume-assets`;
3. validates provenance, filenames, PDF structure and the isolated asset directory before and after installation;
4. installs the pinned repository toolchain;
5. pulls the Vercel preview environment;
6. builds and deploys without production flags;
7. updates one stable pull-request comment with the preview URL and source SHA.

Preview deployment is informative rather than a required branch check because it depends on hosted credentials and Vercel availability. Its absence, cancellation or failure must not be represented as successful evidence.

## Production deployments

`main` is the only production source.

The normal production path starts after `Main Quality` completes successfully for a push to `main`. The deployment workflow checks out and verifies the exact validated SHA before building and deploying with the Vercel production environment.

Two explicit dispatch paths rebuild the current `main` tip:

- `resume-assets-updated`, which refreshes canonical CV files from `resume-assets`;
- a maintainer-initiated `workflow_dispatch` recovery deployment.

The workflow verifies both canonical resume URLs after deployment.

`Deploy to Vercel Production` is a post-merge control and must not be configured as a required pre-merge status check on `main`.

Workflow definitions are **Implemented**. Their current enablement, quota, secrets and environment protection are **Unconfirmed** until inspected in GitHub. An unavailable run is **Blocked**, not a successful production gate.

## Release policy

This repository is a private package and a public website, not a published npm library.

- Production deployment is independent from GitHub Releases.
- `main` is the single source of truth for releases. [Release Please](https://github.com/googleapis/release-please) (`.github/workflows/release-please.yml`) runs only on pushes to `main`; it does not run on `develop`, which avoids conflicting release state when `develop` is promoted.
- Release Please opens or updates a release pull request against `main` derived from Conventional Commit history since the last release. Merging that pull request — squash merge, like every other pull request into `main` — is what cuts the Git tag and the GitHub Release. This is not a bypass of review.
- Tags and releases use plain stable semantic versions, e.g. `v1.0.0`, `v2.0.0` (`include-component-in-tag: false` in `release-please-config.json`). Do not hand-create ad hoc beta or `porfolio-dev-*`-style tags.
- `CHANGELOG.md` is generated and maintained by Release Please from Conventional Commit history. Do not hand-edit it.
- Promotions from `develop` to `main` are squash-merged, so Release Please reads only the promotion pull request's title (its Conventional Commit type) and any `BREAKING CHANGE:` footer added to the squash-commit body — it does not replay the individual commits that lived on `develop`. Whoever authors a promotion pull request must choose an accurate type and add a `BREAKING CHANGE:` footer to the merge commit body whenever the promoted change should trigger a major version.
- `v1.0.0` (commit `72d8c852a8a518922e705409f4785484e999d53e`) is the release baseline as of 2026-07-29. The previous `porfolio-dev-*` and `vX.Y.Z-beta.0` tags/releases (2026-06-21 through 2026-07-05) were deleted: they were pre-release artifacts of a discontinued dual-branch (`main` + `develop`) Release Please setup and are **Discarded**, not preserved historical evidence.

## Repository settings contract

Verify these GitHub-hosted settings before relying on them:

1. `main` remains the default and production branch;
2. ordinary work is based on and merged into `develop`;
3. `develop` requires pull requests, current branches and the documented quality/security checks;
4. `main` requires a promotion pull request whose source is `develop` and the documented quality/security checks;
5. required check names match [CI.md](CI.md);
6. preview deployment is informative rather than required;
7. squash merge is the permitted integration method;
8. merged short-lived branches are deleted automatically;
9. direct pushes, force pushes and deletion of long-lived branches are blocked;
10. the Production environment accepts only `main` deployments.

These settings are **Unconfirmed** until inspected because they live outside the versioned tree. Record intentional deviations in this document and synchronize durable rationale to Cortex-L7.

## Rollback

For a faulty integration in `develop`, revert the squash commit through a pull request into `develop`.

For a faulty production promotion, revert the relevant squash or promotion commit through a pull request into `main`, then reconcile `develop` so both long-lived branches retain a consistent history. Do not rewrite shared branch history.
