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

The `Promotion Source` CI job rejects pull requests targeting `main` when the head branch is not exactly `develop`. Configure that stable job as a required check on `main`.

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
- Create a Git tag and GitHub Release manually only for a meaningful public milestone.
- Use stable semantic versions such as `v2.0.0` for those milestones.
- Do not create routine beta tags or automated release pull requests for ordinary portfolio updates.
- Keep `CHANGELOG.md` as public release history; pull requests and Git history remain the operational change record.
- Historical `porfolio-dev-*` and beta tags are immutable **Historical** evidence and are not renamed.

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
