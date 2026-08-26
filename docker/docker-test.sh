#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

export CI="${CI:-true}"
export GITHUB_ACTIONS="${GITHUB_ACTIONS:-}"
export RUN_VISUAL_TESTS="${RUN_VISUAL_TESTS:-}"
export E2E_USE_PRODUCTION_PREVIEW="${E2E_USE_PRODUCTION_PREVIEW:-1}"
export HOST_UID="$(id -u)"
export HOST_GID="$(id -g)"

if [[ "${DEVCONTAINER:-}" == "true" ]]; then
	bash .devcontainer/scripts/post-start.sh

	if [[ -z "${HOST_WORKSPACE_FOLDER:-}" ]]; then
		echo "HOST_WORKSPACE_FOLDER is required inside the devcontainer." >&2
		echo "Rebuild the development container after updating devcontainer.json." >&2
		exit 1
	fi
else
	export HOST_WORKSPACE_FOLDER="$REPO_ROOT"
fi

if [[ ! -f "$REPO_ROOT/package.json" ]]; then
	echo "Repository package.json is missing: $REPO_ROOT/package.json" >&2
	exit 1
fi

mkdir -p .docker/runtime/node_modules .docker/runtime/home

for directory in .docker/runtime/node_modules .docker/runtime/home; do
	if [[ ! -w "$directory" ]]; then
		echo "Docker runtime directory is not writable: $directory" >&2
		echo "Remove .docker/runtime and rerun the command as your normal user." >&2
		exit 1
	fi
done

echo "==> Building pinned Playwright visual-regression image..."
docker compose build playwright

echo "==> Verifying the host workspace mount..."
docker compose run --rm --entrypoint bash playwright -lc \
	'test -f /workspace/package.json && test -f /workspace/bun.lock'

if [[ "${VERIFY_DOCKER_WORKSPACE_ONLY:-}" == "true" ]]; then
	echo "Pinned Playwright visual-regression container can access the host workspace."
	exit 0
fi

echo "==> Running Playwright visual regression in the pinned container..."
docker compose run --rm \
	-e CI \
	-e GITHUB_ACTIONS \
	-e RUN_VISUAL_TESTS \
	-e E2E_USE_PRODUCTION_PREVIEW \
	playwright "$@"
