import { expect, test } from './fixtures';

const HEADER_HEIGHT = 72;
const DESKTOP = { width: 1440, height: 900 };
const TABLET = { width: 834, height: 1100 };

for (const [label, viewport] of [
	['desktop', DESKTOP],
	['tablet', TABLET],
] as const) {
	test(`${label} Home sections fill the usable viewport without horizontal overflow`, async ({
		page,
	}) => {
		await page.setViewportSize(viewport);
		await page.goto('/');

		const horizontalMetrics = await page.evaluate(() => ({
			scrollWidth: document.documentElement.scrollWidth,
			clientWidth: document.documentElement.clientWidth,
		}));
		expect(horizontalMetrics.scrollWidth).toBeLessThanOrEqual(horizontalMetrics.clientWidth);

		for (const id of ['hero', 'experience', 'projects', 'research', 'about-me', 'technologies']) {
			const section = page.locator(`#${id}`);
			await expect(section).toBeVisible();
			const box = await section.boundingBox();
			expect(box).not.toBeNull();
			expect(box!.width).toBeLessThanOrEqual(viewport.width);
			expect(box!.height).toBeGreaterThanOrEqual(viewport.height - HEADER_HEIGHT);
		}
	});
}

test('Experience keeps the next section anchored when a longer role is selected', async ({ page }) => {
	await page.setViewportSize(DESKTOP);
	await page.goto('/');

	const projects = page.locator('#projects');
	const experience = page.locator('#experience');
	const projectsBefore = await projects.boundingBox();
	const experienceBefore = await experience.boundingBox();

	const tabs = page.getByRole('tab');
	await tabs.nth(2).click();
	await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');

	const projectsAfter = await projects.boundingBox();
	const experienceAfter = await experience.boundingBox();

	expect(Math.abs(projectsAfter!.y - projectsBefore!.y)).toBeLessThanOrEqual(1);
	expect(Math.abs(experienceAfter!.height - experienceBefore!.height)).toBeLessThanOrEqual(1);
});

test('Mobile remains content-driven and horizontally contained', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');

	const horizontalMetrics = await page.evaluate(() => ({
		scrollWidth: document.documentElement.scrollWidth,
		clientWidth: document.documentElement.clientWidth,
	}));
	expect(horizontalMetrics.scrollWidth).toBeLessThanOrEqual(horizontalMetrics.clientWidth);

	const experience = page.locator('#experience');
	const tablist = experience.getByRole('tablist');
	expect(await tablist.evaluate(el => getComputedStyle(el).overflowX)).toBe('auto');
});
