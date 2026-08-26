import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

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

test.describe('404 localized fallback', () => {
	for (const viewport of VIEWPORTS) {
		for (const locale of ['en', 'es'] as const) {
			for (const theme of THEMES) {
				test(`404 ${locale} follows the ${viewport.label} contract in ${theme}`, async ({ page }) => {
					await page.setViewportSize({ width: viewport.width, height: viewport.height });
					await page.goto(locale === 'en' ? '/route-probe-404' : '/es/route-probe-404');
					await setTheme(page, theme);

					await expect(page.locator('header[data-header]')).toBeVisible();
					await expect(page.locator('footer')).toBeVisible();
					await expect(page.locator('html')).toHaveAttribute('lang', locale);
					await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
						'content',
						'noindex, follow'
					);

					const goBack = page.getByRole('button', { name: /go back|volver/i });
					const goHome = page.getByRole('link', { name: /go to home|ir al inicio/i }).first();
					await expect(goBack).toBeVisible();
					await expect(goHome).toBeVisible();

					const backBox = (await goBack.boundingBox())!;
					const homeBox = (await goHome.boundingBox())!;
					expect(Math.round(backBox.height)).toBe(44);
					expect(Math.round(homeBox.height)).toBe(44);

					if (viewport.label === 'mobile') {
						expect(homeBox.y).toBeLessThan(backBox.y);
						expect(homeBox.width).toBeGreaterThanOrEqual(330);
						expect(homeBox.width).toBeLessThanOrEqual(345);
						const gap = backBox.y - (homeBox.y + homeBox.height);
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

test.describe('Components Showcase contract', () => {
	const contractSections = {
		en: ['Buttons', 'Badges', 'Tech pills', 'Links', 'Social pills', 'Avatars'],
		es: ['Botones', 'Badges', 'Tech pills', 'Enlaces', 'Social pills', 'Avatares'],
	} as const;

	for (const viewport of VIEWPORTS) {
		for (const locale of ['en', 'es'] as const) {
			for (const theme of THEMES) {
				test(`showcase ${locale} covers Shared UI at ${viewport.label} in ${theme}`, async ({ page }) => {
					await page.setViewportSize({ width: viewport.width, height: viewport.height });
					await page.goto(locale === 'en' ? '/components' : '/es/components');
					await setTheme(page, theme);

					await expect(page.locator('[data-showcase-panel]')).toHaveCount(6);
					const panelHeadings = await page
						.locator('[data-showcase-panel] h3')
						.evaluateAll(elements =>
							elements.map(element => (element.textContent ?? '').replace(/\s+/g, ' ').trim())
						);
					expect(panelHeadings).toEqual([...contractSections[locale]]);

					const shellHeading = locale === 'en' ? 'Shell components' : 'Componentes de shell';
					await expect(page.getByRole('heading', { level: 2, name: shellHeading })).toBeVisible();

					// The page demonstrates only the two lockups present in the approved screen:
					// full signature and compact mark. The global header is intentionally excluded.
					const logos = page.locator('main').locator('.brand-logo-link');
					await expect(logos).toHaveCount(2);
					await expect(page.locator('main').locator('.brand-logo-signature')).toHaveCount(1);

					await expectNoHorizontalOverflow(page);
				});
			}
		}
	}
});
