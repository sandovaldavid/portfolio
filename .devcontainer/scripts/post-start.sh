#!/usr/bin/env bash
set -euo pipefail

if [[ "${DEVCONTAINER:-}" != "true" ]]; then
	echo "Workspace permission repair is restricted to the development container." >&2
	exit 1
fi

REPOSITORY_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPOSITORY_ROOT"

owner_uid="$(id -u)"
owner_gid="$(id -g)"
owner="${owner_uid}:${owner_gid}"
workspace_uid="$(stat -c '%u' "$REPOSITORY_ROOT")"
workspace_gid="$(stat -c '%g' "$REPOSITORY_ROOT")"

if [[ "$workspace_uid" != "$owner_uid" ]]; then
	cat >&2 <<EOF
Development container identity mismatch.
- pwuser UID:GID: ${owner_uid}:${owner_gid}
- workspace UID:GID: ${workspace_uid}:${workspace_gid}

The Linux bind mount cannot be repaired safely while these UIDs differ.
Remove the stale container and run "Dev Containers: Rebuild Container Without Cache".
EOF
	exit 1
fi

if [[ ! -w "$REPOSITORY_ROOT" ]]; then
	echo "Repository root is not writable by $(id -un): $REPOSITORY_ROOT" >&2
	exit 1
fi

bun_home="${BUN_INSTALL:-$HOME/.bun}"
if [[ "$bun_home" != "$HOME/.bun" ]]; then
	echo "Refusing to repair an unexpected Bun home outside the managed path: $bun_home" >&2
	exit 1
fi

if [[ -L "$bun_home" ]]; then
	echo "Refusing to repair Bun home because it is a symbolic link: $bun_home" >&2
	exit 1
fi

bun_state="$bun_home/.devcontainer-owner-state"
expected_bun_state="schema=1 uid=${owner_uid} gid=${owner_gid}"
sudo mkdir -p "$bun_home"
actual_bun_state="$(cat "$bun_state" 2>/dev/null || true)"

if [[ "$actual_bun_state" != "$expected_bun_state" ]]; then
	echo "Repairing inherited Bun home for ${owner}."
	sudo chown -R --no-dereference "$owner" -- "$bun_home"
	sudo chmod -R u+rwX -- "$bun_home"
fi

for mutable_path in install/cache; do
	if [[ -e "$bun_home/$mutable_path" ]]; then
		sudo chown -R --no-dereference "$owner" -- "$bun_home/$mutable_path"
		sudo chmod -R u+rwX -- "$bun_home/$mutable_path"
	fi
done

printf '%s\n' "$expected_bun_state" | sudo tee "$bun_state" >/dev/null
sudo chown "$owner" -- "$bun_state"
sudo chmod u+rw -- "$bun_state"

bun_probe="$bun_home/.devcontainer-write-probe.$$"
touch "$bun_probe"
rm -f "$bun_probe"

history_file="${ZSH_HISTORY_FILE:-$HOME/.zsh_history}"
history_directory="$(dirname "$history_file")"

if [[ -L "$history_directory" || -L "$history_file" ]]; then
	echo "Refusing to repair command history through a symbolic link: $history_file" >&2
	exit 1
fi

sudo mkdir -p "$history_directory"
sudo chown "$owner" -- "$history_directory"
sudo chmod 0700 "$history_directory"
touch "$history_file"
sudo chown "$owner" -- "$history_file"
chmod 0600 "$history_file"

if [[ ! -w "$history_file" ]]; then
	echo "Zsh history is not writable after repair: $history_file" >&2
	exit 1
fi

git_directory="$(git rev-parse --absolute-git-dir 2>/dev/null || true)"
if [[ -n "$git_directory" ]]; then
	case "$git_directory" in
		"$REPOSITORY_ROOT"/.git | "$REPOSITORY_ROOT"/.git/*)
			if [[ -L "$git_directory" ]]; then
				echo "Refusing to repair Git metadata because it is a symbolic link: $git_directory" >&2
				exit 1
			fi

			sudo chown -R --no-dereference "$owner" -- "$git_directory"
			sudo chmod -R u+rwX -- "$git_directory"

			if [[ ! -w "$git_directory" ]]; then
				echo "Git metadata is not writable after repair: $git_directory" >&2
				exit 1
			fi
			;;
		*)
			echo "Refusing to repair Git metadata outside the repository: $git_directory" >&2
			exit 1
			;;
	esac
fi

dependency_directory="$REPOSITORY_ROOT/node_modules"
dependency_volume_state="$dependency_directory/.devcontainer-volume-state"
dependency_volume_schema="1"
expected_dependency_state="schema=${dependency_volume_schema} uid=${owner_uid} gid=${owner_gid}"

if awk -v target="$dependency_directory" '$5 == target { found = 1 } END { exit !found }' /proc/self/mountinfo; then
	actual_dependency_state="$(cat "$dependency_volume_state" 2>/dev/null || true)"

	if [[ "$actual_dependency_state" != "$expected_dependency_state" ]]; then
		echo "Repairing inherited node_modules volume for ${owner}."
		sudo chown -R --no-dereference "$owner" -- "$dependency_directory"
		sudo chmod -R u+rwX -- "$dependency_directory"
	fi

	for mutable_path in .bin .cache .vite .vite-temp; do
		if [[ -e "$dependency_directory/$mutable_path" ]]; then
			sudo chown -R --no-dereference "$owner" -- "$dependency_directory/$mutable_path"
			sudo chmod -R u+rwX -- "$dependency_directory/$mutable_path"
		fi
	done

	printf '%s\n' "$expected_dependency_state" | sudo tee "$dependency_volume_state" >/dev/null
	sudo chown "$owner" -- "$dependency_volume_state"
	sudo chmod u+rw -- "$dependency_volume_state"

	dependency_probe="$dependency_directory/.devcontainer-write-probe.$$"
	touch "$dependency_probe"
	rm -f "$dependency_probe"
fi

generated_paths=(
	.astro
	dist
	coverage
	playwright-report
	test-results
	test-results.json
	junit-results.xml
	bundle-analysis
	bundle-stats.html
	.lighthouseci
	lighthouse-report
	performance-report
	.docker
)

for path in "${generated_paths[@]}"; do
	if [[ -L "$path" ]]; then
		echo "Refusing to repair generated path because it is a symbolic link: $path" >&2
		exit 1
	fi

	if [[ -e "$path" ]]; then
		sudo chown -R --no-dereference "$owner" -- "$path"
		sudo chmod -R u+rwX -- "$path"
	fi
done

sudo mkdir -p .docker/runtime/node_modules .docker/runtime/home
sudo chown -R --no-dereference "$owner" -- .docker
sudo chmod -R u+rwX -- .docker

for path in .docker .docker/runtime .docker/runtime/node_modules .docker/runtime/home; do
	if [[ ! -w "$path" ]]; then
		echo "Generated runtime path is not writable after repair: $path" >&2
		exit 1
	fi
done

# The forwarded agent can become available after the first container creation.
bash .devcontainer/scripts/configure-git-ssh-signing.sh

printf 'Git metadata, Bun home, command history, dependency volume and generated workspace paths are writable by %s (%s).\n' "$(id -un)" "$owner"
