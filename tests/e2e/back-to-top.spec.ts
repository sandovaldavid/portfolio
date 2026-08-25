import { expect, test } from './fixtures';

const DESKTOP = { width: 1440, height: 900 };

async function scrollPastOneViewport(page: import('@playwright/test').Page) {
	await page.evaluate(() => {
		window.scrollTo({ top: Math.min(document.documentElement.scrollHeight, window.innerHeight * 1.5), behavior: 'auto' });
	});
}

test('Back to top reveals after one viewport and returns focus to main content', async ({ page }) => {
	await page.setViewportSize(DESKTOP);
	await page.goto('/');

	const root = page.locator('#back-to-top');
	const button = page.locator('#back-to-top-button');
	await expect(root).toHaveAttribute('data-visible', 'false');
	await expect(root).toHaveAttribute('aria-hidden', 'true');
	await expect(button).toHaveAttribute('tabindex', '-1');
	await expect(button).toHaveAttribute('aria-label', 'Back to top');

	await scrollPastOneViewport(page);
	await expect(root).toHaveAttribute('data-visible', 'true');
	await expect(root).toHaveAttribute('aria-hidden', 'false');
	await expect(button).toHaveAttribute('tabindex', '0');

	await button.click();
	await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 3000 }).toBeLessThanOrEqual(2);
	await expect(page.locator('#main-content')).toBeFocused();
	await expect(root).toHaveAttribute('data-visible', 'false');
});

test('Back to top is global on internal routes and keeps its Spanish accessible name', async ({ page }) => {
	await page.setViewportSize(DESKTOP);
	await page.goto('/projects/yukidoke/');

	const root = page.locator('#back-to-top');
	const button = page.locator('#back-to-top-button');
	await expect(root).toBeAttached();
	await scrollPastOneViewport(page);
	await expect(root).toHaveAttribute('data-visible', 'true');
	await expect(button).toHaveAttribute('aria-label', 'Back to top');

	await page.goto('/es/projects/yukidoke/');
	await expect(page.locator('#back-to-top')).toBeAttached();
	await expect(page.locator('#back-to-top-button')).toHaveAttribute('aria-label', 'Volver al inicio');
});
