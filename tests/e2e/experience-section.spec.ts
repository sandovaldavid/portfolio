import { expect, test } from './fixtures';

const HEADER_HEIGHT = 72;

for (const viewport of [
	{ width: 1440, height: 900, label: 'desktop' },
	{ width: 834, height: 1100, label: 'tablet' },
] as const) {
	test(`${viewport.label} experience section is full-bleed, centered and viewport-filling`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: viewport.width, height: viewport.height });
		await page.goto('/');

		const section = page.locator('#experience');
		await expect(section).toBeVisible();
		const sectionBox = await section.boundingBox();
		expect(sectionBox?.width).toBeCloseTo(viewport.width, 0);

		const shell = section.locator('[data-experience-shell]');
		const shellBox = await shell.boundingBox();
		expect(shellBox?.height).toBeGreaterThanOrEqual(viewport.height - HEADER_HEIGHT);

		const title = section.getByRole('heading', { level: 2, name: /experience/i });
		const titleBox = await title.boundingBox();
		expect(titleBox).not.toBeNull();
		expect(sectionBox).not.toBeNull();
		expect(await title.evaluate(el => getComputedStyle(el).fontSize)).toBe('36px');
		expect(await title.evaluate(el => getComputedStyle(el).lineHeight)).toBe('40px');

		const titleCenter = titleBox!.x + titleBox!.width / 2;
		const sectionCenter = sectionBox!.x + sectionBox!.width / 2;
		expect(Math.abs(titleCenter - sectionCenter)).toBeLessThanOrEqual(1);
	});
}

test('mobile experience keeps compact section typography and a visually hidden horizontal rail', async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');

	const section = page.locator('#experience');
	const box = await section.boundingBox();
	expect(box?.width).toBeCloseTo(390, 0);

	const title = section.getByRole('heading', { level: 2, name: /experience/i });
	expect(await title.evaluate(el => getComputedStyle(el).fontSize)).toBe('28px');
	expect(await title.evaluate(el => getComputedStyle(el).lineHeight)).toBe('36px');

	const tablist = section.getByRole('tablist');
	expect(await tablist.evaluate(el => getComputedStyle(el).flexDirection)).toBe('row');
	expect(await tablist.evaluate(el => getComputedStyle(el).overflowX)).toBe('auto');
	expect(await tablist.evaluate(el => getComputedStyle(el).scrollbarWidth)).toBe('none');

	const technologies = section.locator(
		'[role="tabpanel"][data-active="true"] [data-experience-technologies]'
	);
	await expect(technologies).toBeVisible();
	expect(await technologies.evaluate(el => getComputedStyle(el).justifyContent)).toBe('center');
});

test('experience hover remains visually distinct from the section surface', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto('/');

	const section = page.locator('#experience');
	const inactiveTab = section.getByRole('tab').nth(1);
	const sectionBackground = await section.evaluate(el => getComputedStyle(el).backgroundColor);
	const inactiveBackground = await inactiveTab.evaluate(
		el => getComputedStyle(el).backgroundColor
	);

	expect(inactiveBackground).not.toBe(sectionBackground);

	await inactiveTab.hover();
	const hoverBackground = await inactiveTab.evaluate(el => getComputedStyle(el).backgroundColor);
	expect(hoverBackground).not.toBe(sectionBackground);
	expect(hoverBackground).not.toBe(inactiveBackground);
});

test('experience selection keeps accessible tab state while the indicator has motion', async ({
	page,
}) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto('/');

	const tabs = page.getByRole('tab');
	const first = tabs.nth(0);
	const second = tabs.nth(1);
	await expect(first).toHaveAttribute('aria-selected', 'true');

	const verticalIndicator = first.locator('[data-experience-indicator="vertical"]');
	expect(await verticalIndicator.evaluate(el => getComputedStyle(el).transitionDuration)).toBe(
		'0.3s'
	);

	await second.click();
	await expect(second).toHaveAttribute('aria-selected', 'true');
	await expect(first).toHaveAttribute('aria-selected', 'false');
	await expect(page.locator('[role="tabpanel"][data-active="true"]')).toBeVisible();
});
