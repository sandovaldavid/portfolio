import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

/*
 * Focused regression for the Projects Catalog and Project Case Study pages
 * (spec/04 "Projects Catalog" and "Project Case Study — Kioku reference
 * layout"): intro split, centered card grid, panel stacks and the absence of
 * horizontal overflow at the three canonical viewports, in light and dark.
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

function narrativePanel(page: Page, name: RegExp) {
	return page.getByRole('heading', { name }).first().locator('xpath=ancestor::section[1]');
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

					const cards = page.locator('article');
					await expect(cards.first()).toBeVisible();

					if (viewport.label === 'desktop') {
						// Intro split: primary title column stays within its 720px half
						// and the secondary editorial panel starts at inner x800+.
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

						// Centered card pair: 520 + 32 + 520 inside the 1280 grid
						// (columns at abs x184 / x736).
						const first = (await cards.nth(0).boundingBox())!;
						const second = (await cards.nth(1).boundingBox())!;
						expect(first.width).toBe(520);
						expect(second.width).toBe(520);
						expect(Math.round(first.x)).toBe(184);
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

	test.describe(`Case study geometry ${localePrefix || 'en'}`, () => {
		for (const viewport of [DESKTOP, TABLET, MOBILE]) {
			for (const theme of ['light', 'dark'] as const) {
				test(`case study stacks panels without overflow at ${viewport.label} (${theme})`, async ({
					page,
				}) => {
					await page.setViewportSize({ width: viewport.width, height: viewport.height });
					await page.goto(`${localePrefix}/projects/kioku`);
					await useTheme(page, theme);

					await expectNoHorizontalOverflow(page);
					await expect(
						page.getByRole('heading', { level: 1, name: 'Kioku' })
					).toBeVisible();

					// Hero split: status/source/demo info renders beside the title.
					await expect(page.locator('main dl').first()).toBeVisible();

					const problemPanel = narrativePanel(page, /^Problem$|^Problema$/);
					const outcomePanel = narrativePanel(page, /^Outcome$|^Resultado$/);

					if (viewport.label === 'desktop') {
						// Narrative 2×2: problem and approach panels share row one;
						// the first panel column starts at abs x88 with 620px targets.
						const problemBox = (await problemPanel.boundingBox())!;
						expect(Math.round(problemBox.x)).toBe(88);
						expect(problemBox.width).toBeGreaterThanOrEqual(620);

						const outcomeBox = (await outcomePanel.boundingBox())!;
						expect(outcomeBox.y).toBeGreaterThan(problemBox.y + problemBox.height);

						// Learnings row: all compact panels share one row.
						const learningsTitle = page.getByRole('heading', {
							name: /Learning extraction|Extracción de aprendizajes/i,
						});
						await learningsTitle.scrollIntoViewIfNeeded();
						const learningsRow = learningsTitle.locator(
							'xpath=following-sibling::*[1]'
						);
						const compactPanels = learningsRow.locator(':scope > *');
						const firstCompact = (await compactPanels.nth(0).boundingBox())!;
						const lastCompact = (await compactPanels.last().boundingBox())!;
						expect(lastCompact.y).toBeCloseTo(firstCompact.y, 0);
					} else {
						// Tablet/mobile stack every narrative panel vertically.
						const problemBox = (await problemPanel.boundingBox())!;
						const outcomeBox = (await outcomePanel.boundingBox())!;
						expect(outcomeBox.y).toBeGreaterThan(problemBox.y + problemBox.height);
					}
				});
			}
		}
	});
}
