import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';

/**
 * Required automated coverage for issue #245 (Identity System typography
 * alignment): font family, font size, line height, one-H1 rule, unbroken
 * heading hierarchy, no horizontal overflow at mobile width, Light/Dark
 * parity and a 200%-zoom-equivalent reflow check, for every route the
 * issue names explicitly.
 */

const ROUTES = [
	{ path: '/blog/', name: 'Blog listing (EN)' },
	{ path: '/es/blog/', name: 'Blog listing (ES)' },
	{ path: '/blog/building-this-portfolio-with-astro-and-fsd/', name: 'Blog article (EN)' },
	{ path: '/es/blog/building-this-portfolio-with-astro-and-fsd/', name: 'Blog article (ES)' },
	{ path: '/projects/yukidoke/', name: 'Yukidoke case study (EN)' },
	{ path: '/es/projects/yukidoke/', name: 'Yukidoke case study (ES)' },
];

async function useTheme(page: Page, theme: 'light' | 'dark') {
	await page.addInitScript(selectedTheme => {
		localStorage.setItem('theme', selectedTheme);
	}, theme);
}

function hasHorizontalOverflow() {
	return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
}

function h1Metrics() {
	const h1 = document.querySelector('main h1');
	if (!h1) return null;
	const style = getComputedStyle(h1);
	return {
		fontFamily: style.fontFamily,
		fontSize: parseFloat(style.fontSize),
		lineHeight: parseFloat(style.lineHeight),
	};
}

function bodyParagraphMetrics() {
	const paragraphs = Array.from(document.querySelectorAll('main p'));
	const candidate = paragraphs.find(p => (p.textContent ?? '').trim().length > 40);
	if (!candidate) return null;
	const style = getComputedStyle(candidate);
	return {
		fontFamily: style.fontFamily,
		fontSize: parseFloat(style.fontSize),
		lineHeight: parseFloat(style.lineHeight),
	};
}

for (const { path, name } of ROUTES) {
	test.describe(name, () => {
		test('h1 uses the JetBrains Mono page-title role at desktop width', async ({ page }) => {
			await page.setViewportSize({ width: 1280, height: 900 });
			await page.goto(path);

			const metrics = await page.evaluate(h1Metrics);
			expect(metrics, 'expected a visible <h1> inside <main>').not.toBeNull();
			expect(metrics!.fontFamily).toMatch(/JetBrains Mono/i);
			expect(metrics!.fontSize).toBeCloseTo(48, 0);
			expect(metrics!.lineHeight).toBeCloseTo(56, 0);
		});

		test('body copy uses the Inter body role', async ({ page }) => {
			await page.goto(path);

			const metrics = await page.evaluate(bodyParagraphMetrics);
			expect(
				metrics,
				'expected a representative <p> with reading copy inside <main>'
			).not.toBeNull();
			expect(metrics!.fontFamily).toMatch(/Inter/i);
			expect(metrics!.fontSize).toBeCloseTo(16, 0);
			expect(metrics!.lineHeight).toBeCloseTo(26, 0);
		});

		test('one H1, no skipped heading levels', async ({ page }) => {
			await page.goto(path);

			const levels = await page
				.locator('main :is(h1, h2, h3, h4, h5, h6)')
				.evaluateAll(headings => headings.map(h => Number(h.tagName[1])));

			expect(levels.filter(level => level === 1)).toHaveLength(1);
			let maxSeen = 0;
			for (const level of levels) {
				expect(level).toBeLessThanOrEqual(maxSeen + 1);
				maxSeen = Math.max(maxSeen, level);
			}
		});

		test('no horizontal overflow at 390px and 320px width', async ({ page }) => {
			for (const width of [390, 320]) {
				await page.setViewportSize({ width, height: 844 });
				await page.goto(path);
				const overflowing = await page.evaluate(hasHorizontalOverflow);
				expect(overflowing, `horizontal overflow at ${width}px`).toBe(false);
			}
		});

		test('Light and Dark mode keep the same type roles', async ({ page }) => {
			await page.setViewportSize({ width: 1280, height: 900 });

			await useTheme(page, 'light');
			await page.goto(path);
			const light = await page.evaluate(h1Metrics);

			await useTheme(page, 'dark');
			await page.goto(path);
			const dark = await page.evaluate(h1Metrics);

			expect(light).not.toBeNull();
			expect(dark).not.toBeNull();
			expect(dark!.fontFamily).toBe(light!.fontFamily);
			expect(dark!.fontSize).toBeCloseTo(light!.fontSize, 0);
			expect(dark!.lineHeight).toBeCloseTo(light!.lineHeight, 0);

			const overflowing = await page.evaluate(hasHorizontalOverflow);
			expect(overflowing, 'horizontal overflow in dark mode').toBe(false);
		});

		test('200% zoom equivalent (halved viewport) reflows without horizontal scroll', async ({
			page,
		}) => {
			// Playwright has no cross-browser "zoom" API; halving the viewport a
			// user would normally see reproduces the same available space a 200%
			// browser zoom would leave, which is what the reflow guarantee cares about.
			await page.setViewportSize({ width: 640, height: 450 });
			await page.goto(path);

			const overflowing = await page.evaluate(hasHorizontalOverflow);
			expect(overflowing, 'horizontal overflow at 200%-zoom-equivalent width').toBe(false);

			const h1Count = await page.locator('main h1').count();
			expect(h1Count).toBe(1);
		});
	});
}
