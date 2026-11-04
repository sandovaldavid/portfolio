#!/usr/bin/env bash
set -euo pipefail

REPOSITORY_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPOSITORY_ROOT"

bash .devcontainer/scripts/post-start.sh
bash .devcontainer/scripts/configure-shell.sh
bash .devcontainer/scripts/configure-git-ssh-signing.sh

dependency_directory="$REPOSITORY_ROOT/node_modules"

if ! awk -v target="$dependency_directory" '$5 == target { found = 1 } END { exit !found }' /proc/self/mountinfo; then
	echo "node_modules is not mounted as an isolated devcontainer volume: $dependency_directory" >&2
	echo "Rebuild the development container after updating main." >&2
	exit 1
fi

sudo chown "$(id -u):$(id -g)" "$dependency_directory"

expected_dependency_state="schema=1 uid=$(id -u) gid=$(id -g)"
actual_dependency_state="$(cat "$dependency_directory/.devcontainer-volume-state" 2>/dev/null || true)"

if [[ "$actual_dependency_state" != "$expected_dependency_state" ]]; then
	echo "The isolated node_modules volume was not prepared for $(id -u):$(id -g)." >&2
	exit 1
fi

if [[ ! -w "$dependency_directory" ]]; then
	echo "The isolated node_modules volume is not writable by $(id -un)." >&2
	exit 1
fi

expected_bun_version="$(node -p "require('./package.json').packageManager.split('@').at(-1)")"
actual_bun_version="$(bun --version)"

if [[ "$actual_bun_version" != "$expected_bun_version" ]]; then
	echo "Bun version mismatch: expected $expected_bun_version, received $actual_bun_version." >&2
	exit 1
fi

bun install --frozen-lockfile

expected_playwright_version="$(node -p "require('./package.json').devDependencies['@playwright/test'].replace(/^[^0-9]*/, '')")"
actual_playwright_version="$(bunx playwright --version | awk '{print $2}')"

if [[ "$actual_playwright_version" != "$expected_playwright_version" ]]; then
	echo "Playwright version mismatch: expected $expected_playwright_version, received $actual_playwright_version." >&2
	exit 1
fi

bun run check:devcontainer

if command -v docker >/dev/null 2>&1; then
	docker --version
	if docker compose version >/dev/null 2>&1; then
		docker compose version
	fi

	if docker info >/dev/null 2>&1; then
		echo "Docker daemon connection: available"
	else
		echo "Docker daemon connection: unavailable. Start the host Docker daemon before running Docker-backed tests." >&2
	fi
else
	echo "Docker CLI not installed in container (running in isolated mode)."
fi

printf '\nDevelopment container ready.\n'
printf 'Bun: %s\n' "$actual_bun_version"
printf 'Playwright: %s\n' "$actual_playwright_version"
printf 'Starship: %s\n' "$("$HOME/.local/bin/starship" --version | awk 'NR == 1 { print $2 }')"
printf 'eza: %s\n' "$("$HOME/.local/bin/eza" --version | awk 'NR == 1 { print $2 }')"
printf 'Workspace: %s\n' "$REPOSITORY_ROOT"
printf 'Dependencies: %s (isolated volume)\n' "$dependency_directory"
printf 'Zsh history: %s (persistent project volume)\n' "${ZSH_HISTORY_FILE:-$HOME/.zsh_history}"
