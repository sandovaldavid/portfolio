import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const devcontainer = JSON.parse(readFileSync('.devcontainer/devcontainer.json', 'utf8'));
const devcontainerDockerfile = readFileSync('.devcontainer/Dockerfile', 'utf8');
const visualDockerfile = readFileSync('docker/Dockerfile.test', 'utf8');
const dockerCompose = readFileSync('docker-compose.yml', 'utf8');
const dockerTest = readFileSync('docker/docker-test.sh', 'utf8');
const playwrightConfig = readFileSync('playwright.config.ts', 'utf8');
const playwrightRunner = readFileSync('scripts/run-playwright.mjs', 'utf8');
const localValidation = readFileSync('scripts/run-local-validation.mjs', 'utf8');
const localValidationInside = readFileSync('scripts/run-local-validation-inside.mjs', 'utf8');

/** @type {string[]} */
const failures = [];
/**
 * @param {unknown} condition
 * @param {string} message
 */
const expect = (condition, message) => {
	if (!condition) failures.push(message);
};

const bunVersion = packageJson.packageManager?.match(/^bun@(.+)$/)?.[1];
const playwrightVersion = packageJson.devDependencies?.['@playwright/test'];
const dependencyInstallCall = "run('bun', ['install', '--frozen-lockfile'])";
const qualityCheckCall = "run('bun', ['run', 'check'])";
const dependencyInstallIndex = localValidationInside.indexOf(dependencyInstallCall);
const qualityCheckIndex = localValidationInside.indexOf(qualityCheckCall);

expect(Boolean(bunVersion), 'packageManager must pin Bun as bun@<version>.');
expect(
	/^\d+\.\d+\.\d+$/.test(playwrightVersion ?? ''),
	'@playwright/test must use an exact version.'
);
expect(
	packageJson.devDependencies?.['playwright-core'] === playwrightVersion,
	'playwright-core must match @playwright/test.'
);

expect(
	devcontainerDockerfile.includes(`ARG PLAYWRIGHT_VERSION=${playwrightVersion}`),
	'DevContainer Playwright image must match the project Playwright version.'
);
expect(
	devcontainerDockerfile.includes(`ARG BUN_VERSION=${bunVersion}`),
	'DevContainer Bun version must match packageManager.'
);
expect(
	visualDockerfile.includes(`ARG PLAYWRIGHT_VERSION=${playwrightVersion}`),
	'Visual regression Playwright image must match the project Playwright version.'
);
expect(
	visualDockerfile.includes(`ARG BUN_VERSION=${bunVersion}`),
	'Visual regression Bun version must match packageManager.'
);
expect(
	!devcontainerDockerfile.includes('Portfolio V1'),
	'Active DevContainer metadata must use the canonical portfolio name, not Portfolio V1.'
);

expect(
	devcontainer.containerEnv?.DEVCONTAINER === 'true' &&
		devcontainer.containerEnv?.PLAYWRIGHT_BROWSERS_PATH === '/ms-playwright',
	'DevContainer must identify itself and use the browsers bundled with the Playwright image.'
);
expect(
	Array.isArray(devcontainer.runArgs) && devcontainer.runArgs.includes('--ipc=host'),
	'DevContainer must keep --ipc=host for Chromium stability.'
);

expect(
	packageJson.scripts?.['validate:local'] === 'node scripts/run-local-validation.mjs',
	'validate:local must delegate host orchestration to the Dev Containers wrapper.'
);
expect(
	packageJson.scripts?.['validate:local:inside'] ===
		'node scripts/run-local-validation-inside.mjs',
	'validate:local:inside must use the guarded in-container runner.'
);
expect(
	packageJson.scripts?.['test:local'] === 'bun run validate:local',
	'test:local must not bypass the canonical containerized local gate.'
);
expect(
	packageJson.scripts?.['check:devcontainer']?.includes('check-local-browser-validation.mjs'),
	'check:devcontainer must include the local browser validation contract.'
);

expect(
	localValidation.includes("process.env.DEVCONTAINER === 'true'") &&
		localValidation.includes("devcontainer, ['up', '--workspace-folder', repositoryRoot]") &&
		localValidation.includes("devcontainer, ['exec', '--workspace-folder', repositoryRoot") &&
		localValidation.includes('PLAYWRIGHT_WORKERS='),
	'Host validation must detect nested execution, up/exec the DevContainer and propagate worker overrides.'
);
expect(
	localValidation.includes('Complete local browser validation requires the Dev Containers CLI'),
	'Host validation must fail closed when the Dev Containers CLI is unavailable.'
);
expect(
	localValidationInside.includes("process.env.DEVCONTAINER !== 'true'") &&
		dependencyInstallIndex >= 0 &&
		qualityCheckIndex > dependencyInstallIndex &&
		localValidationInside.includes("run('bun', ['run', 'test:unit:ci'])") &&
		localValidationInside.includes("run('bun', ['run', 'build'])") &&
		localValidationInside.includes("run('bun', ['run', 'check:links'])") &&
		localValidationInside.includes("run('bun', ['run', 'performance:check'])") &&
		localValidationInside.includes("run('bun', ['run', 'test:e2e:extended']") &&
		localValidationInside.includes("E2E_USE_PRODUCTION_PREVIEW: '1'"),
	'In-container validation must sync frozen dependencies before running the maintained quality, build, link, performance and full Playwright gates against the existing production build.'
);

expect(
	playwrightRunner.includes(
		'Local Playwright execution is restricted to the repository DevContainer'
	) && playwrightRunner.includes("process.env.GITHUB_ACTIONS === 'true'"),
	'Direct Playwright execution must fail closed locally while remaining available in GitHub Actions.'
);
expect(
	playwrightConfig.includes('const isCi = Boolean(process.env.CI);') &&
		playwrightConfig.includes(
			"const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';"
		) &&
		playwrightConfig.includes("process.env.E2E_USE_PRODUCTION_PREVIEW === '1'") &&
		playwrightConfig.includes('PLAYWRIGHT_WORKERS must be a positive integer') &&
		playwrightConfig.includes('workerOverride ?? (isGitHubActions ? 4 : undefined)') &&
		playwrightConfig.includes('retries: isGitHubActions ? 2 : 0') &&
		playwrightConfig.includes('forbidOnly: isCi'),
	'Playwright must keep CI, GitHub Actions, worker overrides and production preview as separate policy signals.'
);
expect(
	playwrightConfig.includes('const playwrightPort = 4322;') &&
		playwrightConfig.includes('reuseExistingServer: false'),
	'Playwright production preview must stay isolated from the development server.'
);

expect(
	dockerCompose.includes(`PLAYWRIGHT_VERSION: '${playwrightVersion}'`) &&
		dockerCompose.includes(`BUN_VERSION: '${bunVersion}'`) &&
		dockerCompose.includes("GITHUB_ACTIONS: '${GITHUB_ACTIONS:-}'") &&
		dockerCompose.includes("E2E_USE_PRODUCTION_PREVIEW: '${E2E_USE_PRODUCTION_PREVIEW:-1}'") &&
		dockerCompose.includes("'4322:4322'"),
	'Visual Docker Compose must pin the aligned toolchain, preserve the provider signal and expose the dedicated E2E preview port.'
);
expect(
	dockerTest.includes('E2E_USE_PRODUCTION_PREVIEW') &&
		dockerTest.includes('-e E2E_USE_PRODUCTION_PREVIEW') &&
		dockerTest.includes('-e GITHUB_ACTIONS'),
	'Visual Docker wrapper must explicitly select production preview and preserve GitHub-specific policy when present.'
);

if (failures.length) {
	console.error('Local browser validation contract failed:');
	for (const failure of failures) console.error(`- ${failure}`);
	process.exit(1);
}

console.log(
	`Local browser validation contract verified: Bun ${bunVersion}, Playwright ${playwrightVersion}, DevContainer orchestration, isolated preview and visual image alignment.`
);
