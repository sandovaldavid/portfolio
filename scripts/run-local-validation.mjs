import { createWriteStream, mkdirSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceFolder = '.';
const isDevContainer = process.env.DEVCONTAINER === 'true';
const devcontainer = process.platform === 'win32' ? 'devcontainer.cmd' : 'devcontainer';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const validationLogFile =
	process.env.VALIDATION_LOG_FILE?.trim() || `validation-logs/validate-local-${timestamp}.log`;
const validationLogPath = resolve(repositoryRoot, validationLogFile);
const relativeValidationLogPath = relative(repositoryRoot, validationLogPath);
const rawWorkerOverride = process.env.PLAYWRIGHT_WORKERS?.trim();
let normalizedWorkerOverride;

if (
	!relativeValidationLogPath ||
	isAbsolute(relativeValidationLogPath) ||
	relativeValidationLogPath === '..' ||
	relativeValidationLogPath.startsWith(`..${sep}`)
) {
	console.error('[error] VALIDATION_LOG_FILE must be a workspace-relative file path.');
	process.exit(1);
}

if (rawWorkerOverride) {
	const parsedWorkerOverride = Number(rawWorkerOverride);
	if (!Number.isInteger(parsedWorkerOverride) || parsedWorkerOverride < 1) {
		console.error('[error] PLAYWRIGHT_WORKERS must be a positive integer.');
		process.exit(1);
	}
	normalizedWorkerOverride = String(parsedWorkerOverride);
}

mkdirSync(dirname(validationLogPath), { recursive: true });
const logStream = createWriteStream(validationLogPath, { flags: 'w' });

/**
 * Mirror a spawned validation process to both the terminal and the evidence log.
 *
 * @param {import('node:child_process').ChildProcessWithoutNullStreams} child
 * @param {string} label
 * @returns {Promise<number>}
 */
function waitForLoggedProcess(child, label) {
	return new Promise(resolveRun => {
		let spawnFailed = false;

		child.stdout.on('data', chunk => {
			process.stdout.write(chunk);
			logStream.write(chunk);
		});
		child.stderr.on('data', chunk => {
			process.stderr.write(chunk);
			logStream.write(chunk);
		});
		child.on('error', error => {
			spawnFailed = true;
			const message = `[error] Failed to run ${label}: ${error.message}\n`;
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
	const child = spawn('bun', ['run', 'validate:local:inside'], {
		cwd: repositoryRoot,
		stdio: ['inherit', 'pipe', 'pipe'],
	});
	const status = await waitForLoggedProcess(child, 'bun run validate:local:inside');
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

const up = spawnSync(devcontainer, ['up', '--workspace-folder', workspaceFolder], {
	cwd: repositoryRoot,
	stdio: 'inherit',
});
if (up.error) {
	console.error(`[error] Failed to run devcontainer up: ${up.error.message}`);
	process.exit(1);
}
if (up.status !== 0) process.exit(up.status ?? 1);

/** @type {string[]} */
const remoteEnvironment = [];
if (normalizedWorkerOverride) {
	remoteEnvironment.push(`PLAYWRIGHT_WORKERS=${normalizedWorkerOverride}`);
}

const child = spawn(
	devcontainer,
	[
		'exec',
		'--workspace-folder',
		workspaceFolder,
		'env',
		...remoteEnvironment,
		'bun',
		'run',
		'validate:local:inside',
	],
	{
		cwd: repositoryRoot,
		stdio: ['inherit', 'pipe', 'pipe'],
	}
);
const status = await waitForLoggedProcess(child, 'devcontainer exec');
process.exit(status);
