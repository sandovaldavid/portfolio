import { defineConfig, devices } from '@playwright/test';

const playwrightHost = '127.0.0.1';
const playwrightPort = 4322;
const playwrightBaseUrl = `http://${playwrightHost}:${playwrightPort}`;
const isCi = Boolean(process.env.CI);
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
const useProductionPreview = process.env.E2E_USE_PRODUCTION_PREVIEW === '1' || isGitHubActions;

const canonicalChromiumOnlySpecs = [
	'**/brand-identity.spec.ts',
	'**/content-components-geometry.spec.ts',
	'**/design-system-colors.spec.ts',
	'**/experience-layout.spec.ts',
	'**/experience-section.spec.ts',
	'**/identity-system-typography.spec.ts',
	'**/navigation-focus-geometry.spec.ts',
	'**/project-case-study-layout.spec.ts',
	'**/projects-catalog.spec.ts',
	'**/projects-page-geometry.spec.ts',
	'**/research-page-layout.spec.ts',
	'**/typography.spec.ts',
	'**/visual.spec.ts',
];

function getWorkerOverride(value: string | undefined): number | undefined {
	if (!value) return undefined;

	const workers = Number(value);
	if (!Number.isInteger(workers) || workers < 1) {
		throw new Error('PLAYWRIGHT_WORKERS must be a positive integer');
	}

	return workers;
}

const workerOverride = getWorkerOverride(process.env.PLAYWRIGHT_WORKERS);
const workers = workerOverride ?? (isGitHubActions ? 4 : undefined);

export default defineConfig({
	testDir: './tests/e2e',
	testMatch: '**/*.spec.ts',
	fullyParallel: true,
	forbidOnly: isCi,
	retries: isGitHubActions ? 2 : 0,
	workers,
	reporter: [
		['html', { outputFolder: 'playwright-report', open: 'never' }],
		['json', { outputFile: 'test-results.json' }],
		['junit', { outputFile: 'junit-results.xml' }],
	],
	use: {
		baseURL: playwrightBaseUrl,
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
	},
	webServer: {
		command: useProductionPreview
			? `bun run astro preview --host ${playwrightHost} --port ${playwrightPort}`
			: `bun run astro build && bun run astro preview --host ${playwrightHost} --port ${playwrightPort}`,
		url: playwrightBaseUrl,
		reuseExistingServer: false,
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'firefox',
			testIgnore: canonicalChromiumOnlySpecs,
			use: { ...devices['Desktop Firefox'] },
		},
		{
			name: 'webkit',
			testIgnore: canonicalChromiumOnlySpecs,
			use: { ...devices['Desktop Safari'] },
		},
		{
			name: 'Mobile Chrome',
			testIgnore: canonicalChromiumOnlySpecs,
			use: { ...devices['Pixel 5'] },
		},
		{
			name: 'Mobile Safari',
			testIgnore: canonicalChromiumOnlySpecs,
			use: { ...devices['iPhone 12'] },
		},
	],
});
