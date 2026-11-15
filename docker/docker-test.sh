#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

# shellcheck source=docker/container-runtime.sh
source "$SCRIPT_DIR/container-runtime.sh"

CI="${CI:-true}"
GITHUB_ACTIONS="${GITHUB_ACTIONS:-}"
RUN_VISUAL_TESTS="${RUN_VISUAL_TESTS:-}"
E2E_USE_PRODUCTION_PREVIEW="${E2E_USE_PRODUCTION_PREVIEW:-1}"
HOST_UID="$(id -u)"
HOST_GID="$(id -g)"
export CI GITHUB_ACTIONS RUN_VISUAL_TESTS E2E_USE_PRODUCTION_PREVIEW HOST_UID HOST_GID

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

resolve_container_runtime

if [[ "$CONTAINER_RUNTIME_KIND" == "docker" ]]; then
	echo "==> Building pinned Playwright visual-regression image (docker)..."
	"$CONTAINER_RUNTIME_BIN" compose build playwright
else
	# Invoke podman build/run directly instead of podman-compose to avoid rootless
	# netavark bridge failures and enforce --userns=keep-id bind-mount ownership.
	echo "==> Building pinned Playwright visual-regression image (podman)..."
	"$CONTAINER_RUNTIME_BIN" build \
		-f "$REPO_ROOT/docker/Dockerfile.test" \
		-t portfolio-test:latest \
		"$REPO_ROOT"

	podman_run_args=(
		--rm
		--init
		--ipc=host
		--security-opt label=disable
		--user "${HOST_UID}:${HOST_GID}"
		-w /workspace
		-v "${HOST_WORKSPACE_FOLDER}:/workspace"
		-v "${HOST_WORKSPACE_FOLDER}/.docker/runtime/node_modules:/workspace/node_modules"
		-v "${HOST_WORKSPACE_FOLDER}/.docker/runtime/home:/home/tester"
		-e HOME=/home/tester
		-e "CI=${CI}"
		-e "GITHUB_ACTIONS=${GITHUB_ACTIONS}"
		-e "RUN_VISUAL_TESTS=${RUN_VISUAL_TESTS}"
		-e "E2E_USE_PRODUCTION_PREVIEW=${E2E_USE_PRODUCTION_PREVIEW}"
	)
	if [[ "$HOST_UID" -ne 0 ]]; then
		podman_run_args+=(--userns=keep-id)
	fi
fi

run_test_container() {
	local entrypoint="${1:-}"
	if [[ $# -gt 0 ]]; then
		shift
	fi
	local entrypoint_args=()
	if [[ -n "$entrypoint" ]]; then
		entrypoint_args=(--entrypoint "$entrypoint")
	fi

	if [[ "$CONTAINER_RUNTIME_KIND" == "docker" ]]; then
		"$CONTAINER_RUNTIME_BIN" compose run --rm \
			-e CI \
			-e GITHUB_ACTIONS \
			-e RUN_VISUAL_TESTS \
			-e E2E_USE_PRODUCTION_PREVIEW \
			${entrypoint_args[@]+"${entrypoint_args[@]}"} \
			playwright "$@"
	else
		"$CONTAINER_RUNTIME_BIN" run "${podman_run_args[@]}" \
			${entrypoint_args[@]+"${entrypoint_args[@]}"} \
			portfolio-test:latest "$@"
	fi
}

echo "==> Verifying the host workspace mount..."
run_test_container bash -lc 'test -f /workspace/package.json && test -f /workspace/bun.lock'

if [[ "${VERIFY_DOCKER_WORKSPACE_ONLY:-}" == "true" ]]; then
	echo "Pinned Playwright visual-regression container can access the host workspace."
	exit 0
fi

echo "==> Running Playwright visual regression in the pinned container..."
run_test_container "" "$@"
