import { existsSync, readFileSync } from 'node:fs';
import { parse } from 'jsonc-parser';

const errors = [];

function expect(condition, message) {
	if (!condition) errors.push(message);
}

function read(path) {
	return readFileSync(path, 'utf8');
}

const devcontainerJson = read('.devcontainer/devcontainer.json');
const devcontainer = parse(devcontainerJson);
const dockerfile = read('.devcontainer/Dockerfile');
const postCreateScript = read('.devcontainer/scripts/post-create.sh');
const postStartScript = read('.devcontainer/scripts/post-start.sh');
const configureShellScript = read('.devcontainer/scripts/configure-shell.sh');
const configureGitSigningScript = read(
	'.devcontainer/scripts/configure-git-ssh-signing.sh'
);
const shellZsh = read('.devcontainer/config/shell.zsh');
const shellBash = read('.devcontainer/config/shell.bash');
const starshipConfig = read('.devcontainer/config/starship.toml');
const dockerCompose = read('docker/docker-compose.yml');
const dockerTestScript = read('docker/docker-test.sh');
const runPlaywrightScript = read('scripts/run-playwright.mjs');
const prettierIgnore = read('.prettierignore');
const packageJson = JSON.parse(read('package.json'));
const eslintConfig = read('eslint.config.js');
const preCommitHook = read('.husky/pre-commit');
const formatTrackedFilesScript = read('scripts/format-tracked-files.mjs');
const dockerIgnore = read('.dockerignore');
const gitIgnore = read('.gitignore');

const postStartCommand = 'bash .devcontainer/scripts/post-start.sh';

expect(
	devcontainer.name === 'portfolio-v1',
	'devcontainer.json must retain the repository display name.'
);
expect(
	devcontainer.build?.dockerfile === 'Dockerfile' &&
		devcontainer.build?.context === '..',
	'devcontainer.json must build the repository-owned Dockerfile from the repository context.'
);
expect(
	devcontainer.build?.args?.NODE_VERSION === '24.14.0' &&
		devcontainer.build?.args?.BUN_VERSION === '1.3.14' &&
		devcontainer.build?.args?.PLAYWRIGHT_VERSION === '1.62.1',
	'devcontainer.json must pin Node, Bun and Playwright build args.'
);
expect(
	devcontainer.remoteUser === 'node' && devcontainer.updateRemoteUserUID === true,
	'devcontainer.json must use the non-root node user with host UID/GID synchronization.'
);
expect(
	devcontainer.workspaceFolder === '/workspace',
	'devcontainer.json must mount the repository at /workspace.'
);
expect(
	Array.isArray(devcontainer.mounts) &&
		devcontainer.mounts.some((mount) =>
			mount.includes('target=/workspace/node_modules,type=volume')
		) &&
		devcontainer.mounts.some((mount) =>
			mount.includes('target=/home/node/.bun,type=volume')
		) &&
		devcontainer.mounts.some((mount) =>
			mount.includes('target=/commandhistory,type=volume')
		),
	'devcontainer.json must keep dependencies, Bun home and command history out of the bind-mounted repository.'
);
expect(
	devcontainer.runArgs?.includes('--security-opt') &&
		devcontainer.runArgs?.includes('label=disable'),
	'devcontainer.json must preserve the Fedora SELinux compatibility run args.'
);
expect(
	devcontainer.features?.['ghcr.io/devcontainers/features/common-utils:2.5.9'] &&
		devcontainer.features?.['ghcr.io/devcontainers/features/github-cli:1.1.0'],
	'devcontainer.json must keep the reviewed common-utils and GitHub CLI Features.'
);
expect(
	devcontainer.features?.['ghcr.io/devcontainers/features/common-utils:2.5.9']
		?.installZsh === true &&
		devcontainer.features?.['ghcr.io/devcontainers/features/common-utils:2.5.9']
			?.configureZshAsDefaultShell === true &&
		devcontainer.features?.['ghcr.io/devcontainers/features/common-utils:2.5.9']
			?.installOhMyZsh === false,
	'common-utils must provide Zsh without duplicating the dotfiles-managed Oh My Zsh configuration.'
);
expect(
	devcontainer.postCreateCommand === 'bash .devcontainer/scripts/post-create.sh',
	'devcontainer.json must delegate postCreate lifecycle work to the repository script.'
);
expect(
	devcontainer.postStartCommand === postStartCommand,
	'devcontainer.json must repair generated-path ownership and refresh signing on every start.'
);
expect(
	Array.isArray(devcontainer.forwardPorts) &&
		devcontainer.forwardPorts.includes(4321) &&
		devcontainer.forwardPorts.includes(9323),
	'devcontainer.json must forward the Astro and Playwright report ports.'
);
expect(
	devcontainer.portsAttributes?.['4321']?.protocol === 'http' &&
		devcontainer.portsAttributes?.['9323']?.protocol === 'http',
	'devcontainer.json must retain HTTP metadata for forwarded application ports.'
);
expect(
	devcontainer.hostRequirements?.cpus === 4 &&
		devcontainer.hostRequirements?.memory === '8gb' &&
		devcontainer.hostRequirements?.storage === '24gb',
	'devcontainer.json must retain the reviewed host requirements.'
);
expect(
	devcontainer.customizations?.vscode?.settings?.[
		'terminal.integrated.defaultProfile.linux'
	] === 'zsh',
	'devcontainer.json must keep Zsh as the default VS Code terminal.'
);
expect(
	devcontainer.customizations?.vscode?.settings?.[
		'terminal.integrated.profiles.linux'
	]?.zsh?.path === '/bin/zsh',
	'devcontainer.json must retain the explicit Zsh terminal profile.'
);
expect(
	devcontainer.customizations?.vscode?.settings?.['files.eol'] === '\n',
	'devcontainer.json must enforce LF line endings in the container.'
);
expect(
	devcontainer.customizations?.vscode?.settings?.['git.enableCommitSigning'] === true,
	'devcontainer.json must keep commit signing enabled in VS Code.'
);
expect(
	devcontainer.customizations?.vscode?.extensions?.includes(
		'astro-build.astro-vscode'
	) &&
		devcontainer.customizations?.vscode?.extensions?.includes(
			'ms-playwright.playwright'
		) &&
		devcontainer.customizations?.vscode?.extensions?.includes(
			'GitHub.copilot'
		),
	'devcontainer.json must retain the project editor extension set.'
);
expect(
	devcontainer.customizations?.jetbrains?.settings?.[
		'org.jetbrains.plugins.terminal:app:TerminalOptionsProvider.myShellPath'
	] === '/bin/zsh',
	'devcontainer.json must retain the JetBrains terminal shell integration.'
);
expect(
	devcontainer.containerEnv?.DEVCONTAINER === 'true',
	'devcontainer.json must expose the DEVCONTAINER environment marker.'
);
expect(
	devcontainer.containerEnv?.ZSH_HISTORY_FILE === '/commandhistory/.zsh_history',
	'devcontainer.json must keep persistent command history outside the workspace.'
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
	!existsSync('.devcontainer/config/gitconfig-atena') &&
		!existsSync('.devcontainer/config/gitconfig-personal'),
	'the project Dev Container must not bundle personal or corporate Git identity profiles.'
);
expect(
	configureGitSigningScript.includes('namespaces=\\"git\\"') &&
		configureGitSigningScript.includes('ssh-add -L') &&
		configureGitSigningScript.includes('git config --get user.email') &&
		configureGitSigningScript.includes('git config --get user.signingKey') &&
		configureGitSigningScript.includes('current_entry') &&
		!configureGitSigningScript.includes('gitconfig-atena'),
	'the container must consume the effective Git identity and forwarded SSH agent without owning identity profiles.'
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
	formatTrackedFilesScript.includes("git', ['ls-files', '-z']") &&
		formatTrackedFilesScript.includes("prettier', [mode, '--ignore-unknown', '--stdin-filepath'") &&
		formatTrackedFilesScript.includes("eslint', ['--no-warn-ignored', '--stdin', '--stdin-filename'") &&
		formatTrackedFilesScript.includes('chunkSize = 256'),
	'the tracked-file formatter must discover files from Git and run Prettier/ESLint in bounded batches.'
);
expect(
	dockerIgnore.split(/\r?\n/).includes('.docker/runtime'),
	'.dockerignore must exclude generated Docker runtime state.'
);
expect(
	gitIgnore.split(/\r?\n/).includes('.docker/runtime/'),
	'.gitignore must exclude generated Docker runtime state.'
);

expect(
	dockerfile.includes('FROM mcr.microsoft.com/devcontainers/typescript-node:4-24-bookworm'),
	'Dockerfile must use the reviewed Node 24 Dev Container base.'
);
expect(
	dockerfile.includes('ARG BUN_VERSION=1.3.14') &&
		dockerfile.includes('ARG PLAYWRIGHT_VERSION=1.62.1'),
	'Dockerfile must pin Bun and Playwright.'
);
expect(
	dockerfile.includes('USER node'),
	'Dockerfile must finish as the non-root node user.'
);
expect(
	dockerfile.includes('npm install -g') && dockerfile.includes('@playwright/test@${PLAYWRIGHT_VERSION}'),
	'Dockerfile must install the pinned Playwright CLI used by project validation.'
);
expect(
	dockerfile.includes('curl -fsSL https://bun.sh/install') &&
		dockerfile.includes('bun-v${BUN_VERSION}'),
	'Dockerfile must install the pinned Bun version.'
);
expect(
	dockerfile.includes('libnss3') &&
		dockerfile.includes('libgbm1') &&
		dockerfile.includes('libasound2'),
	'Dockerfile must retain Chromium runtime dependencies.'
);
expect(
	!dockerfile.includes('gitconfig-atena') &&
		!dockerfile.includes('user.email') &&
		!dockerfile.includes('user.signingKey'),
	'Dockerfile must not own user Git identity.'
);

if (errors.length > 0) {
	console.error('Devcontainer contract validation failed:');
	for (const error of errors) console.error(`- ${error}`);
	process.exitCode = 1;
} else {
	console.log('Devcontainer contract validation passed.');
}
