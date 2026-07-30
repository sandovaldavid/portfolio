import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const devcontainer = JSON.parse(readFileSync('.devcontainer/devcontainer.json', 'utf8'));
const devcontainerLock = JSON.parse(readFileSync('.devcontainer/devcontainer-lock.json', 'utf8'));
const dockerfile = readFileSync('.devcontainer/Dockerfile', 'utf8');
const postCreateScript = readFileSync('.devcontainer/scripts/post-create.sh', 'utf8');
const postStartScript = readFileSync('.devcontainer/scripts/post-start.sh', 'utf8');
const configureShellScript = readFileSync('.devcontainer/scripts/configure-shell.sh', 'utf8');
const configureGitSigningScript = readFileSync(
	'.devcontainer/scripts/configure-git-ssh-signing.sh',
	'utf8'
);
const shellZsh = readFileSync('.devcontainer/config/shell.zsh', 'utf8');
const shellBash = readFileSync('.devcontainer/config/shell.bash', 'utf8');
const starshipConfig = readFileSync('.devcontainer/config/starship.toml', 'utf8');
const gitConfigAtena = readFileSync('.devcontainer/config/gitconfig-atena', 'utf8');
const dockerCompose = readFileSync('docker-compose.yml', 'utf8');
const dockerTestScript = readFileSync('docker-test.sh', 'utf8');
const runPlaywrightScript = readFileSync('scripts/run-playwright.mjs', 'utf8');
const prettierIgnore = readFileSync('.prettierignore', 'utf8');
const eslintConfig = readFileSync('eslint.config.js', 'utf8');
const preCommitHook = readFileSync('.husky/pre-commit', 'utf8');
const devcontainerWorkflow = readFileSync('.github/workflows/build-devcontainer.yml', 'utf8');

/** @type {string[]} */
const failures = [];

/**
 * @param {unknown} condition
 * @param {string} message
 */
function expect(condition, message) {
	if (!condition) failures.push(message);
}

const bunVersion = packageJson.packageManager?.match(/^bun@(.+)$/)?.[1];
const playwrightVersion = packageJson.devDependencies?.['@playwright/test'];
/** @type {string[]} */
const mounts = Array.isArray(devcontainer.mounts) ? devcontainer.mounts : [];
/** @type {string[]} */
const runArgs = Array.isArray(devcontainer.runArgs) ? devcontainer.runArgs : [];
const workspaceFolder = '/workspaces/portfolio';
const dependencyVolumeMount =
	'source=${localWorkspaceFolderBasename}-devcontainer-node_modules,target=${containerWorkspaceFolder}/node_modules,type=volume';
const historyVolumeMount =
	'source=devcontainer-${localWorkspaceFolderBasename}-zsh-history,target=/commandhistory,type=volume';
const postStartCommand = 'bash .devcontainer/scripts/post-start.sh';
const commonUtilsFeature = 'ghcr.io/devcontainers/features/common-utils:2.5.9';
const dockerFeature = 'ghcr.io/devcontainers/features/docker-outside-of-docker:1.10.0';
const githubCliFeature = 'ghcr.io/devcontainers/features/github-cli:1.1.0';
const expectedFeatureLocks = {
	[commonUtilsFeature]: {
		version: '2.5.9',
		integrity: 'sha256:cb0c4d3c276f157eed17935747e364178d75fee17f55c4e129966f64633deb3a',
	},
	[dockerFeature]: {
		version: '1.10.0',
		integrity: 'sha256:c2c2cf829505ead8e4892c88c31b6594ae94a2bbb209e16e1fac456c1a3a624e',
	},
	[githubCliFeature]: {
		version: '1.1.0',
		integrity: 'sha256:d22f50b70ed75339b4eed1ba9ecde3a1791f90e88d37936517e3bace0bbad671',
	},
};

expect(Boolean(bunVersion), 'packageManager must pin Bun as bun@<version>.');
expect(
	/^\d+\.\d+\.\d+$/.test(playwrightVersion ?? ''),
	'@playwright/test must use an exact compatibility-sensitive version.'
);

expect(
	dockerfile.includes(`ARG BUN_VERSION=${bunVersion}`),
	'.devcontainer/Dockerfile must pin the packageManager Bun version.'
);
expect(
	dockerfile.includes(`ARG PLAYWRIGHT_VERSION=${playwrightVersion}`),
	'.devcontainer/Dockerfile must pin the project Playwright version.'
);
expect(
	dockerfile.includes('ARG DEVCONTAINER_UID=1000') &&
		dockerfile.includes('ARG DEVCONTAINER_GID=1000') &&
		dockerfile.includes('usermod --uid "${DEVCONTAINER_UID}"') &&
		dockerfile.includes('groupmod --gid "${DEVCONTAINER_GID}" pwuser'),
	'the development image must normalize pwuser to the standard Linux UID/GID before runtime remapping.'
);
expect(
	dockerfile.includes('USER pwuser') && dockerfile.includes('WORKDIR /workspaces/portfolio'),
	'the development image must finish as pwuser in the canonical workspace.'
);
expect(
	devcontainer.build?.args?.BUN_VERSION === bunVersion,
	'devcontainer.json must pass the packageManager Bun version to the image build.'
);
expect(
	devcontainer.build?.args?.PLAYWRIGHT_VERSION === playwrightVersion,
	'devcontainer.json must pass the project Playwright version to the image build.'
);
expect(
	devcontainer.workspaceMount ===
		`source=${'${localWorkspaceFolder}'},target=${workspaceFolder},type=bind`,
	'devcontainer.json must mount the repository at the canonical workspace path.'
);
expect(
	devcontainer.workspaceFolder === workspaceFolder,
	'devcontainer.json must open the canonical workspace folder.'
);
expect(
	mounts.includes(dependencyVolumeMount),
	'devcontainer.json must isolate node_modules in a named Docker volume.'
);
expect(
	mounts.includes(historyVolumeMount),
	'devcontainer.json must persist Zsh history in a project-specific named volume.'
);
expect(
	devcontainer.containerEnv?.ZSH_HISTORY_FILE === '/commandhistory/.zsh_history',
	'devcontainer.json must point Zsh history at the persistent private volume.'
);

for (const [feature, expected] of Object.entries(expectedFeatureLocks)) {
	expect(Boolean(devcontainer.features?.[feature]), `devcontainer.json must pin ${feature}.`);
	const lock = devcontainerLock.features?.[feature];
	expect(
		lock?.version === expected.version,
		`${feature} must use lock version ${expected.version}.`
	);
	expect(
		lock?.integrity === expected.integrity,
		`${feature} must use the reviewed integrity digest.`
	);
	expect(
		lock?.resolved?.endsWith(`@${expected.integrity}`),
		`${feature} must resolve to the reviewed digest.`
	);
}

const commonUtilsOptions = devcontainer.features?.[commonUtilsFeature];
expect(
	commonUtilsOptions?.installZsh === true &&
		commonUtilsOptions?.configureZshAsDefaultShell === true &&
		commonUtilsOptions?.installOhMyZsh === false &&
		commonUtilsOptions?.installOhMyZshConfig === false &&
		commonUtilsOptions?.upgradePackages === false &&
		commonUtilsOptions?.username === 'pwuser',
	'common-utils must configure a minimal pinned Zsh environment for pwuser without floating OS upgrades or Oh My Zsh.'
);
expect(
	devcontainer.hostRequirements?.cpus >= 2 && devcontainer.hostRequirements?.memory === '4gb',
	'devcontainer.json must declare minimum host requirements.'
);
expect(
	devcontainer.shutdownAction === 'stopContainer',
	'devcontainer.json must declare an explicit shutdown action.'
);
expect(
	devcontainer.remoteUser === 'pwuser',
	'VS Code and all default container processes must run as pwuser.'
);
expect(devcontainer.updateRemoteUserUID === true, 'Host UID mapping must remain enabled.');
expect(devcontainer.init === true, 'The devcontainer must use an init process as PID 1.');
expect(
	runArgs.includes('--ipc=host'),
	'The devcontainer must share host IPC for direct Chromium execution.'
);
expect(
	runArgs.includes('--security-opt') && runArgs.includes('label=disable'),
	'The trusted local devcontainer must include the documented Fedora SELinux compatibility setting.'
);
expect(
	devcontainer.postCreateCommand === 'bash .devcontainer/scripts/post-create.sh',
	'devcontainer.json must use the versioned post-create script.'
);
expect(
	devcontainer.postStartCommand === postStartCommand,
	'devcontainer.json must repair writable state whenever the container starts.'
);
expect(
	devcontainer.postAttachCommand === postStartCommand,
	'devcontainer.json must repair writable state whenever VS Code attaches.'
);
expect(
	devcontainer.waitFor === 'postStartCommand',
	'VS Code must wait for startup permission repair before attaching extensions.'
);
expect(
	devcontainer.containerEnv?.DEVCONTAINER === 'true',
	'devcontainer.json must identify the managed development shell.'
);
expect(
	devcontainer.containerEnv?.HOST_WORKSPACE_FOLDER === '${localWorkspaceFolder}',
	'devcontainer.json must expose the real host workspace path to Docker Compose.'
);
expect(
	devcontainer.containerEnv?.PLAYWRIGHT_BROWSERS_PATH === '/ms-playwright',
	'devcontainer.json must use the browsers bundled with the Playwright image.'
);
expect(
	devcontainer.containerEnv?.TERM === 'xterm-256color',
	'devcontainer.json must expose a consistent interactive terminal capability.'
);

expect(
	postCreateScript.includes(postStartCommand),
	'post-create setup must repair generated workspace paths before validation.'
);
expect(
	postCreateScript.includes('bash .devcontainer/scripts/configure-shell.sh') &&
		postCreateScript.includes('bash .devcontainer/scripts/configure-git-ssh-signing.sh'),
	'post-create setup must install the shared dotfiles shell and SSH signing configuration.'
);
expect(
	!postCreateScript.includes('devcontainer-prompt-customization') &&
		!postCreateScript.includes('__git_branch'),
	'post-create setup must not retain the legacy ad-hoc prompt implementation.'
);
expect(
	postCreateScript.includes('/proc/self/mountinfo'),
	'post-create setup must verify that node_modules is a separate mount.'
);
expect(
	postCreateScript.includes('sudo chown'),
	'post-create setup must make the dependency volume writable by the remote user.'
);
expect(
	postCreateScript.includes('bun install --frozen-lockfile'),
	'post-create setup must install from the committed lockfile.'
);
expect(
	postCreateScript.includes('bun run check:devcontainer'),
	'post-create setup must validate the devcontainer contract.'
);
expect(
	postStartScript.includes('git rev-parse --absolute-git-dir') &&
		postStartScript.includes('chown -R --no-dereference'),
	'the repair script must restore writable Git metadata without following symbolic links.'
);
expect(
	postStartScript.includes('workspace_uid=') &&
		postStartScript.includes('Development container identity mismatch') &&
		postStartScript.includes('Rebuild Container Without Cache'),
	'the repair script must reject stale containers whose UID differs from the Linux bind mount owner.'
);
expect(
	postStartScript.includes('bun_home=') &&
		postStartScript.includes('.devcontainer-owner-state') &&
		postStartScript.includes('Repairing inherited Bun home') &&
		postStartScript.includes('bun_probe='),
	'the repair script must version, repair and verify the writable Bun home.'
);
expect(
	postStartScript.includes('history_file="${ZSH_HISTORY_FILE:-$HOME/.zsh_history}"') &&
		postStartScript.includes('chmod 0600 "$history_file"') &&
		postStartScript.includes('Refusing to repair command history through a symbolic link'),
	'the repair script must protect and verify private persistent command history.'
);
expect(
	postStartScript.includes('bash .devcontainer/scripts/configure-git-ssh-signing.sh'),
	'the startup lifecycle must refresh SSH signing when the forwarded agent becomes available.'
);
expect(
	postStartScript.includes('.devcontainer-volume-state') &&
		postStartScript.includes('Repairing inherited node_modules volume') &&
		postStartScript.includes('dependency_probe='),
	'the repair script must version, repair and verify the dependency volume.'
);
expect(
	postStartScript.includes('generated_paths=(') && postStartScript.includes('.docker'),
	'the repair script must use an explicit allowlist of generated paths.'
);
expect(
	postStartScript.includes('sudo mkdir -p .docker/runtime/node_modules .docker/runtime/home'),
	'the repair script must be able to recreate generated Docker runtime paths before assigning ownership.'
);
expect(
	!postStartScript.includes('chown -R "$owner" -- "$REPOSITORY_ROOT"'),
	'the repair script must never recursively change ownership of the repository root.'
);

expect(
	configureShellScript.includes('STARSHIP_VERSION="${STARSHIP_VERSION:-v1.26.0}"') &&
		configureShellScript.includes('EZA_VERSION="${EZA_VERSION:-0.23.5}"') &&
		configureShellScript.includes(
			'ZSH_AUTOSUGGESTIONS_VERSION="${ZSH_AUTOSUGGESTIONS_VERSION:-0.7.1}"'
		) &&
		configureShellScript.includes(
			'ZSH_SYNTAX_HIGHLIGHTING_VERSION="${ZSH_SYNTAX_HIGHLIGHTING_VERSION:-0.8.0}"'
		) &&
		configureShellScript.includes(
			'ZSH_COMPLETIONS_VERSION="${ZSH_COMPLETIONS_VERSION:-0.36.0}"'
		) &&
		configureShellScript.includes(
			'ZSH_HISTORY_SUBSTRING_SEARCH_VERSION="${ZSH_HISTORY_SUBSTRING_SEARCH_VERSION:-1.1.0}"'
		),
	'the shared shell installer must pin the reviewed dotfiles tool versions.'
);
expect(
	(configureShellScript.match(/sha256sum --check --status/g) ?? []).length >= 2 &&
		!configureShellScript.includes('/latest/') &&
		!configureShellScript.includes(':latest'),
	'the shared shell installer must verify downloads and avoid floating latest references.'
);
expect(
	shellZsh.includes('HISTSIZE=50000') &&
		shellZsh.includes('setopt HIST_IGNORE_SPACE') &&
		shellZsh.includes('history-substring-search-up') &&
		shellZsh.includes("alias ls='eza --icons=auto --group-directories-first'") &&
		shellZsh.includes('eval "$(starship init zsh)"'),
	'the managed Zsh configuration must provide private history, substring search, eza aliases and Starship.'
);
expect(
	shellBash.includes("alias ls='eza --icons=auto --group-directories-first'") &&
		shellBash.includes('eval "$(starship init bash)"'),
	'the managed Bash fallback must provide the shared eza aliases and Starship prompt.'
);
expect(
	starshipConfig.includes('[git_status]') &&
		starshipConfig.includes('[bun]') &&
		starshipConfig.includes('[container]'),
	'the portable Starship configuration must retain the personalized Git, Bun and container modules.'
);
expect(
	configureGitSigningScript.includes('namespaces="git"') &&
		configureGitSigningScript.includes('ssh-add -L') &&
		configureGitSigningScript.includes('gitconfig-atena') &&
		gitConfigAtena.includes('david.sandoval@atena.la') &&
		gitConfigAtena.includes('signingKey = key::ssh-ed25519'),
	'the container must configure Git signing through the forwarded SSH agent without copying private keys.'
);

expect(
	dockerCompose.includes('init: true') && dockerCompose.includes('ipc: host'),
	'the pinned Playwright container must use init and host IPC.'
);
expect(
	dockerCompose.includes("'${HOST_WORKSPACE_FOLDER:-.}:/workspace:z'"),
	'Docker Compose must bind the real host workspace into the Playwright container.'
);
expect(
	dockerTestScript.includes('HOST_WORKSPACE_FOLDER') &&
		dockerTestScript.includes('test -f /workspace/package.json') &&
		dockerTestScript.includes('VERIFY_DOCKER_WORKSPACE_ONLY'),
	'the Docker test wrapper must validate the host workspace mount before running tests.'
);
expect(
	dockerTestScript.includes(postStartCommand),
	'the Docker test wrapper must repair generated runtime paths inside the devcontainer.'
);
expect(
	runPlaywrightScript.includes("spawnSync('bash'") &&
		runPlaywrightScript.includes('.devcontainer/scripts/post-start.sh'),
	'direct Playwright commands must repair stale generated output inside the devcontainer.'
);
expect(
	packageJson.scripts?.['test:e2e:smoke']?.startsWith('node scripts/run-playwright.mjs'),
	'the smoke gate must use the permission-aware Playwright runner.'
);
expect(
	prettierIgnore.split(/\r?\n/).includes('.docker/'),
	'.prettierignore must exclude Docker runtime state.'
);
expect(
	packageJson.scripts?.format === 'node scripts/format-tracked-files.mjs --write',
	'the write formatter must operate only on Git-tracked files.'
);
expect(
	packageJson.scripts?.['format:check'] === 'node scripts/format-tracked-files.mjs --check',
	'the formatting gate must operate only on Git-tracked files.'
);
expect(
	eslintConfig.includes("'**/.docker/**'"),
	'ESLint must globally exclude Docker runtime state and nested cache configurations.'
);
expect(
	preCommitHook.includes('bun run lint') && preCommitHook.includes('bun run format:check'),
	'the pre-commit hook must run non-mutating lint and formatting gates.'
);
expect(
	!preCommitHook.includes('lint:fix') && !preCommitHook.includes('git add -A'),
	'the pre-commit hook must not autofix or stage unrelated repository changes.'
);
expect(
	(devcontainerWorkflow.match(/bun install --frozen-lockfile/g) ?? []).length >= 2,
	'the devcontainer workflow must prove that two consecutive frozen installs succeed.'
);
expect(
	devcontainerWorkflow.includes('Verify Linux workspace identity alignment'),
	'the devcontainer workflow must assert that the remote user owns the bind-mounted workspace.'
);
expect(
	devcontainerWorkflow.includes('Verify personalized shell contract') &&
		devcontainerWorkflow.includes('history-substring-search-up') &&
		devcontainerWorkflow.includes('Verify tracked Dev Container lockfile'),
	'the devcontainer workflow must verify the dotfiles shell and committed Feature lockfile.'
);
expect(
	devcontainerWorkflow.includes('Create stale Git metadata fixture'),
	'the devcontainer workflow must validate recovery from an unwritable FETCH_HEAD.'
);
expect(
	devcontainerWorkflow.includes('Create stale generated ownership fixtures'),
	'the devcontainer workflow must validate recovery from stale generated ownership.'
);
expect(
	devcontainerWorkflow.includes('Create hostile nested ESLint fixture'),
	'the devcontainer workflow must prove ESLint does not traverse Docker runtime state.'
);
expect(
	devcontainerWorkflow.includes('Create hostile Prettier traversal fixture'),
	'the devcontainer workflow must prove Prettier does not enumerate Docker runtime state.'
);
expect(
	devcontainerWorkflow.includes(
		'Recreate stale Playwright output before the direct smoke command'
	),
	'the devcontainer workflow must prove the direct Playwright runner repairs stale output.'
);
expect(
	devcontainerWorkflow.includes('VERIFY_DOCKER_WORKSPACE_ONLY=true bash docker-test.sh'),
	'the devcontainer workflow must prove Docker can mount the real host workspace.'
);
expect(
	devcontainerWorkflow.includes('sh .husky/pre-commit'),
	'the devcontainer workflow must execute the real pre-commit hook.'
);

if (failures.length > 0) {
	console.error('Devcontainer contract validation failed:');
	for (const failure of failures) console.error(`- ${failure}`);
	process.exit(1);
}

console.log(
	`Devcontainer contract verified: Bun ${bunVersion}, Playwright ${playwrightVersion}, exact Feature locks, personalized Starship/eza/Zsh shell, private persistent history, normalized Linux identity, init and IPC settings, SELinux compatibility, writable Git metadata and Bun home, isolated node_modules, lifecycle repair, tracked-file formatting, permission-aware Playwright, SSH-backed signing and host-aware Docker mounts.`
);
