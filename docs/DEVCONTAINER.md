# Development container

The repository Dev Container is the recommended environment for implementation, repository checks, Astro development and Playwright work. It keeps the project toolchain aligned with CI, uses the host Docker daemon for nested Docker validation and applies the portable shell contract maintained in `sandovaldavid/dotfiles`.

## Guarantees

The versioned configuration owns these guarantees:

- Ubuntu 24.04 through the official Playwright Noble image;
- Bun `1.3.14`, matching `packageManager`;
- Playwright `1.61.1`, matching the exact `@playwright/test` dependency;
- browsers supplied by the Playwright image through `/ms-playwright`;
- a normalized `pwuser` UID/GID of `1000:1000` before Dev Containers applies host-specific remapping;
- the same non-root `pwuser` identity for the default process, VS Code, terminals, tasks and lifecycle commands;
- a Docker init process as PID 1 and host IPC for direct Chromium execution;
- frozen dependency installation from `bun.lock`;
- a writable, versioned Bun home at `/home/pwuser/.bun`;
- a container-owned named volume for `node_modules`;
- a project-specific named volume for private Zsh command history;
- exact, digest-locked Dev Container Features;
- GitHub CLI, Docker CLI, Docker Compose and access to the host Docker daemon;
- Starship `1.26.0` with the portable personalized prompt from `dotfiles`;
- eza `0.23.5` and pinned Zsh completions, autosuggestions, syntax highlighting and history substring search;
- Git SSH signing through the forwarded host agent without copying private keys;
- recovery of inherited Bun, dependency-volume, command-history, Git and generated-path ownership;
- repair during create, container start and VS Code attach lifecycle events;
- explicit propagation of the real host workspace path to nested test containers;
- deterministic VS Code forwarding of Astro port `4321` and Playwright report port `9323` to the same local ports;
- documented Fedora SELinux compatibility for the trusted local development container.

`bun run check:devcontainer` rejects version, Feature, lockfile, shell, user, init, IPC, port-forwarding, mount, lifecycle, identity, repair-policy or configuration drift. The command also runs as part of `bun run check`.

## Intentional project-specific choices

This repository does not copy the generic Astro template literally:

- `mcr.microsoft.com/playwright` remains the base image because the repository executes Playwright directly inside the development container and requires browser binaries compatible with the exact project client.
- `pwuser` remains the non-root identity supplied by that image. The Dockerfile normalizes it before Dev Containers applies host-specific remapping and ends with `USER pwuser`.
- `/workspaces/portfolio-v1` remains the canonical workspace because the Dev Container, validation workflow and repository scripts share that contract.
- `waitFor` remains `postStartCommand`. A first creation still completes `postCreateCommand`; later starts block VS Code attachment until writable state and Git signing have been refreshed.
- the named `node_modules` volume isolates Linux dependencies from the host and from the nested pinned Playwright container.
- Zsh is the default interactive shell. Bash remains configured as a supported fallback.
- the host Docker daemon is reused rather than starting a second daemon inside the development container.
- Astro and the Playwright report use VS Code forwarding rather than Docker port publications, so standard loopback-bound development servers remain accessible without exposing container interfaces.

## Exact Features

The Dev Container and `.devcontainer/devcontainer-lock.json` use:

```text
ghcr.io/devcontainers/features/common-utils:2.5.9
ghcr.io/devcontainers/features/docker-outside-of-docker:1.10.0
ghcr.io/devcontainers/features/github-cli:1.1.0
```

The lockfile records the reviewed OCI digests. Whenever a Feature reference or option changes, regenerate and review the lockfile with the Dev Container CLI before merging.

`common-utils` installs Zsh, configures it as the default shell for `pwuser`, disables Oh My Zsh and does not perform floating operating-system upgrades.

## Personalized shell contract

The lifecycle installs checksum-verified releases under the remote user's home:

| Component                    |  Version |
| ---------------------------- | -------: |
| Starship                     | `1.26.0` |
| eza                          | `0.23.5` |
| zsh-autosuggestions          |  `0.7.1` |
| zsh-syntax-highlighting      |  `0.8.0` |
| zsh-completions              | `0.36.0` |
| zsh-history-substring-search |  `1.1.0` |

The files below are synchronized from the portable Dev Container templates in `dotfiles`:

```text
.devcontainer/config/starship.toml
.devcontainer/config/shell.zsh
.devcontainer/config/shell.bash
.devcontainer/config/gitconfig-atena
.devcontainer/scripts/configure-shell.sh
.devcontainer/scripts/configure-git-ssh-signing.sh
```

Zsh provides:

- history-based autosuggestions;
- syntax highlighting;
- completion menus;
- substring history search with Up/Down and `Ctrl-P`/`Ctrl-N`;
- `HISTSIZE=50000` and `SAVEHIST=50000`;
- duplicate reduction and immediate sharing between project terminals;
- `HIST_IGNORE_SPACE`, so a command prefixed with one space is not persisted.

The following aliases use eza when available:

```text
ls        icon-aware listing; native flags such as `ls -a` are appended
l         compact listing
la        hidden entries
ll        long listing with Git status and ISO timestamps
tree      recursive tree
tree2     tree limited to depth 2
tree3     tree limited to depth 3
tree-d    directories only
lsd       directories only
lsf       files only
ls-native native Coreutils ls escape hatch
```

Icons require a Nerd Font in the host terminal.

## Persistent command history

Each checkout mounts:

```text
source=devcontainer-${localWorkspaceFolderBasename}-zsh-history
target=/commandhistory
```

Zsh stores history in `/commandhistory/.zsh_history`. The lifecycle creates the directory with mode `0700` and the file with mode `0600`, repairs stale ownership and rejects symbolic-link redirection.

The volume survives container rebuilds but is scoped by the local workspace directory name. Command history may contain internal paths, hostnames or accidentally pasted secrets. Prefix sensitive commands with one space, and remove the named history volume if sensitive material was stored without that prefix.

## Git identity and SSH signing

VS Code can inherit the host Git configuration and SSH agent. The lifecycle:

1. installs the bundled conditional Atena identity when the host configuration references it;
2. resolves the effective repository email and inline SSH public signing key;
3. verifies that the exact public key is loaded in the forwarded agent;
4. writes `$HOME/.config/git/allowed_signers` with mode `0600`.

No private key is copied into the repository, image or container filesystem. Missing identity or agent keys produce warnings and do not block dependency installation.

## Workspace and dependencies

The repository source is bind-mounted at `/workspaces/portfolio-v1`. The host checkout remains the source of truth for code, documentation and Git state.

On native Linux, the bind mount preserves numeric host ownership. Dev Containers may remap `pwuser` during creation. The startup lifecycle refuses to recursively change repository ownership when the running UID and workspace owner do not match.

`node_modules` is overlaid with the named volume `${localWorkspaceFolderBasename}-devcontainer-node_modules`. The lifecycle stores `.devcontainer-volume-state` inside it. When the marker identifies another schema or UID/GID, the complete disposable volume is repaired once; later starts repair mutable tool paths and verify write access.

Bun is installed under `/home/pwuser/.bun`. A separate owner marker controls safe repair of Bun's cache and prevents recursive changes outside the managed home.

## Open or rebuild

Prerequisites:

1. Docker Engine or Docker Desktop;
2. Visual Studio Code;
3. the Dev Containers extension.

Run **Dev Containers: Reopen in Container**.

After changing image arguments, Features, the lockfile, mounts, users, lifecycle commands, `containerEnv`, `forwardPorts`, `portsAttributes`, `init` or `runArgs`, use **Dev Containers: Rebuild Container Without Cache**. Reopening an existing container does not reliably replace creation-time settings from a previously created container.

The post-create lifecycle executes:

```bash
bash .devcontainer/scripts/post-start.sh
bash .devcontainer/scripts/configure-shell.sh
bash .devcontainer/scripts/configure-git-ssh-signing.sh
bun install --frozen-lockfile
bun run check:devcontainer
docker --version
docker compose version
```

A stopped host Docker daemon produces a warning; start Docker before Docker-backed tests.

## Host port forwarding

The Dev Container asks VS Code to forward:

```json
"forwardPorts": [4321, 9323]
```

Both ports use `requireLocalPort: true`, so VS Code must preserve the expected local URLs instead of silently selecting different host ports. Astro opens once automatically when detected; the Playwright report produces a notification when its server starts.

| Service                | Container port | Forwarded host URL      |
| ---------------------- | -------------: | ----------------------- |
| Astro development      |           4321 | `http://localhost:4321` |
| Playwright HTML report |           9323 | `http://localhost:9323` |

The forwarding tunnel presents requests to each application as local container traffic. Astro therefore uses its standard development command and does not need to listen on every container interface:

```bash
bun run dev
```

Generate a Playwright report and serve it on container loopback:

```bash
bun run test:e2e:smoke
bun run test:e2e:report
```

`test:e2e:report` runs the project-local Playwright binary with `--host 127.0.0.1 --port 9323`. It blocks the terminal until stopped with `Ctrl+C`.

If either local port is already allocated, VS Code reports the conflict instead of remapping it. Identify the owner from a host terminal, stop the conflicting process and reload or rebuild the Dev Container:

```bash
ss -ltnp '( sport = :4321 or sport = :9323 )'
```

## Validate a configuration update

Inside a newly rebuilt container run:

```bash
test "$(id -u)" = "$(stat -c '%u' /workspaces/portfolio-v1)"
test "$TERM" = "xterm-256color"
test "$ZSH_HISTORY_FILE" = "/commandhistory/.zsh_history"
test "$(stat -c '%a' "$ZSH_HISTORY_FILE")" = "600"

bun --version
bunx playwright --version
"$HOME/.local/bin/eza" --version
zsh -ic 'starship --version'
zsh -ic 'alias ls'
zsh -ic 'zle -l | grep history-substring-search-up'

cat "$BUN_INSTALL/.devcontainer-owner-state"
cat node_modules/.devcontainer-volume-state
bun install --frozen-lockfile
bun run check
bun run test:unit:ci
bun run build
bun run test:e2e:smoke
VERIFY_DOCKER_WORKSPACE_ONLY=true bash docker-test.sh
git status --short
```

With Astro and the Playwright report servers running in separate container terminals, validate from the host:

```bash
curl --fail --head http://localhost:4321/
curl --fail --head http://localhost:9323/
```

Expected core versions:

```text
Bun 1.3.14
Playwright 1.61.1
Starship 1.26.0
eza 0.23.5
```

The final Git status must not contain generated output or local-only assistant configuration staged for commit.

## Recover a stale dependency volume

A normal rebuild preserves `node_modules`. Typical stale-volume symptoms are Bun `EEXIST` link failures or `EACCES` under Vite cache directories.

Run inside an identity-aligned Dev Container:

```bash
bash .devcontainer/scripts/post-start.sh
cat "$BUN_INSTALL/.devcontainer-owner-state"
cat node_modules/.devcontainer-volume-state
bun install --frozen-lockfile
```

If the disposable dependency volume remains corrupted, close the container and remove only that volume from the host:

```bash
docker volume rm portfolio-v1-devcontainer-node_modules
```

Then rebuild. Do not delete the repository or recursively change ownership of tracked source.

## Recover a stale container identity

A log containing `--skip-post-create` describes a restart, not a rebuild. When the startup lifecycle reports an identity mismatch, remove the stale container and run **Dev Containers: Rebuild Container Without Cache**.

Inspect from the host first:

```bash
id
stat -c 'workspace=%u:%g %n' .
docker inspect --format '{{.Config.User}}' <container-id>
```

Only restore ownership for known generated paths that were previously written by another container. Never run recursive `chown` over the complete repository.

## Daily development

```bash
bun run dev
bun run check
bun run test:unit:ci
bun run build
bun run test:e2e:smoke
bun run test:e2e:report
bun run test:e2e:desktop
bun run test:e2e:extended
```

Astro is available at `http://localhost:4321`. After a Playwright run creates `playwright-report`, `bun run test:e2e:report` serves it at `http://localhost:9323`.

## Visual testing

A native visual run executes directly in the Dev Container:

```bash
RUN_VISUAL_TESTS=true bun run test:e2e:visual
```

The merge-grade visual command remains the nested pinned container:

```bash
bun run test:e2e:visual:docker
```

The outer Dev Container exports the real host checkout as `HOST_WORKSPACE_FOLDER`. Docker Compose mounts that host path into the nested Playwright container and verifies `package.json` and `bun.lock` before running tests.

## SELinux and security boundary

The repository includes:

```json
"runArgs": ["--ipc=host", "--security-opt", "label=disable"]
```

`--ipc=host` is required for direct Chromium work. `label=disable` avoids Fedora SELinux denials on the direct workspace bind mount, including lifecycle `Permission denied` failures. It also disables SELinux label confinement for this development container.

Use this configuration only with trusted repository code. It is not a production runtime definition. A stricter environment should replace the direct bind mount with a Compose mount using explicit SELinux relabeling and remove `label=disable` after host validation.

Development servers stay bound to container loopback. VS Code exposes only the requested forwarded ports to the local development machine, and `requireLocalPort` prevents unexpected URL remapping.

`docker-outside-of-docker` exposes the host Docker daemon to the development user. Processes with access to that socket effectively have host-level container control. Do not run untrusted code inside this environment.

## Coordinated version updates

A Playwright, Bun, Feature or shell-tool upgrade is one coordinated change. Update all applicable owners together:

1. `package.json` and `bun.lock`;
2. `.devcontainer/Dockerfile` build arguments;
3. `.devcontainer/devcontainer.json` build arguments, Feature references and port forwarding;
4. `.devcontainer/devcontainer-lock.json`;
5. shell installer versions and checksums;
6. Docker test images and reviewed visual baselines;
7. `scripts/check-devcontainer.mjs`, `scripts/check-devcontainer-port.mjs` and the Dev Container workflow assertions;
8. this document.

Playwright image and package versions must match. A mismatch can prevent the installed client from locating the image's browser executables.
