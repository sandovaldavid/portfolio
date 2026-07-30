# GitHub Actions & Vercel Setup Checklist

## ✅ Completed Automatically

- [x] **GitHub Actions Workflows** created and pushed
    - `validate-pr.yml` - Validates all PRs
    - `deploy-preview.yml` - Deploys to Vercel Preview
    - `deploy-production.yml` - Deploys to Vercel Production

- [x] **GitHub Secrets Added**
    - `VERCEL_PROJECT_ID` = `prj_O25Gj9BqKwaSH5h8rAqJpJpk4Vj5`
    - `VERCEL_ORG_ID` = `team_Kni208cT03lJVCIgxVKQcVGt`

- [x] **Vercel Project Linked**
    - Organization: `devsolution`
    - Project: `portfolio`
    - Configuration file: `.vercel/project.json`

- [x] **Code Quality Tools Configured**
    - ESLint (0 errors, 1 warning)
    - Prettier (37 files formatted)
    - Husky (git hooks ready)
    - commitlint (conventional commits validation)

---

## ✅ Manual Steps Completed

### VERCEL_TOKEN Configuration

- [x] Create Vercel personal access token
- [x] Configure token in repository secrets (`VERCEL_TOKEN`)

### Branch Protection Rules

- [x] Configured Rulesets for `main` and `develop` branches using the GitHub API (via gh CLI).
    - `main`: Requires PR with 1 review, stale review dismissal, Code Owners approval, conversation resolution, and successful deployments to `Production`. Strict status checks (`validate` and `deploy`) are enforced.
    - `develop`: Requires PR (0 approvals), stale review dismissal, and strict status checks (`validate` and `deploy`) to pass before merging.

---

## 🧪 Test the Setup

Now that the configuration is complete, here is how to test the workflows:

1. **Create a test branch:**

    ```bash
    git checkout -b test/workflow-validation
    ```

2. **Make a small change:**

    ```bash
    echo "# Test" >> test.txt
    ```

3. **Commit with valid message:**

    ```bash
    git add test.txt
    git commit -m "test: validate ci/cd workflow"
    ```

4. **Push and create PR to develop:**

    ```bash
    git push origin test/workflow-validation
    ```

5. **Watch GitHub Actions run:**
    - Go to: https://github.com/sandovaldavid/portfolio/actions
    - You should see: `Validate PR` workflow running
    - ESLint, Prettier check, and build should all pass
    - Preview deployment should start automatically

6. **Merge to main (when ready):**
    - Create PR from `develop` to `main`
    - Verify all checks pass
    - Merge to trigger production deployment

---

## 📋 Summary

| Component             | Status        | Details                                        |
| --------------------- | ------------- | ---------------------------------------------- |
| **Vercel Project**    | ✅ Linked     | Project ID: `prj_O25Gj9BqKwaSH5h8rAqJpJpk4Vj5` |
| **Vercel Org**        | ✅ Linked     | Org ID: `team_Kni208cT03lJVCIgxVKQcVGt`        |
| **Vercel Token**      | ✅ Configured | Secret added (`VERCEL_TOKEN`)                  |
| **GitHub Secrets**    | ✅ Configured | 3/3 secrets added                              |
| **GitHub Actions**    | ✅ Ready      | 3 workflows deployed                           |
| **Branch Protection** | ✅ Configured | Active rulesets via gh CLI (Pro)               |
| **Code Quality**      | ✅ Ready      | Linter, formatter, type check configured       |

---

## 🚀 Once Everything is Setup

Your CI/CD pipeline will work as follows:

```
Feature Branch (feat/xyz)
    ↓ Create PR to develop

GitHub Actions Runs:
├─ ✅ ESLint
├─ ✅ Prettier format check
├─ ✅ Type check (astro check)
├─ ✅ Build
└─ 🚀 Deploy preview to Vercel

Code Review & Merge to develop
    ↓
Develop auto-deploys preview
    ↓
When ready, create PR develop → main

GitHub Actions Runs:
├─ ✅ All checks again
├─ 🚀 Deploy production to Vercel
└─ 📧 Slack notification (optional)

Production live at: sandovaldavid.com
```

---

## 🆘 Troubleshooting

### "VERCEL_TOKEN secret not found"

- Add the secret: `gh secret set VERCEL_TOKEN`
- Verify: `gh secret list | grep VERCEL`

### "Preview deployment not showing in PR"

- Check GitHub Actions logs: Actions tab
- Verify VERCEL_TOKEN is set correctly
- Check Vercel dashboard for deployment status

### "Build fails in CI but works locally"

- Run locally: `bun run build`
- Run linter: `bun run lint`
- Run formatter: `bun run format`
- Fix any issues and commit

### "Branch protection rules don't work"

- Repository must be **private** with **GitHub Pro**
- OR set up manually via Settings → Branches

---

## 📖 Additional Resources

- GitHub Actions docs: https://docs.github.com/en/actions
- Vercel deployment: https://vercel.com/docs
- Conventional Commits: https://www.conventionalcommits.org/
- Project docs: `.github/DEPLOYMENT.md` and `.github/BRANCH_PROTECTION.md`
