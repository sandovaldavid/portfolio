import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const;

function parseRgb(value: string): [number, number, number] {
	const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
	if (!match) throw new Error(`Unsupported RGB value: ${value}`);
	return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function relativeLuminance([red, green, blue]: [number, number, number]): number {
	const linear = [red, green, blue].map(channel => {
		const normalized = channel / 255;
		return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
	});
	return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrastRatio(foreground: string, background: string): number {
	const foregroundLuminance = relativeLuminance(parseRgb(foreground));
	const backgroundLuminance = relativeLuminance(parseRgb(background));
	const lighter = Math.max(foregroundLuminance, backgroundLuminance);
	const darker = Math.min(foregroundLuminance, backgroundLuminance);
	return (lighter + 0.05) / (darker + 0.05);
}

async function useTheme(page: Page, theme: 'light' | 'dark') {
	await page.addInitScript(selectedTheme => {
		localStorage.setItem('theme', selectedTheme);
	}, theme);
}

async function expectNoBlockingAxeViolations(page: Page) {
	const results = await new AxeBuilder({ page }).withTags([...WCAG_TAGS]).analyze();
	const blockingViolations = results.violations.filter(
		violation => violation.impact === 'critical' || violation.impact === 'serious'
	);
	expect(blockingViolations).toEqual([]);
}

test.describe('Portfolio Retro color token contract', () => {
	for (const scenario of [
		{
			route: '/',
			theme: 'light' as const,
			canvas: 'rgb(245, 248, 252)',
			hover: 'rgb(0, 68, 204)',
			content: 'rgb(255, 255, 255)',
		},
		{
			route: '/es/',
			theme: 'dark' as const,
			canvas: 'rgb(2, 4, 8)',
			hover: 'rgb(124, 199, 251)',
			content: 'rgb(2, 4, 8)',
		},
	] as const) {
		test(`${scenario.route} resolves ${scenario.theme} channel and button roles`, async ({
			page,
		}) => {
			await useTheme(page, scenario.theme);
			await page.goto(scenario.route);
			await page.waitForLoadState('networkidle');

			await expect(page.locator('body')).toHaveCSS('background-color', scenario.canvas);

			const primaryButton = page.locator('#recruiter-hud-toggle');
			await expect(primaryButton).toBeVisible();
			await primaryButton.hover();
			await expect(primaryButton).toHaveCSS('background-color', scenario.hover);
			await expect(primaryButton).toHaveCSS('color', scenario.content);

			const styles = await primaryButton.evaluate(element => {
				const computed = getComputedStyle(element);
				return {
					background: computed.backgroundColor,
					color: computed.color,
				};
			});
			expect(contrastRatio(styles.color, styles.background)).toBeGreaterThanOrEqual(4.5);
		});
	}

	test('CLI resolves named terminal roles and retains keyboard behavior', async ({ page }) => {
		await useTheme(page, 'dark');
		await page.goto('/');
		await page.keyboard.press('Shift+;');

		const overlay = page.locator('#cli-overlay');
		const terminal = overlay.locator('.border-channel-portfolio-terminal-cyan');
		const input = page.locator('#cli-input');
		await expect(overlay).toBeVisible();
		await expect(input).toBeFocused();
		await expect(terminal).toHaveCSS('border-top-color', 'rgb(0, 176, 255)');

		await input.fill('help');
		await input.press('Enter');
		await expect(page.locator('#cli-output')).toContainText('Portfolio OS');
		await expectNoBlockingAxeViolations(page);
	});

	test('retro splash resolves terminal roles and remains dismissible', async ({ page }) => {
		await useTheme(page, 'dark');
		await page.goto('/?retro=1');

		const splash = page.locator('#splash-screen');
		await expect(splash).toBeVisible();
		await expect(splash.locator('#retro-continue')).toHaveCSS(
			'background-color',
			'rgb(0, 176, 255)'
		);
		await expectNoBlockingAxeViolations(page);

		await splash.locator('#retro-continue').click();
		await expect(splash).toBeHidden();
	});

	for (const scenario of [
		{ theme: 'light' as const, canvas: 'rgb(245, 248, 252)' },
		{ theme: 'dark' as const, canvas: 'rgb(2, 4, 8)' },
	] as const) {
		test(`404 uses the ${scenario.theme} channel canvas`, async ({ page }) => {
			await useTheme(page, scenario.theme);
			await page.goto('/missing-design-system-token-route');
			await expect(page.locator('body')).toHaveCSS('background-color', scenario.canvas);
			await expect(page.locator('h1')).toHaveCount(1);
		});
	}
});
