#!/usr/bin/env bash

# Resolves the host container runtime flavor ("docker" or "podman") and CLI
# binary. Honors optional CONTAINER_RUNTIME=docker|podman; otherwise detects
# podman-docker shims and falls back to podman when docker is absent.
resolve_container_runtime() {
	local requested="${CONTAINER_RUNTIME:-}"
	if [[ -n "$requested" ]]; then
		case "$requested" in
			podman)
				if ! command -v podman >/dev/null 2>&1; then
					echo "Requested CONTAINER_RUNTIME=podman is not installed." >&2
					return 1
				fi
				CONTAINER_RUNTIME_KIND="podman"
				CONTAINER_RUNTIME_BIN="podman"
				export CONTAINER_RUNTIME_KIND CONTAINER_RUNTIME_BIN
				return 0
				;;
			docker)
				if ! command -v docker >/dev/null 2>&1; then
					echo "Requested CONTAINER_RUNTIME=docker is not installed." >&2
					return 1
				fi
				CONTAINER_RUNTIME_KIND="docker"
				CONTAINER_RUNTIME_BIN="docker"
				export CONTAINER_RUNTIME_KIND CONTAINER_RUNTIME_BIN
				return 0
				;;
			*)
				echo "Unsupported CONTAINER_RUNTIME: $requested (expected docker or podman)." >&2
				return 1
				;;
		esac
	fi

	if command -v docker >/dev/null 2>&1; then
		local version_output
		version_output="$(docker --version 2>/dev/null || true)"
		case "$version_output" in
			*[Pp][Oo][Dd][Mm][Aa][Nn]*)
				CONTAINER_RUNTIME_KIND="podman"
				if command -v podman >/dev/null 2>&1; then
					CONTAINER_RUNTIME_BIN="podman"
				else
					CONTAINER_RUNTIME_BIN="docker"
				fi
				;;
			*)
				CONTAINER_RUNTIME_KIND="docker"
				CONTAINER_RUNTIME_BIN="docker"
				;;
		esac
		export CONTAINER_RUNTIME_KIND CONTAINER_RUNTIME_BIN
		return 0
	fi

	if command -v podman >/dev/null 2>&1; then
		CONTAINER_RUNTIME_KIND="podman"
		CONTAINER_RUNTIME_BIN="podman"
		export CONTAINER_RUNTIME_KIND CONTAINER_RUNTIME_BIN
		return 0
	fi

	echo "No supported container runtime found (expected docker or podman)." >&2
	return 1
}
