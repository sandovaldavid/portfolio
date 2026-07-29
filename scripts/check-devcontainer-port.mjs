import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const devcontainer = JSON.parse(readFileSync('.devcontainer/devcontainer.json', 'utf8'));
const vscodeTasks = JSON.parse(readFileSync('.vscode/tasks.json', 'utf8'));
const vscodeLaunch = JSON.parse(readFileSync('.vscode/launch.json', 'utf8'));
const expectedForwarding = new Map([
	[
		4321,
		{
			label: 'Astro development server',
			protocol: 'http',
			onAutoForward: 'openBrowserOnce',
		},
	],
	[
		9323,
		{
			label: 'Playwright HTML report',
			protocol: 'http',
			onAutoForward: 'notify',
		},
	],
]);
const appPorts = Array.isArray(devcontainer.appPort) ? devcontainer.appPort : [];
const forwardedPorts = Array.isArray(devcontainer.forwardPorts) ? devcontainer.forwardPorts : [];
/** @type {{ label?: string; command?: string }[]} */
const tasks = Array.isArray(vscodeTasks.tasks) ? vscodeTasks.tasks : [];
/**
 * @type {{
 *   name?: string;
 *   type?: string;
 *   command?: string;
 *   serverReadyAction?: { uriFormat?: string; action?: string };
 * }[]}
 */
const launchConfigurations = Array.isArray(vscodeLaunch.configurations)
	? vscodeLaunch.configurations
	: [];
/** @type {string[]} */
const failures = [];

for (const [port, expectedAttributes] of expectedForwarding) {
	if (!forwardedPorts.includes(port)) {
		failures.push(`forwardPorts must include container port ${port}.`);
	}

	const attributes = devcontainer.portsAttributes?.[String(port)];
	if (!attributes) {
		failures.push(`portsAttributes must configure port ${port}.`);
		continue;
	}

	for (const [attribute, expectedValue] of Object.entries(expectedAttributes)) {
		if (attributes[attribute] !== expectedValue) {
			failures.push(`port ${port} must set ${attribute} to ${expectedValue}.`);
		}
	}

	if (attributes.requireLocalPort !== true) {
		failures.push(`port ${port} must require the same local port.`);
	}
}

if (forwardedPorts.length !== expectedForwarding.size) {
	failures.push('forwardPorts must contain only the reviewed Astro and Playwright ports.');
}

if (appPorts.length > 0) {
	failures.push('appPort must remain empty when VS Code forwards development ports.');
}

const configuredPortAttributes = Object.keys(devcontainer.portsAttributes ?? {});
if (
	configuredPortAttributes.length !== expectedForwarding.size ||
	configuredPortAttributes.some(port => !expectedForwarding.has(Number(port)))
) {
	failures.push('portsAttributes must configure only the reviewed forwarded ports.');
}

if (packageJson.scripts?.dev !== 'astro dev') {
	failures.push('dev must use the standard Astro server for VS Code forwarding.');
}

if ('dev:host' in (packageJson.scripts ?? {})) {
	failures.push('dev:host must remain removed after migrating to VS Code forwarding.');
}

if (
	packageJson.scripts?.['test:e2e:report'] !==
	'playwright show-report playwright-report --host 127.0.0.1 --port 9323'
) {
	failures.push('test:e2e:report must serve the local report on container loopback port 9323.');
}

const developmentTask = tasks.find(task => task.label === 'Portfolio: Start Dev Server');
if (developmentTask?.command !== 'bun run dev') {
	failures.push('VS Code must expose a task that starts the forwarded Astro server.');
}

const developmentLaunch = launchConfigurations.find(
	configuration => configuration.name === 'Portfolio: Dev Server + Browser'
);
if (
	developmentLaunch?.type !== 'node-terminal' ||
	developmentLaunch?.command !== 'bun run dev' ||
	developmentLaunch?.serverReadyAction !== undefined
) {
	failures.push(
		'VS Code must start Astro and rely on port forwarding as the single automatic browser opener.'
	);
}

if (failures.length > 0) {
	console.error('Devcontainer port-forwarding contract validation failed:');
	for (const failure of failures) console.error(`- ${failure}`);
	process.exit(1);
}

console.log(
	'Devcontainer forwarding contract verified: Astro and Playwright reports use fixed VS Code-forwarded localhost ports.'
);
