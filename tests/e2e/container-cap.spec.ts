import { expect, test } from '@playwright/test';

/*
 * Layout container contract: every page's primary content mass stays centered
 * inside the 1280px desktop cap even on a 1920px viewport. The contract guards
 * the cap and centering rather than assuming every route must fill a >1000px
 * width; editorial pages may intentionally use a narrower reading measure.
 */
const routes = [
	'/',
	'/experience/atena-software-engineer',
	'/research',
	'/projects',
	'/blog',
	'/skills',
	'/about',
];

test.describe('wide viewport container cap', () => {
	for (const route of routes) {
		test(`${route} keeps its content mass centered within 1280px on a 1920w viewport`, async ({
			page,
		}) => {
			await page.setViewportSize({ width: 1920, height: 1080 });
			await page.goto(route);

			const capped = await page.evaluate(() => {
				let node: HTMLElement | null = document.getElementById('main-content');
				while (node && node !== document.body) {
					const box = node.getBoundingClientRect();
					const width = Math.round(box.width);
					if (width > 0 && width <= 1281) {
						return {
							width,
							left: box.left,
							clientWidth: document.documentElement.clientWidth,
						};
					}
					node = node.firstElementChild as HTMLElement | null;
				}
				return null;
			});

			expect(capped, `expected a capped content container on ${route}`).not.toBeNull();
		expect(capped!.width).toBeLessThanOrEqual(1281);
		const expectedLeft = (capped!.clientWidth - capped!.width) / 2;
		expect(Math.abs(capped!.left - expectedLeft)).toBeLessThanOrEqual(2);
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth)
		).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth));
		});
	}
});
