import { test, expect } from './fixtures';

test.describe('System theme resolution', () => {
	test('does not snapshot Dark to System when the OS already resolves dark', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.emulateMedia({ colorScheme: 'dark' });
		await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
		await page.goto('/');

		await page.locator('#recruiter-hud-toggle').click();
		const themeToggle = page.locator('#recruiter-hud-panel [data-theme-toggle]');
		await expect(themeToggle).toBeVisible();
		await expect(themeToggle).toHaveAttribute('data-theme-current', 'dark');

		const result = await themeToggle.evaluate(button => {
			type RuntimeDocument = Document & {
				activeViewTransition?: unknown;
			};

			if (!(button instanceof HTMLButtonElement)) throw new Error('Theme toggle not found');
			const panel = document.querySelector<HTMLElement>('#recruiter-hud-panel');
			if (!panel) throw new Error('Recruiter HUD panel not found');

			const before = {
				bodyBackground: getComputedStyle(document.body).backgroundColor,
				panelBackground: getComputedStyle(panel).backgroundColor,
			};

			button.click();

			return {
				before,
				after: {
					bodyBackground: getComputedStyle(document.body).backgroundColor,
					panelBackground: getComputedStyle(panel).backgroundColor,
					preference: localStorage.getItem('theme'),
					currentPreference: button.dataset.themeCurrent,
					resolvedTheme: document.documentElement.dataset.themeResolved,
					isDark: document.documentElement.classList.contains('dark'),
					hasThemeTransitionMarker:
						document.documentElement.classList.contains('theme-transition'),
					hasActiveViewTransition: Boolean(
						(document as RuntimeDocument).activeViewTransition
					),
				},
			};
		});

		expect(result.after.preference).toBe('system');
		expect(result.after.currentPreference).toBe('system');
		expect(result.after.resolvedTheme).toBe('dark');
		expect(result.after.isDark).toBe(true);
		expect(result.after.bodyBackground).toBe(result.before.bodyBackground);
		expect(result.after.panelBackground).toBe(result.before.panelBackground);
		expect(result.after.hasThemeTransitionMarker).toBe(false);
		expect(result.after.hasActiveViewTransition).toBe(false);
		await expect(page.locator('link[data-theme-favicon-active]')).toHaveAttribute(
			'href',
			'/favicon.dark.svg'
		);
	});
});
