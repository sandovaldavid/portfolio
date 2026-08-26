import { spawnSync } from 'node:child_process';

const isDevContainer = process.env.DEVCONTAINER === 'true';
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

if (!isDevContainer && !isGitHubActions) {
	console.error(
		'[error] Local Playwright execution is restricted to the repository DevContainer.\n' +
			'Run "bun run validate:local" from the host, or reopen the repository in the DevContainer.'
	);
	process.exit(1);
}

if (isDevContainer) {
	const repairResult = spawnSync('bash', ['.devcontainer/scripts/post-start.sh'], {
		stdio: 'inherit',
	});

	if (repairResult.error) {
		console.error(repairResult.error.message);
		process.exit(1);
	}

	if (repairResult.status !== 0) {
		process.exit(repairResult.status ?? 1);
	}
}

const playwrightResult = spawnSync('bunx', ['playwright', 'test', ...process.argv.slice(2)], {
	stdio: 'inherit',
	env: process.env,
});

if (playwrightResult.error) {
	console.error(playwrightResult.error.message);
	process.exit(1);
}

process.exit(playwrightResult.status ?? 1);
