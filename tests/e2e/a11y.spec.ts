import { test, expect } from './fixtures';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

const KEY_PAGES = [
	{ path: '/', name: 'Homepage EN' },
	{ path: '/es/', name: 'Homepage ES' },
	{ path: '/about', name: 'About EN' },
	{ path: '/es/about', name: 'About ES' },
	{ path: '/projects', name: 'Projects EN' },
	{ path: '/es/projects', name: 'Projects ES' },
	{ path: '/research', name: 'Research EN' },
	{ path: '/es/research', name: 'Research ES' },
	{ path: '/skills', name: 'Skills EN' },
	{ path: '/es/skills', name: 'Skills ES' },
	{ path: '/components', name: 'Components EN' },
	{ path: '/es/components', name: 'Components ES' },
	{ path: '/blog', name: 'Blog EN' },
	{ path: '/es/blog', name: 'Blog ES' },
	{ path: '/route-probe-404', name: '404 EN' },
	{ path: '/es/route-probe-404', name: '404 ES' },
] as const;

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const;

function runAxe(page: Page) {
	return new AxeBuilder({ page }).withTags([...WCAG_TAGS]).analyze();
}

test.describe('Accessibility — axe-core scan (dark theme)', () => {
	for (const { path, name } of KEY_PAGES) {
		test(`${name} (${path}) should have no serious a11y violations`, async ({ page }) => {
			await page.goto(path);
			await page.evaluate(() => {
				localStorage.setItem('theme', 'dark');
				document.documentElement.classList.add('dark');
			});
			await page.reload();
			await page.waitForLoadState('domcontentloaded');
			await page.waitForLoadState('networkidle');

			// Disable transitions and animations to prevent scanning elements in mid-animation states (e.g. low opacity)
			await page.addStyleTag({
				content: `
					*, *::before, *::after {
						animation-delay: -1ms !important;
						animation-duration: 0s !important;
						animation-iteration-count: 1 !important;
						transition-duration: 0s !important;
						transition-delay: 0s !important;
					}
				`,
			});

			const results = await runAxe(page);

			const failures = results.violations.filter(
				v => v.impact === 'critical' || v.impact === 'serious'
			);

			if (failures.length > 0) {
				console.log(
					`[${name}] ${failures.length} serious/critical violation(s):`,
					failures.map(f => `${f.id}: ${f.help} (${f.impact})`).join('; ')
				);
			}
			expect(failures).toEqual([]);
		});
	}
});

test.describe('Accessibility — axe-core scan (light theme)', () => {
	for (const { path, name } of KEY_PAGES) {
		test(`${name} (${path}) in light theme should have no serious a11y violations`, async ({
			page,
		}) => {
			await page.goto(path);
			await page.evaluate(() => {
				localStorage.setItem('theme', 'light');
				document.documentElement.classList.remove('dark');
			});
			await page.reload();
			await page.waitForLoadState('domcontentloaded');
			await page.waitForLoadState('networkidle');

			// Disable transitions and animations to prevent scanning elements in mid-animation states (e.g. low opacity)
			await page.addStyleTag({
				content: `
					*, *::before, *::after {
						animation-delay: -1ms !important;
						animation-duration: 0s !important;
						animation-iteration-count: 1 !important;
						transition-duration: 0s !important;
						transition-delay: 0s !important;
					}
				`,
			});

			const results = await runAxe(page);

			const failures = results.violations.filter(
				v => v.impact === 'critical' || v.impact === 'serious'
			);

			if (failures.length > 0) {
				console.log(
					`[${name}] ${failures.length} serious/critical violation(s):`,
					failures.map(f => `${f.id}: ${f.help} (${f.impact})`).join('; ')
				);
			}
			expect(failures).toEqual([]);
		});
	}
});

test.describe('Accessibility — image alt text', () => {
	test('all <img> elements should have alt attribute', async ({ page }) => {
		await page.goto('/');
		const images = page.locator('img');
		const count = await images.count();

		for (let i = 0; i < count; i++) {
			const alt = await images.nth(i).getAttribute('alt');
			expect(alt, `Image ${i} is missing alt text`).not.toBeNull();
		}
	});

	test('homepage avatar has descriptive alt text', async ({ page }) => {
		await page.goto('/');
		const avatar = page.locator('img[alt*="David"]').first();
		await expect(avatar).toBeVisible();
	});
});

test.describe('Accessibility — focus-visible', () => {
	test('skip-to-content link should be visible on Tab', async ({ page }) => {
		await page.goto('/');
		await page.keyboard.press('Tab');
		const skipLink = page.locator('a[href="#main-content"]');
		await expect(skipLink).toBeVisible();
		const href = await skipLink.getAttribute('href');
		expect(href).toBe('#main-content');
	});

	test('interactive elements should have visible focus ring', async ({ page }) => {
		await page.goto('/about');
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');
		const focused = page.locator(':focus');
		const outline = await focused.evaluate(el => getComputedStyle(el).outlineStyle);
		expect(outline).not.toBe('none');
	});
});

test.describe('Accessibility — reduced-motion', () => {
	test('animations should be suppressed with prefers-reduced-motion', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto('/');

		const animatedElements = page.locator('.animate-pulse');
		const count = await animatedElements.count();

		for (let i = 0; i < count; i++) {
			const duration = await animatedElements
				.nth(i)
				.evaluate(el => getComputedStyle(el).animationDuration);
			expect(parseFloat(duration)).toBeLessThan(0.02);
		}
	});
});

// Smoke test: ensure axe reports no critical issues on the homepage as minimum bar
test.describe('Accessibility — CI gate (smoke)', () => {
	test('homepage should have zero critical violations', async ({ page }) => {
		await page.goto('/');
		const results = await runAxe(page);
		const critical = results.violations.filter(v => v.impact === 'critical');
		expect(critical).toEqual([]);
	});
});
