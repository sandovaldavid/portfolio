import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');
const readJson = (path: string): unknown => JSON.parse(readSource(path));

const playwrightConfig = readSource('playwright.config.ts');
const mainQualityWorkflow = readSource('.github/workflows/main-quality.yml');
const scheduledWorkflow = readSource('.github/workflows/scheduled-quality.yml');
const setupPlaywrightAction = readSource('.github/actions/setup-playwright/action.yml');
const packageJson = readJson('package.json') as { scripts: Record<string, string> };
const fastLighthouseConfig = readJson('.lighthouserc.json') as {
	ci: { collect: { numberOfRuns: number; settings: { onlyCategories: string[] } } };
};
const extendedLighthouseConfig = readJson('.lighthouserc.extended.json') as {
	ci: { collect: { numberOfRuns: number; settings: { onlyCategories: string[] } } };
};

describe('Main Quality pre-merge gate stays fast', () => {
	it('runs Playwright with more than one worker in CI', () => {
		expect(playwrightConfig).toMatch(/workers:\s*process\.env\.CI\s*\?\s*[2-9]\d*\s*:/);
	});

	it('scopes the required pre-merge browser suite to Chromium only', () => {
		expect(mainQualityWorkflow).toContain('name: Main Chromium Suite');
		expect(mainQualityWorkflow).toContain('browsers: chromium');
		expect(mainQualityWorkflow).not.toContain('browsers: chromium firefox webkit');
		expect(mainQualityWorkflow).not.toContain(
			'bunx playwright install --with-deps chromium firefox webkit'
		);
	});

	it('caches Playwright browser binaries instead of reinstalling every run', () => {
		expect(setupPlaywrightAction).toContain('actions/cache@v6');
		expect(setupPlaywrightAction).toContain('~/.cache/ms-playwright');
		expect(mainQualityWorkflow).toContain('./.github/actions/setup-playwright');
		expect(scheduledWorkflow).toContain('./.github/actions/setup-playwright');
	});

	it('runs a single performance-only Lighthouse pass in the pre-merge gate', () => {
		expect(fastLighthouseConfig.ci.collect.numberOfRuns).toBe(1);
		expect(fastLighthouseConfig.ci.collect.settings.onlyCategories).toEqual(['performance']);
	});

	it('keeps the full multi-category Lighthouse audit for the weekly scheduled run', () => {
		expect(extendedLighthouseConfig.ci.collect.numberOfRuns).toBe(3);
		expect(extendedLighthouseConfig.ci.collect.settings.onlyCategories).toEqual(
			expect.arrayContaining(['performance', 'accessibility', 'best-practices', 'seo'])
		);
		expect(packageJson.scripts['lighthouse:collect:extended']).toContain(
			'.lighthouserc.extended.json'
		);
		expect(packageJson.scripts['lighthouse:assert:extended']).toContain(
			'.lighthouserc.extended.json'
		);
		expect(scheduledWorkflow).toContain('lighthouse:collect:extended');
		expect(scheduledWorkflow).toContain('lighthouse:assert:extended');
	});
});
