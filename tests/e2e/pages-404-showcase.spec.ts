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
				test(`404 ${locale} follows the ${viewport.label} contract in ${theme}`, async ({
					page,
				}) => {
					await page.setViewportSize({ width: viewport.width, height: viewport.height });
					await page.goto(locale === 'en' ? '/route-probe-404' : '/es/route-probe-404');
					await setTheme(page, theme);

					await expect(page.locator('header[data-header]')).toBeVisible();
					const footer = page.locator('footer');
					await expect(footer).toBeAttached();
					await expect(page.locator('html')).toHaveAttribute('lang', locale);
					await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
						'content',
						'noindex, follow'
					);

					const footerBox = await footer.boundingBox();
					expect(footerBox).not.toBeNull();
					expect(footerBox!.y).toBeGreaterThanOrEqual(viewport.height);

					const goBack = page.getByRole('button', { name: /go back|volver/i });
					const goHome = page
						.getByRole('link', { name: /go to home|ir al inicio/i })
						.first();
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

test.describe('Skills page contract', () => {
	for (const viewport of VIEWPORTS) {
		for (const locale of ['en', 'es'] as const) {
			for (const theme of THEMES) {
				test(`skills ${locale} follows the ${viewport.label} contract in ${theme}`, async ({
					page,
				}) => {
					await page.setViewportSize({ width: viewport.width, height: viewport.height });
					await page.goto(locale === 'en' ? '/skills' : '/es/skills');
					await setTheme(page, theme);

					await expect(
						page.getByRole('heading', {
							level: 1,
							name: locale === 'en' ? 'Skills' : 'Habilidades',
						})
					).toBeVisible();

					const coreStack = page.locator('[data-skills-core-stack]');
					await expect(coreStack).toBeVisible();
					await expect(coreStack.locator('.tech-pill')).toHaveCount(8);

					const categories = page.locator('[data-skills-category]');
					await expect(categories).toHaveCount(3);
					await expect(page.locator('[data-skills-supporting]')).toBeVisible();

					const categoryBoxes = await categories.evaluateAll(elements =>
						elements
							.map(element => element.getBoundingClientRect())
							.map(rect => ({
								x: rect.x,
								y: rect.y,
								width: rect.width,
							}))
					);

					if (viewport.label === 'mobile') {
						expect(categoryBoxes[0].y).toBeLessThan(categoryBoxes[1].y);
						expect(categoryBoxes[1].y).toBeLessThan(categoryBoxes[2].y);
					} else {
						expect(Math.abs(categoryBoxes[0].y - categoryBoxes[1].y)).toBeLessThan(2);
						expect(categoryBoxes[0].width).toBeGreaterThan(0);
						expect(categoryBoxes[1].width).toBeGreaterThan(0);
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
				test(`showcase ${locale} covers Shared UI at ${viewport.label} in ${theme}`, async ({
					page,
				}) => {
					await page.setViewportSize({ width: viewport.width, height: viewport.height });
					await page.goto(locale === 'en' ? '/components' : '/es/components');
					await setTheme(page, theme);

					await expect(page.locator('[data-showcase-panel]')).toHaveCount(6);
					const panelHeadings = await page
						.locator('[data-showcase-panel] h3')
						.evaluateAll(elements =>
							elements.map(element =>
								(element.textContent ?? '').replace(/\s+/g, ' ').trim()
							)
						);
					expect(panelHeadings).toEqual([...contractSections[locale]]);

					const shellHeading =
						locale === 'en' ? 'Shell components' : 'Componentes de shell';
					await expect(
						page.getByRole('heading', { level: 2, name: shellHeading })
					).toBeVisible();

					// Both lockups share the same signature DOM for semantic consistency.
					// The compact variant hides that signature through the BrandLogo contract.
					const logos = page.locator('main').locator('.brand-logo-link');
					await expect(logos).toHaveCount(2);
					await expect(logos.nth(0).locator('.brand-logo-signature')).toBeVisible();
					await expect(logos.nth(1).locator('.brand-logo-signature')).toBeHidden();

					await expectNoHorizontalOverflow(page);
				});
			}
		}
	}
});
