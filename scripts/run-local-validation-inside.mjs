import { spawnSync } from 'node:child_process';

if (process.env.DEVCONTAINER !== 'true') {
	console.error(
		'[error] validate:local:inside must run inside the repository DevContainer.\n' +
			'Run "bun run validate:local" from the host instead.'
	);
	process.exit(1);
}

/**
 * @param {string} command
 * @param {string[]} args
 * @param {NodeJS.ProcessEnv} [env]
 */
function run(command, args, env = process.env) {
	const result = spawnSync(command, args, {
		stdio: 'inherit',
		env,
	});

	if (result.error) {
		console.error(`[error] Failed to run ${command}: ${result.error.message}`);
		process.exit(1);
	}

	if (result.status !== 0) process.exit(result.status ?? 1);
}

run('bun', ['install', '--frozen-lockfile']);
run('bun', ['run', 'check']);
run('bun', ['run', 'test:unit:ci']);
run('bun', ['run', 'build']);
run('bun', ['run', 'check:links']);
run('bun', ['run', 'performance:check']);
run('bun', ['run', 'test:e2e:extended'], {
	...process.env,
	E2E_USE_PRODUCTION_PREVIEW: '1',
});
