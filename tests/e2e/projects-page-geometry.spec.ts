import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

/*
 * Focused regression for Projects Catalog geometry. Project Detail MDX geometry
 * is covered separately by project-case-study-layout.spec.ts.
 */

type Viewport = { width: number; height: number; label: string };

const DESKTOP: Viewport = { width: 1440, height: 900, label: 'desktop' };
const TABLET: Viewport = { width: 834, height: 1100, label: 'tablet' };
const MOBILE: Viewport = { width: 390, height: 844, label: 'mobile' };

async function useTheme(page: Page, theme: 'light' | 'dark') {
	await page.evaluate(selected => {
		localStorage.setItem('theme', selected);
		document.documentElement.classList.toggle('dark', selected === 'dark');
	}, theme);
}

async function expectNoHorizontalOverflow(page: Page) {
	const overflow = await page.evaluate(
		() => document.documentElement.scrollWidth - document.documentElement.clientWidth
	);
	expect(overflow).toBeLessThanOrEqual(1);
}

for (const localePrefix of ['', '/es']) {
	test.describe(`Projects catalog geometry ${localePrefix || 'en'}`, () => {
		for (const viewport of [DESKTOP, TABLET, MOBILE]) {
			for (const theme of ['light', 'dark'] as const) {
				test(`catalog stays centered without overflow at ${viewport.label} (${theme})`, async ({
					page,
				}) => {
					await page.setViewportSize({ width: viewport.width, height: viewport.height });
					await page.goto(`${localePrefix}/projects`);
					await useTheme(page, theme);

					await expectNoHorizontalOverflow(page);
					await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
					await expect(page.locator('[data-projects-catalog-snapshot]')).toBeVisible();

					const cards = page.locator('article');
					await expect(cards.first()).toBeVisible();

					if (viewport.label === 'desktop') {
						const headingBox = (await page
							.getByRole('heading', { level: 1 })
							.boundingBox())!;
						expect(headingBox.width).toBeLessThanOrEqual(720);
						const introPanelBox = (await page
							.locator('main header div')
							.filter({ has: page.getByRole('heading', { level: 1 }) })
							.locator('xpath=following-sibling::*[1]')
							.first()
							.boundingBox())!;
						expect(Math.round(introPanelBox.x)).toBeGreaterThanOrEqual(860);

						// 592 + 32 + 592 uses 1216px of the 1280px shell.
						const first = (await cards.nth(0).boundingBox())!;
						const second = (await cards.nth(1).boundingBox())!;
						expect(first.width).toBe(592);
						expect(second.width).toBe(592);
						expect(Math.round(first.x)).toBe(112);
						expect(Math.round(second.x)).toBe(736);
					}

					if (viewport.label === 'tablet') {
						const first = (await cards.nth(0).boundingBox())!;
						const second = (await cards.nth(1).boundingBox())!;
						expect(first.width).toBe(369);
						expect(second.width).toBe(369);
						expect(Math.round(second.x - first.x)).toBe(401);
					}

					if (viewport.label === 'mobile') {
						const first = (await cards.nth(0).boundingBox())!;
						expect(first.width).toBe(340);
					}
				});
			}
		}
	});
}
