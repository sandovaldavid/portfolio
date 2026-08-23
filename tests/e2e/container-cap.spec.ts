import { expect, test } from '@playwright/test';

/*
 * Layout container contract (spec/04 composition system): every page's
 * content mass centers inside the 1280px desktop container even on viewports
 * wider than 1440. Guards the regression where the unlayered overflow guard
 * (`#main-content > * > *` max-width) neutralized explicit container caps
 * because unlayered CSS beats layered utilities.
 */
const routes = ['/', '/atena', '/research', '/projects', '/blog', '/skills', '/about'];

test.describe('wide viewport container cap', () => {
	for (const route of routes) {
		test(`${route} caps its content mass at 1280px on a 1920w viewport`, async ({ page }) => {
			await page.setViewportSize({ width: 1920, height: 1080 });
			await page.goto(route);

			const cappedWidth = await page.evaluate(() => {
				let node: HTMLElement | null = document.getElementById('main-content');
				while (node && node !== document.body) {
					const width = Math.round(node.getBoundingClientRect().width);
					if (width > 0 && width <= 1281) return width;
					node = node.firstElementChild as HTMLElement | null;
				}
				return -1;
			});

			expect(cappedWidth).toBeGreaterThan(1000);
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth)
			).toBeLessThanOrEqual(1920);
		});
	}
});
