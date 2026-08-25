import { defineConfig, devices } from '@playwright/test';

const playwrightHost = '127.0.0.1';
const playwrightPort = 4322;
const playwrightBaseUrl = `http://${playwrightHost}:${playwrightPort}`;

export default defineConfig({
	testDir: './tests/e2e',
	testMatch: '**/*.spec.ts',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 4 : undefined,
	reporter: [
		['html', { outputFolder: 'playwright-report' }],
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
		command: process.env.CI
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
			use: { ...devices['Desktop Firefox'] },
		},
		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] },
		},
		{
			name: 'Mobile Chrome',
			use: { ...devices['Pixel 5'] },
		},
		{
			name: 'Mobile Safari',
			use: { ...devices['iPhone 12'] },
		},
	],
});
