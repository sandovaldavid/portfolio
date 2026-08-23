import { expect, test } from './fixtures';

const DESKTOP = { width: 1440, height: 900 };

test.describe('Home floating contact rail', () => {
	test('starts visible, retracts after scroll and reveals again from the left-edge hotspot', async ({
		page,
	}) => {
		await page.setViewportSize(DESKTOP);
		await page.goto('/');

		const sidebar = page.locator('#contact-sidebar');
		await expect(sidebar).toBeVisible();
		await expect(sidebar).toHaveAttribute('data-collapsed', 'false');

		await page.evaluate(() => window.scrollTo(0, 240));
		await expect.poll(() => sidebar.getAttribute('data-collapsed')).toBe('true');
		await expect(page.locator('#contact-sidebar-reveal')).toHaveAttribute('tabindex', '0');

		await sidebar.hover({ position: { x: 4, y: 120 } });
		await expect.poll(() => sidebar.getAttribute('data-collapsed')).toBe('false');

		await page.mouse.move(DESKTOP.width / 2, DESKTOP.height / 2);
		await expect.poll(() => sidebar.getAttribute('data-collapsed')).toBe('true');
	});

	test('is scoped to Home instead of following the user across the site', async ({ page }) => {
		await page.setViewportSize(DESKTOP);
		await page.goto('/projects/');
		await expect(page.locator('#contact-sidebar')).toHaveCount(0);
	});
});

test.describe('Recruiter quick links motion', () => {
	test('opens and closes with accessible state while the panel transitions', async ({ page }) => {
		await page.setViewportSize(DESKTOP);
		await page.goto('/');

		const root = page.locator('#recruiter-hud');
		const toggle = page.locator('#recruiter-hud-toggle');
		const panel = page.locator('#recruiter-hud-panel');

		await expect(root).toBeVisible();
		await expect(toggle).toHaveAttribute('aria-expanded', 'false');
		await expect(panel).toHaveAttribute('aria-hidden', 'true');

		await toggle.click();
		await expect(toggle).toHaveAttribute('aria-expanded', 'true');
		await expect(panel).toHaveAttribute('aria-hidden', 'false');
		await expect.poll(() => panel.evaluate(el => getComputedStyle(el).opacity)).toBe('1');

		await page.locator('#recruiter-hud-close').click();
		await expect(toggle).toHaveAttribute('aria-expanded', 'false');
		await expect(panel).toHaveAttribute('aria-hidden', 'true');
		await expect.poll(() => panel.evaluate(el => getComputedStyle(el).opacity)).toBe('0');
	});

	test('disables decorative motion when reduced motion is requested', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.setViewportSize(DESKTOP);
		await page.goto('/');

		const recruiterPanel = page.locator('#recruiter-hud-panel');
		const contactRail = page.locator('#contact-sidebar-rail');
		expect(await recruiterPanel.evaluate(el => getComputedStyle(el).transitionDuration)).toBe(
			'0s'
		);
		expect(await contactRail.evaluate(el => getComputedStyle(el).transitionDuration)).toBe(
			'0s'
		);
	});
});
