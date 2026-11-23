#!/usr/bin/env bash
# Legacy helper: regenerate webkit and Mobile Safari visual snapshots in a container.
# Note: docs/TESTING.md scopes maintained baselines to canonical Chromium via
# `bun run test:e2e:visual:docker`; webkit/Mobile Safari currently ignore visual.spec.ts
# in playwright.config.ts unless invoked explicitly outside the default config.
# Requires port 4321 and 4322 available on the host.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

# shellcheck source=docker/container-runtime.sh
source "$REPO_ROOT/docker/container-runtime.sh"
resolve_container_runtime

SERVER_PID=""
cleanup() {
	if [[ -n "$SERVER_PID" ]]; then
		echo "Stopping preview server..."
		kill "$SERVER_PID" 2>/dev/null || true
	fi
}
trap cleanup EXIT

echo "Building project..."
bun run build

echo "Starting preview server..."
bun run preview &
SERVER_PID=$!

# Wait for the server to be ready without hanging indefinitely if preview exits.
ready=0
for _ in $(seq 1 30); do
	if ! kill -0 "$SERVER_PID" 2>/dev/null; then
		echo "Preview server exited before becoming ready." >&2
		exit 1
	fi
	if curl -sf http://localhost:4321 >/dev/null 2>&1; then
		ready=1
		break
	fi
	sleep 1
done
if [[ "$ready" -ne 1 ]]; then
	echo "Timed out waiting for preview server on http://localhost:4321." >&2
	exit 1
fi
echo "Preview server ready."

host_uid="$(id -u)"
host_gid="$(id -g)"
container_args=(
	run
	--rm
	--user "${host_uid}:${host_gid}"
	-v "$REPO_ROOT:/work"
	-w /work
	--network=host
	--security-opt label=disable
	-e RUN_VISUAL_TESTS=true
	-e HOME=/tmp
)
if [[ "$CONTAINER_RUNTIME_KIND" == "podman" ]] && [[ "$host_uid" -ne 0 ]]; then
	container_args+=(--userns=keep-id)
fi

echo "Regenerating webkit + Mobile Safari snapshots (${CONTAINER_RUNTIME_KIND})..."
"$CONTAINER_RUNTIME_BIN" "${container_args[@]}" \
	mcr.microsoft.com/playwright:v1.65.1-noble \
	node node_modules/@playwright/test/cli.js test \
	tests/e2e/visual.spec.ts \
	--project=webkit --project="Mobile Safari" \
	--update-snapshots \
	--output=/tmp/pw-test-results

echo "Done. Review new PNGs in tests/e2e/visual.spec.ts-snapshots/ before committing."
