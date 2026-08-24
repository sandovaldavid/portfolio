import type { Locator, Page } from '@playwright/test';
import { expect, test } from './fixtures';

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

async function getCompositionGeometry(shell: Locator) {
	const title = shell.locator(':scope > .title-section').first();
	const content = shell.locator(':scope > :nth-child(2)').first();
	const shellBox = (await shell.boundingBox())!;
	const titleBox = (await title.boundingBox())!;
	const contentBox = (await content.boundingBox())!;
	const blockTop = titleBox.y;
	const blockBottom = contentBox.y + contentBox.height;

	return {
		shellBox,
		titleBox,
		contentBox,
		gap: contentBox.y - (titleBox.y + titleBox.height),
		blockCenter: blockTop + (blockBottom - blockTop) / 2,
		shellCenter: shellBox.y + shellBox.height / 2,
	};
}

async function expectCenteredComposition(shell: Locator, expectedGap: number) {
	await expect(shell).toBeAttached();
	const geometry = await getCompositionGeometry(shell);
	expect(Math.abs(geometry.gap - expectedGap)).toBeLessThanOrEqual(1);
	expect(Math.abs(geometry.blockCenter - geometry.shellCenter)).toBeLessThanOrEqual(2);
}

async function expectNoHorizontalOverflow(page: Page) {
	const overflow = await page.evaluate(() => ({
		clientWidth: document.documentElement.clientWidth,
		scrollWidth: document.documentElement.scrollWidth,
	}));
	expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
}

test.describe('Experience responsive composition', () => {
	test('desktop centers the Experience title and evidence stage as one composition', async ({
		page,
	}) => {
		await page.setViewportSize(DESKTOP);
		await page.goto('/');
		await page.locator('#experience').scrollIntoViewIfNeeded();
		await page.evaluate(() => document.fonts.ready);

		const shell = page.locator('[data-experience-shell]');
		const stage = page.locator('[data-experience-stage]');
		const tablist = page.locator('#experience-tablist');
		const activePanel = page.locator('.experience-panel[data-active="true"]');
		const detail = activePanel.locator('[data-experience-detail]');
		const achievements = activePanel.locator('[data-experience-achievement]');

		await expect(shell).toBeVisible();
		await expect(stage).toBeVisible();
		await expect(detail).toBeVisible();
		expect(Math.round((await shell.boundingBox())!.width)).toBe(1280);
		expect(await shell.evaluate(element => getComputedStyle(element).display)).toBe('flex');
		expect(await shell.evaluate(element => getComputedStyle(element).justifyContent)).toBe(
			'center'
		);
		await expectCenteredComposition(shell, 56);

		const tablistBox = (await tablist.boundingBox())!;
		const detailBox = (await detail.boundingBox())!;
		expect(Math.round(tablistBox.width)).toBe(360);
		expect(Math.round(detailBox.width)).toBe(872);
		expect(Math.round(detailBox.x - (tablistBox.x + tablistBox.width))).toBe(48);
		expect(Math.round(detailBox.height)).toBeGreaterThanOrEqual(440);
		expect(Math.round(tablistBox.height)).toBe(Math.round(detailBox.height));
		expect(await achievements.count()).toBeGreaterThanOrEqual(3);

		const firstAchievement = (await achievements.nth(0).boundingBox())!;
		const secondAchievement = (await achievements.nth(1).boundingBox())!;
		expect(Math.round(firstAchievement.y)).toBe(Math.round(secondAchievement.y));
		await expectNoHorizontalOverflow(page);
	});

	test('all Home sections share the title-to-content rhythm and viewport sections center the whole block', async ({
		page,
	}) => {
		await page.setViewportSize(DESKTOP);
		await page.goto('/');
		await page.evaluate(() => document.fonts.ready);

		for (const id of ['projects', 'research', 'about-me']) {
			const shell = page.locator(`#${id} [data-home-viewport-shell="true"]`);
			await expect(shell).toBeAttached();
			expect(await shell.evaluate(element => getComputedStyle(element).display)).toBe('flex');
			expect(await shell.evaluate(element => getComputedStyle(element).justifyContent)).toBe(
				'center'
			);
			await expectCenteredComposition(shell, 56);
		}

		const coreStack = page.locator('#technologies [data-home-compact-shell="true"]');
		await expect(coreStack).toBeAttached();
		const coreGeometry = await getCompositionGeometry(coreStack);
		expect(Math.abs(coreGeometry.gap - 56)).toBeLessThanOrEqual(1);
	});

	test('mobile keeps role selection horizontal and the detail panel inside the content gutter', async ({
		page,
	}) => {
		await page.setViewportSize(MOBILE);
		await page.goto('/');
		await page.locator('#experience').scrollIntoViewIfNeeded();

		const shell = page.locator('[data-experience-shell]');
		const tabs = page.locator('#experience-tablist [role="tab"]');
		const detail = page.locator(
			'.experience-panel[data-active="true"] [data-experience-detail]'
		);
		await expect(tabs).toHaveCount(3);
		await expect(detail).toBeVisible();

		const geometry = await getCompositionGeometry(shell);
		expect(Math.abs(geometry.gap - 40)).toBeLessThanOrEqual(1);

		const firstTab = (await tabs.nth(0).boundingBox())!;
		const secondTab = (await tabs.nth(1).boundingBox())!;
		expect(Math.round(firstTab.width)).toBe(250);
		expect(secondTab.x).toBeGreaterThan(firstTab.x);
		expect(Math.round((await detail.boundingBox())!.width)).toBe(350);
		await expectNoHorizontalOverflow(page);
	});
});

test.describe('Experience role interaction', () => {
	test('switches panels with directional motion without changing ARIA tab semantics', async ({
		page,
	}) => {
		await page.setViewportSize(DESKTOP);
		await page.goto('/');
		await page.locator('#experience').scrollIntoViewIfNeeded();

		const tabs = page.locator('#experience-tablist [role="tab"]');
		const panels = page.locator('.experience-panel');
		const firstTab = tabs.nth(0);
		const secondTab = tabs.nth(1);
		const firstPanel = panels.nth(0);
		const secondPanel = panels.nth(1);

		await expect(firstTab).toHaveAttribute('aria-selected', 'true');
		await expect(firstPanel).toHaveAttribute('aria-hidden', 'false');

		await secondTab.click();
		await expect(secondTab).toHaveAttribute('aria-selected', 'true');
		await expect(firstTab).toHaveAttribute('aria-selected', 'false');
		await expect(firstPanel).toHaveAttribute('aria-hidden', 'true');
		await expect(secondPanel).toHaveAttribute('aria-hidden', 'false');
		await expect(secondPanel).toHaveAttribute('data-active', 'true');
		await expect.poll(() => secondPanel.getAttribute('data-motion')).toBe('idle');

		await firstTab.focus();
		await firstTab.press('ArrowDown');
		await expect(secondTab).toBeFocused();
		await expect(secondTab).toHaveAttribute('aria-selected', 'true');
		await secondTab.press('ArrowUp');
		await expect(firstTab).toBeFocused();
		await firstTab.press('Enter');
		await expect(firstTab).toHaveAttribute('aria-selected', 'true');
		await expect(firstPanel).toHaveAttribute('aria-hidden', 'false');
	});
});
