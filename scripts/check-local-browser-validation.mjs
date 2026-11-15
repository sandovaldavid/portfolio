import { readFileSync, writeFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

const bunVersion = packageJson.packageManager?.match(/^bun@(.+)$/)?.[1];
const playwrightVersion = packageJson.devDependencies?.['@playwright/test'];

/**
 * Apply a pure text transform and write only when content changed.
 *
 * @param {string} path
 * @param {(content: string) => string} transform
 */
function syncFile(path, transform) {
	const current = readFileSync(path, 'utf8');
	const updated = transform(current);
	if (updated !== current) {
		writeFileSync(path, updated, 'utf8');
	}
}

const shouldFix = process.argv.includes('--fix');
if (shouldFix && bunVersion && /^\d+\.\d+\.\d+$/.test(playwrightVersion ?? '')) {
	syncFile('docker/Dockerfile.test', content =>
		content
			.replace(/^(ARG PLAYWRIGHT_VERSION=).*$/m, `$1${playwrightVersion}`)
			.replace(/^(ARG BUN_VERSION=).*$/m, `$1${bunVersion}`)
	);

	syncFile('docker-compose.yml', content =>
		content
			.replace(/^(\s*PLAYWRIGHT_VERSION:\s*')[^']+('.*)$/m, `$1${playwrightVersion}$2`)
			.replace(/^(\s*BUN_VERSION:\s*')[^']+('.*)$/m, `$1${bunVersion}$2`)
	);

	syncFile('scripts/update-webkit-snapshots.sh', content =>
		content.replace(
			/mcr\.microsoft\.com\/playwright:v[^-\s]+-noble/,
			`mcr.microsoft.com/playwright:v${playwrightVersion}-noble`
		)
	);
}

const visualDockerfile = readFileSync('docker/Dockerfile.test', 'utf8');
const dockerCompose = readFileSync('docker-compose.yml', 'utf8');
const webkitSnapshotScript = readFileSync('scripts/update-webkit-snapshots.sh', 'utf8');

/** @type {string[]} */
const failures = [];
/**
 * @param {unknown} condition
 * @param {string} message
 */
const expect = (condition, message) => {
	if (!condition) failures.push(message);
};

expect(Boolean(bunVersion), 'packageManager must pin Bun as bun@<version>.');
expect(
	/^\d+\.\d+\.\d+$/.test(playwrightVersion ?? ''),
	'@playwright/test must use an exact version.'
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
	dockerCompose.includes(`PLAYWRIGHT_VERSION: '${playwrightVersion}'`),
	'docker-compose.yml Playwright version must match package.json.'
);
expect(
	dockerCompose.includes(`BUN_VERSION: '${bunVersion}'`),
	'docker-compose.yml Bun version must match packageManager.'
);
expect(
	webkitSnapshotScript.includes(`mcr.microsoft.com/playwright:v${playwrightVersion}-noble`),
	'scripts/update-webkit-snapshots.sh Playwright image must match the project Playwright version.'
);

expect(
	packageJson.scripts?.['test:e2e:report'] ===
		'playwright show-report playwright-report --host 127.0.0.1 --port 9323',
	'test:e2e:report must serve local report on loopback port 9323.'
);
expect(
	packageJson.scripts?.['validate:local'] === 'node scripts/run-local-validation.mjs',
	'validate:local must delegate host orchestration to the Dev Containers wrapper.'
);

if (failures.length > 0) {
	console.error('Local browser validation contract failed:');
	for (const failure of failures) console.error(`- ${failure}`);
	if (failures.some(f => f.includes('Playwright version') || f.includes('Bun version'))) {
		console.error(
			'\nRun "bun run check:devcontainer:fix" to synchronize pinned versions with package.json.'
		);
	}
	process.exit(1);
}

console.log(
	`Local browser validation contract verified: Bun ${bunVersion}, Playwright ${playwrightVersion}, container visual configs, and report ports.`
);
