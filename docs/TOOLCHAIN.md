# Toolchain and dependency policy

## Runtime

- Bun is pinned through the `packageManager` field in `package.json`.
- The Dev Container, test container and GitHub workflow setup must use the same Bun version.
- `bun.lock` is committed and automated environments install dependencies with `bun install --frozen-lockfile`.
- Compatibility-sensitive browser tooling uses exact versions. The Playwright package, development image and test image must remain aligned.
- `bun run check:devcontainer` enforces the versioned development-environment contract.

`package.json` and `bun.lock` are the exact version sources. Active documentation records behavior and alignment rules rather than duplicating every dependency patch version.

See [DEVCONTAINER.md](DEVCONTAINER.md) for setup, rebuild and validation commands.

## Astro framework contract

The application currently targets Astro 7 with compatible official integrations and Vite 8.

The implemented framework-specific decisions are:

- built-in English-default and `/es` i18n routing;
- `Astro.currentLocale` and `astro:i18n` for locale detection and ordinary URL generation;
- default Markdown/MDX processing because no remark, rehype or recma plugins are configured;
- `compressHTML: true` to preserve the currently tested whitespace behavior;
- experimental SVG optimization while the repository configuration and tests require it;
- no custom `src/fetch.ts` request pipeline because the site uses static output.

A future Astro major upgrade must review the official migration guides, regenerate `bun.lock`, run the complete applicable quality suite and update only repository-specific operational contracts.

## Dependency classification

Packages required by the generated application remain in `dependencies`. Build, formatting, type-checking, testing and repository-maintenance tools belong in `devDependencies`.

Use compatible version ranges for routine dependencies and exact versions for compatibility-sensitive packages. Dependency updates must include the regenerated lockfile and pass the strongest available relevant validation.

## Automation availability

Workflow definitions use the repository setup action and frozen dependency installation. Their configured versions must match the repository and containers.

A disabled, missing or quota-blocked workflow run is not version evidence or a successful check. Local output must identify the actual Bun, Astro and Playwright versions used. See [CI.md](CI.md).

## Branch and release relationship

- `develop` is the integration branch for ordinary dependency and toolchain updates.
- `main` is the production branch and receives a focused promotion from `develop`.
- The canonical package identifier is `portfolio-v1`.
- The package is private and is not published to npm.
- Production delivery is tied to the current `main` deployment contract, not package publication.
- Stable `vX.Y.Z` tags and GitHub Releases are produced by Release Please on `main`; see the "Release policy" section of [DELIVERY.md](DELIVERY.md).

## Coordinated updates

A Bun, Playwright, Dev Container Feature or other compatibility-sensitive upgrade must update all applicable owners together:

1. `package.json` and `bun.lock`;
2. `.github/actions/setup-bun/action.yml` and affected workflows;
3. `.devcontainer` image arguments, Features and lockfile;
4. `Dockerfile.test` and visual baselines when browser rendering changes;
5. executable version checks;
6. this document and [DEVCONTAINER.md](DEVCONTAINER.md) when the operating contract changes.
