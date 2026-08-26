import { expect, test } from './fixtures';

const DESKTOP = { width: 1440, height: 900 };

test.describe('Core Stack brand icon geometry', () => {
	test('renders every brand mark inside the same 24px frame', async ({ page }) => {
		await page.setViewportSize(DESKTOP);
		await page.goto('/');
		await page.locator('#technologies').scrollIntoViewIfNeeded();
		await page.evaluate(() => document.fonts.ready);

		const iconFrames = page.locator('#technologies .tech-pill-icon-frame');
		await expect(iconFrames).toHaveCount(8);

		for (let index = 0; index < (await iconFrames.count()); index += 1) {
			const frame = iconFrames.nth(index);
			const icon = frame.locator('svg');
			const frameBox = (await frame.boundingBox())!;
			const iconBox = (await icon.boundingBox())!;

			expect(Math.round(frameBox.width)).toBe(24);
			expect(Math.round(frameBox.height)).toBe(24);
			expect(Math.round(iconBox.width)).toBe(24);
			expect(Math.round(iconBox.height)).toBe(24);
			expect(Math.abs(iconBox.x - frameBox.x)).toBeLessThanOrEqual(0.5);
			expect(Math.abs(iconBox.y - frameBox.y)).toBeLessThanOrEqual(0.5);
		}
	});
});
