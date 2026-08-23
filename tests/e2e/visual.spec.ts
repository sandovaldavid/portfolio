import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';

const skipVisualInCi = !!process.env.CI && process.env.RUN_VISUAL_TESTS !== 'true';

/**
 * Prepares the page for visual regression testing by:
 * 1. Waiting for the DOM and network to be idle.
 * 2. Ensuring all images are fully loaded.
 * 3. Hiding fixed/absolute floating overlays (header, sidebar, Recruiter HUD) that overlap screenshots.
 * 4. Disabling smooth scrolling and css transitions/animations to prevent rendering flakiness.
 */
async function preparePage(page: Page, path: string, options: { hideHeader?: boolean } = {}) {
	const { hideHeader = true } = options;

	await page.goto(path);
	await page.waitForLoadState('domcontentloaded');
	await page.waitForLoadState('networkidle');
	await page.evaluate(async () => {
		const images = Array.from(document.querySelectorAll('img'));
		await Promise.all(
			images.map(img => {
				if (img.complete) return Promise.resolve();
				return new Promise(resolve => {
					img.addEventListener('load', resolve);
					img.addEventListener('error', resolve);
				});
			})
		);
	});

	// Hide current overlay roots so fixed controls cannot contaminate element snapshots.
	const selectorsToHide = [
		'aside#contact-sidebar',
		'#recruiter-hud',
		'#cli-overlay',
		'#cli-i18n',
		'#shortcuts-modal',
		'#easter-egg-overlay',
	];
	if (hideHeader) {
		selectorsToHide.push('header');
	}

	await page.addStyleTag({
		content: `
			${selectorsToHide.join(', ')} {
				display: none !important;
			}

			html, body {
				scroll-behavior: auto !important;
			}

			*, *::before, *::after {
				animation-delay: -1ms !important;
				animation-duration: 0s !important;
				animation-iteration-count: 1 !important;
				transition-duration: 0s !important;
				transition-delay: 0s !important;
			}
		`,
	});
	await page.waitForTimeout(300);
}

test.describe('Visual regression — Hero section', () => {
	test.skip(skipVisualInCi, 'Visual regressions run only in scheduled/manual CI');

	test('homepage hero should match baseline (EN dark)', async ({ page }) => {
		await preparePage(page, '/');
		const hero = page.locator('#hero');
		await expect(hero).toBeVisible();
		await expect(hero).toHaveScreenshot('hero-en-dark.png', { maxDiffPixelRatio: 0.05 });
	});

	test('homepage hero should render correctly in ES', async ({ page }) => {
		await preparePage(page, '/es/');
		const hero = page.locator('#hero');
		await expect(hero).toBeVisible();
		await expect(hero).toHaveScreenshot('hero-es-dark.png', { maxDiffPixelRatio: 0.05 });
	});
});

test.describe('Visual regression — Navigation & Main sections', () => {
	test.skip(skipVisualInCi, 'Visual regressions run only in scheduled/manual CI');

	test('header navbar should match baseline', async ({ page }) => {
		await preparePage(page, '/', { hideHeader: false });
		const header = page.locator('header').first();
		await expect(header).toBeVisible();
		await expect(header).toHaveScreenshot('header-navbar.png', { maxDiffPixelRatio: 0.05 });
	});

	for (const { selector, snapshot } of [
		{ selector: '#experience', snapshot: 'experience-section.png' },
		{ selector: '#research', snapshot: 'research-section.png' },
		{ selector: '#projects', snapshot: 'projects-section.png' },
		{ selector: '#about-me', snapshot: 'about-me-section.png' },
		{ selector: '#technologies', snapshot: 'technologies-section.png' },
	] as const) {
		test(`${selector} should match baseline`, async ({ page }) => {
			await preparePage(page, '/');
			const section = page.locator(selector).first();
			await section.scrollIntoViewIfNeeded();
			await expect(section).toBeVisible();
			await expect(section).toHaveScreenshot(snapshot, { maxDiffPixelRatio: 0.05 });
		});
	}

	test('footer should match baseline', async ({ page }) => {
		await preparePage(page, '/');
		const footer = page.locator('footer#contact');
		await footer.scrollIntoViewIfNeeded();
		await expect(footer).toBeVisible();
		await expect(footer).toHaveScreenshot('footer.png', { maxDiffPixelRatio: 0.05 });
	});
});
