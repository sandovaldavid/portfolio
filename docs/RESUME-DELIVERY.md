# Canonical resume asset delivery

## Ownership and trust boundary

The private `sandovaldavid/resume` repository owns the editable resume data, PDF build and stable-publication authorization. This public portfolio repository owns only delivery of the validated output.

The long-lived `resume-assets` branch is the isolated handoff boundary. Its `public/resume/` directory must contain exactly:

```text
public/resume/
├── david-sandoval-resume.pdf
├── david-sandoval-resume-es.pdf
└── manifest.json
```

No private YAML, LaTeX source, credentials or intermediate build files may be copied into this repository.

## Provenance contract

`manifest.json` must identify the authoritative source and the exact stable commit:

```json
{
  "sourceRepository": "sandovaldavid/resume",
  "sourceCommit": "<40-character lowercase Git SHA>",
  "files": {
    "en": "david-sandoval-resume.pdf",
    "es": "david-sandoval-resume-es.pdf"
  }
}
```

The asset validator also requires both PDFs to:

- be regular files rather than symbolic links;
- start with `%PDF-`;
- exceed 10 KB;
- contain `%%EOF` near the end;
- use the canonical English and Spanish filenames.

It reports each file's byte count and SHA-256 digest for review evidence.

## Normal publication flow

1. Resume changes are integrated into `sandovaldavid/resume@develop`.
2. A focused promotion pull request updates `sandovaldavid/resume@main`.
3. Successful CI for the exact current `main` commit authorizes the private stable publisher.
4. The publisher builds and validates both PDFs.
5. Only the PDFs and manifest are committed to `portfolio-v1@resume-assets`.
6. The publisher sends `resume-assets-updated` to this repository.
7. The portfolio production workflow checks out `main`, overlays the validated asset payload and deploys it.
8. Production verifies the canonical URLs, PDF headers and signatures.

The resume repository's `config/resume-delivery.json` and publication workflow own source filenames, destination filenames and the asset branch name. Do not duplicate or override that configuration in a second publisher.

## Local validation

Validate a checked-out asset payload without modifying the workspace:

```bash
node scripts/validate-resume-assets.mjs .resume-assets/public/resume
```

Exercise the exact workflow installation path with disposable directories:

```bash
rm -rf /tmp/portfolio-resume-source /tmp/portfolio-resume-target
git worktree add --detach /tmp/portfolio-resume-source resume-assets
bash scripts/install-resume-assets.sh \
  /tmp/portfolio-resume-source/public/resume \
  /tmp/portfolio-resume-target
```

The installer validates before and after copying. Missing, malformed, undersized, incomplete, incorrectly named or unprovenanced assets fail before a Vercel command runs.

## Recovery procedure

Use recovery only when the normal authorized publisher cannot repopulate the branch.

1. Prefer a new authorized publication from the exact current `sandovaldavid/resume@main` commit.
2. When that is unavailable, identify a last-known-good deployed payload produced by the authorized publisher. Recover all three files together; never combine PDFs and a manifest from different deployments.
3. Verify the manifest source repository and stable source commit against the private resume history.
4. Run `validate-resume-assets.mjs` and record both SHA-256 digests and byte counts.
5. Create a disposable candidate branch from the current `resume-assets` tip.
6. Replace only `public/resume/` on the candidate branch. Do not force-push or rewrite the shared branch.
7. Open a pull request into `resume-assets` so the binary payload, manifest and provenance can be reviewed before merge.
8. After merge, run the installer from a clean checkout and rerun a Vercel Preview. The `Install canonical resume assets` step must pass.
9. Confirm `Main Quality` and `Deploy to Vercel Production` still consume the same branch, path and installer.
10. Restore the normal resume publisher before the next content update; recovery is not a parallel publication path.

Do not synthesize resume content, invent a `sourceCommit`, make required files optional or bypass PDF validation to unblock deployment.

## Workflow consumers

The following workflows intentionally use the same contract:

- `Deploy to Vercel Preview` for pull requests into `develop` or `main`;
- `Main Quality` after integration into `main`;
- `Deploy to Vercel Production` after successful main quality or an explicit recovery/resume dispatch.

All three check out `resume-assets/public/resume` and execute `scripts/install-resume-assets.sh`. A change to the branch, filenames, manifest or installer must update every consumer coherently and include regression coverage.
