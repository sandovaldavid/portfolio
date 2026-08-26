import type { Locator } from '@playwright/test';
import { expect, test } from './fixtures';

const DESKTOP = { width: 1440, height: 900 };
const MAX_REDUCED_MOTION_SECONDS = 0.00001;

async function expectDecorativeMotionDisabled(locator: Locator) {
	const durations = await locator.evaluate(element =>
		getComputedStyle(element)
			.transitionDuration.split(',')
			.map(value => value.trim())
			.map(value =>
				value.endsWith('ms') ? Number.parseFloat(value) / 1000 : Number.parseFloat(value)
			)
	);

	expect(durations.every(duration => duration <= MAX_REDUCED_MOTION_SECONDS)).toBe(true);
}

test.describe('Floating contact rail', () => {
	test('Home starts visible, retracts after scroll and reveals again from the left-edge hotspot', async ({
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

	test('non-Home pages mount the rail collapsed by default and keep it keyboard-revealable', async ({
		page,
	}) => {
		await page.setViewportSize(DESKTOP);

		for (const route of [
			'/projects/',
			'/projects/kioku/',
			'/research/',
			'/about/',
			'/es/projects/',
		]) {
			await page.goto(route);

			const sidebar = page.locator('#contact-sidebar');
			const rail = page.locator('#contact-sidebar-rail');
			const reveal = page.locator('#contact-sidebar-reveal');

			await expect(sidebar).toBeVisible();
			await expect(sidebar).toHaveAttribute('data-collapsed', 'true');
			await expect(rail).toHaveAttribute('aria-hidden', 'true');
			await expect(reveal).toHaveAttribute('tabindex', '0');
		}
	});

	test('a collapsed non-Home rail opens from keyboard focus and activation, then collapses after focus leaves', async ({
		page,
	}) => {
		await page.setViewportSize(DESKTOP);
		await page.goto('/projects/');

		const sidebar = page.locator('#contact-sidebar');
		const rail = page.locator('#contact-sidebar-rail');
		const reveal = page.locator('#contact-sidebar-reveal');
		const firstContactLink = rail.locator('a').first();

		await reveal.focus();
		await expect.poll(() => sidebar.getAttribute('data-collapsed')).toBe('false');
		await expect(rail).toHaveAttribute('aria-hidden', 'false');
		await expect(reveal).toBeFocused();

		await page.keyboard.press('Enter');
		await expect(firstContactLink).toBeFocused();

		await page.locator('header a').first().focus();
		await expect.poll(() => sidebar.getAttribute('data-collapsed')).toBe('true');
		await expect(rail).toHaveAttribute('aria-hidden', 'true');
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

		await expectDecorativeMotionDisabled(page.locator('#recruiter-hud-panel'));
		await expectDecorativeMotionDisabled(page.locator('#contact-sidebar-rail'));
	});
});
