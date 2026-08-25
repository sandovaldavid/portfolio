import { defineConfig, devices } from '@playwright/test';

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
		baseURL: 'http://localhost:4321',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
	},
	webServer: {
		command: process.env.CI ? 'bun run preview' : 'bun run astro build && bun run preview',
		url: 'http://localhost:4321',
		reuseExistingServer: !process.env.CI,
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
