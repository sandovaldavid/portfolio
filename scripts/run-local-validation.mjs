import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const isDevContainer = process.env.DEVCONTAINER === 'true';
const devcontainer = process.platform === 'win32' ? 'devcontainer.cmd' : 'devcontainer';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const validationLogFile =
	process.env.VALIDATION_LOG_FILE?.trim() || `validation-logs/validate-local-${timestamp}.log`;
const loggedValidationCommand =
	'set -o pipefail; mkdir -p "$(dirname "$VALIDATION_LOG_FILE")"; ' +
	'echo "[validation] Full log: $VALIDATION_LOG_FILE"; ' +
	'bun run validate:local:inside 2>&1 | tee "$VALIDATION_LOG_FILE"';

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

console.log(`[validation] Full in-container log will be written to ${validationLogFile}`);

if (isDevContainer) {
	run('bash', ['-lc', loggedValidationCommand], {
		env: { ...process.env, VALIDATION_LOG_FILE: validationLogFile },
	});
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
const remoteEnvironment = [`VALIDATION_LOG_FILE=${validationLogFile}`];
if (process.env.PLAYWRIGHT_WORKERS) {
	remoteEnvironment.push(`PLAYWRIGHT_WORKERS=${process.env.PLAYWRIGHT_WORKERS}`);
}

run(devcontainer, [
	'exec',
	'--workspace-folder',
	repositoryRoot,
	'env',
	...remoteEnvironment,
	'bash',
	'-lc',
	loggedValidationCommand,
]);
