import { createWriteStream, mkdirSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const isDevContainer = process.env.DEVCONTAINER === 'true';
const devcontainer = process.platform === 'win32' ? 'devcontainer.cmd' : 'devcontainer';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const validationLogFile =
	process.env.VALIDATION_LOG_FILE?.trim() || `validation-logs/validate-local-${timestamp}.log`;
const validationLogPath = resolve(repositoryRoot, validationLogFile);
const relativeValidationLogPath = relative(repositoryRoot, validationLogPath);

if (
	!relativeValidationLogPath ||
	isAbsolute(relativeValidationLogPath) ||
	relativeValidationLogPath === '..' ||
	relativeValidationLogPath.startsWith(`..${sep}`)
) {
	console.error('[error] VALIDATION_LOG_FILE must be a workspace-relative file path.');
	process.exit(1);
}

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

/**
 * Run the validation command without a shell while mirroring stdout/stderr to
 * both the terminal and a workspace-local evidence log.
 *
 * @param {string} command
 * @param {string[]} args
 * @param {import('node:child_process').SpawnOptions} [options]
 * @returns {Promise<number>}
 */
function runLogged(command, args, options = {}) {
	mkdirSync(dirname(validationLogPath), { recursive: true });
	const logStream = createWriteStream(validationLogPath, { flags: 'w' });

	return new Promise(resolveRun => {
		const child = spawn(command, args, {
			cwd: repositoryRoot,
			env: process.env,
			stdio: ['inherit', 'pipe', 'pipe'],
			...options,
		});
		let spawnFailed = false;

		child.stdout?.on('data', chunk => {
			process.stdout.write(chunk);
			logStream.write(chunk);
		});
		child.stderr?.on('data', chunk => {
			process.stderr.write(chunk);
			logStream.write(chunk);
		});
		child.on('error', error => {
			spawnFailed = true;
			const message = `[error] Failed to run ${command}: ${error.message}\n`;
			process.stderr.write(message);
			logStream.write(message);
		});
		child.on('close', code => {
			logStream.end(() => resolveRun(spawnFailed ? 1 : (code ?? 1)));
		});
	});
}

console.log(`[validation] Full in-container log will be written to ${validationLogFile}`);

if (isDevContainer) {
	const status = await runLogged('bun', ['run', 'validate:local:inside']);
	process.exit(status);
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

const status = await runLogged(devcontainer, [
	'exec',
	'--workspace-folder',
	repositoryRoot,
	'env',
	...remoteEnvironment,
	'bun',
	'run',
	'validate:local:inside',
]);
process.exit(status);
