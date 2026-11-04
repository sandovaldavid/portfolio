import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const devcontainer = JSON.parse(readFileSync('.devcontainer/devcontainer.json', 'utf8'));
const devcontainerLock = JSON.parse(readFileSync('.devcontainer/devcontainer-lock.json', 'utf8'));
const dockerfile = readFileSync('.devcontainer/Dockerfile', 'utf8');

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
const mounts = Array.isArray(devcontainer.mounts) ? devcontainer.mounts : [];
const forwardedPorts = Array.isArray(devcontainer.forwardPorts) ? devcontainer.forwardPorts : [];

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
	devcontainer.build?.args?.BUN_VERSION === bunVersion,
	'devcontainer.json must pass the packageManager Bun version to the image build.'
);
expect(
	devcontainer.build?.args?.PLAYWRIGHT_VERSION === playwrightVersion,
	'devcontainer.json must pass the project Playwright version to the image build.'
);
expect(
	devcontainer.remoteUser === 'pwuser',
	'VS Code and default container processes must run as pwuser.'
);
expect(
	devcontainer.updateRemoteUserUID === false,
	'Rootless Podman must not rewrite the remote user UID inside the container.'
);
expect(
	Array.isArray(devcontainer.runArgs) && devcontainer.runArgs.includes('--userns=keep-id'),
	'runArgs must map the host user into the container through --userns=keep-id.'
);
expect(
	!Object.keys(devcontainer.features ?? {}).some(feature =>
		feature.includes('docker-outside-of-docker')
	),
	'features must not mount the host container socket.'
);
expect(
	mounts.some(
		(/** @type {string} */ m) =>
			typeof m === 'string' && m.includes('target=${containerWorkspaceFolder}/node_modules')
	),
	'devcontainer.json must isolate node_modules in a named Docker volume.'
);

// Verify devcontainer feature lock integrity
for (const [feature] of Object.entries(devcontainer.features ?? {})) {
	const lock = devcontainerLock.features?.[feature];
	expect(Boolean(lock), `devcontainer-lock.json must contain entry for ${feature}.`);
	if (lock) {
		expect(
			Boolean(lock.version && lock.integrity),
			`${feature} must have version and integrity in lockfile.`
		);
	}
}

// Port forwarding checks
expect(forwardedPorts.includes(4321), 'forwardPorts must include Astro port 4321.');
expect(forwardedPorts.includes(9323), 'forwardPorts must include Playwright report port 9323.');
expect(
	devcontainer.portsAttributes?.['4321']?.label === 'Astro development server',
	'port 4321 must be labeled for Astro.'
);
expect(
	devcontainer.portsAttributes?.['9323']?.label === 'Playwright HTML report',
	'port 9323 must be labeled for Playwright HTML report.'
);

if (failures.length > 0) {
	console.error('Devcontainer contract validation failed:');
	for (const failure of failures) console.error(`- ${failure}`);
	process.exit(1);
}

console.log(
	`Devcontainer contract verified: Bun ${bunVersion}, Playwright ${playwrightVersion}, feature locks, ports, and isolation mounts.`
);
