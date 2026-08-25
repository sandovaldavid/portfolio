import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const isDevContainer = process.env.DEVCONTAINER === 'true';
const devcontainer = process.platform === 'win32' ? 'devcontainer.cmd' : 'devcontainer';

/**
 * @param {string} command
 * @param {string[]} args
 * @param {import('node:child_process').SpawnSyncOptions} [options]
 */
function run(command, args, options = {}) {
	const result = spawnSync(command, args, {
		cwd: repositoryRoot,
		env: process.env,
		stdio: 'inherit',
		...options,
	});

	if (result.error) {
		console.error(`[error] Failed to run ${command}: ${result.error.message}`);
		process.exit(1);
	}

	if (result.status !== 0) process.exit(result.status ?? 1);
}

if (isDevContainer) {
	run('bun', ['run', 'validate:local:inside']);
	process.exit(0);
}

const probe = spawnSync(devcontainer, ['--version'], {
	cwd: repositoryRoot,
	stdio: 'ignore',
});

if (probe.error || probe.status !== 0) {
	console.error(
		'[error] Complete local browser validation requires the Dev Containers CLI.\n' +
			'Install the Dev Containers CLI, then rerun "bun run validate:local".'
	);
	process.exit(1);
}

run(devcontainer, ['up', '--workspace-folder', repositoryRoot]);

/** @type {string[]} */
const remoteEnvironment = [];
if (process.env.PLAYWRIGHT_WORKERS) {
	remoteEnvironment.push(`PLAYWRIGHT_WORKERS=${process.env.PLAYWRIGHT_WORKERS}`);
}

const remoteCommand = remoteEnvironment.length
	? ['env', ...remoteEnvironment, 'bun', 'run', 'validate:local:inside']
	: ['bun', 'run', 'validate:local:inside'];

run(devcontainer, ['exec', '--workspace-folder', repositoryRoot, ...remoteCommand]);
