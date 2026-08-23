import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

/*
 * Focused regression for the final Figma v2 page plans:
 * - 404 geometry and localized button stack (plans/pages/404.md + spec/04):
 *   two 190x44 buttons in a row on desktop/tablet, stacked full-width 340x44
 *   with a 16px gap on mobile.
 * - Components Showcase contract sections incl. Brand Logo lockups
 *   (plans/pages/components-showcase.md + spec/04).
 * Every surface is probed at the three canonical viewports in light and dark
 * with zero horizontal overflow.
 */

const VIEWPORTS = [
	{ width: 1440, height: 900, label: 'desktop' },
	{ width: 834, height: 1100, label: 'tablet' },
	{ width: 390, height: 844, label: 'mobile' },
] as const;
const THEMES = ['light', 'dark'] as const;

async function setTheme(page: Page, theme: 'light' | 'dark') {
	await page.evaluate(
		selected => {
			localStorage.setItem('theme', selected);
			document.documentElement.classList.toggle('dark', selected === 'dark');
		},
		theme satisfies 'light' | 'dark'
	);
	await page.reload();
	await page.waitForLoadState('domcontentloaded');
}

async function expectNoHorizontalOverflow(page: Page) {
	const overflow = await page.evaluate(
		() => document.scrollingElement!.scrollWidth - document.documentElement.clientWidth
	);
	expect(overflow).toBeLessThanOrEqual(0);
}

test.describe('404 localized button stack', () => {
	for (const viewport of VIEWPORTS) {
		for (const locale of ['en', 'es'] as const) {
			for (const theme of THEMES) {
				test(`404 ${locale} buttons follow the ${viewport.label} stack in ${theme}`, async ({
					page,
				}) => {
					await page.setViewportSize({ width: viewport.width, height: viewport.height });
					await page.goto(locale === 'en' ? '/route-probe-404' : '/es/route-probe-404');
					await setTheme(page, theme);

					const goBack = page.getByRole('button', { name: /go back|volver/i });
					const returnHome = page.getByRole('link', {
						name: /return to home|volver al inicio/i,
					});
					await expect(goBack).toBeVisible();
					await expect(returnHome).toBeVisible();

					const backBox = (await goBack.boundingBox())!;
					const homeBox = (await returnHome.boundingBox())!;

					expect(Math.round(backBox.height)).toBe(44);
					expect(Math.round(homeBox.height)).toBe(44);

					if (viewport.label === 'mobile') {
						expect(backBox.y).toBeLessThan(homeBox.y);
						expect(backBox.width).toBeGreaterThanOrEqual(330);
						expect(backBox.width).toBeLessThanOrEqual(345);
						const gap = homeBox.y - (backBox.y + backBox.height);
						expect(Math.round(gap)).toBe(16);
					} else {
						expect(Math.abs(backBox.y - homeBox.y)).toBeLessThan(2);
						expect(Math.round(backBox.width)).toBe(190);
						expect(Math.round(homeBox.width)).toBe(190);
					}

					await expectNoHorizontalOverflow(page);
				});
			}
		}
	}
});

test.describe('Components Showcase contract sections', () => {
	const contractSections = {
		en: [
			'Buttons',
			'Badges',
			'Tech pills',
			'Links',
			'Social pills',
			'Avatars',
			'Shell components',
		],
		es: [
			'Botones',
			'Badges',
			'Tech pills',
			'Enlaces',
			'Social pills',
			'Avatares',
			'Componentes de shell',
		],
	} as const;

	for (const viewport of VIEWPORTS) {
		for (const locale of ['en', 'es'] as const) {
			for (const theme of THEMES) {
				test(`showcase ${locale} covers the contract list at ${viewport.label} in ${theme}`, async ({
					page,
				}) => {
					await page.setViewportSize({ width: viewport.width, height: viewport.height });
					await page.goto(locale === 'en' ? '/components' : '/es/components');
					await setTheme(page, theme);

					const headings = await page
						.locator('h2')
						.evaluateAll(elements =>
							elements.map(element =>
								(element.textContent ?? '')
									.replace(/\s+/g, ' ')
									.trim()
									.toLowerCase()
							)
						);

					let cursor = -1;
					for (const expected of contractSections[locale]) {
						const index = headings.indexOf(expected.toLowerCase(), cursor + 1);
						expect(index, `missing section "${expected}"`).toBeGreaterThan(cursor);
						cursor = index;
					}

					// Brand logo lockups render production markup with theme-synced assets.
					// Scoped to main so the site header's own lockup stays out of the count.
					const logos = page.locator('main').locator('.brand-logo-link');
					await expect(logos).toHaveCount(3);
					const signatures = page.locator('main').locator('.brand-logo-signature');
					if (viewport.width >= 1024) {
						// Responsive + pinned-full show the signature; pinned-compact hides it.
						await expect(signatures.locator('visible=true')).toHaveCount(2);
					} else {
						await expect(signatures.locator('visible=true')).toHaveCount(1);
					}

					await expect(page.locator('.showcase-panel-default')).toBeVisible();
					await expectNoHorizontalOverflow(page);
				});
			}
		}
	}
});
