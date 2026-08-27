import AxeBuilder from '@axe-core/playwright';
import type { Locator, Page } from '@playwright/test';
import { test, expect } from './fixtures';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const;

type Theme = 'light' | 'dark';
type ColorProperty = 'background-color' | 'color' | 'border-top-color';

async function useTheme(page: Page, theme: Theme) {
	await page.addInitScript(selectedTheme => {
		localStorage.setItem('theme', selectedTheme);
	}, theme);
}

async function expectColorRole(
	page: Page,
	locator: Locator,
	property: ColorProperty,
	token: string
) {
	const result = await locator.evaluate(
		(element, input) => {
			const actual = getComputedStyle(element).getPropertyValue(input.property);
			const probe = document.createElement('div');
			probe.style.setProperty(input.property, `var(${input.token})`);
			probe.style.position = 'fixed';
			probe.style.pointerEvents = 'none';
			document.body.appendChild(probe);
			const expected = getComputedStyle(probe).getPropertyValue(input.property);
			probe.remove();
			return { actual, expected };
		},
		{ property, token }
	);
	expect(result.actual).toBe(result.expected);
}

async function expectNoBlockingAxeViolations(page: Page) {
	// Freeze entrance animations/transitions (e.g. project card fade-in) so axe measures
	// final rendered colors instead of a transient, partially-transparent mid-animation frame.
	await page.addStyleTag({
		content: `
			*, *::before, *::after {
				animation-delay: -1ms !important;
				animation-duration: 0s !important;
				animation-iteration-count: 1 !important;
				transition-duration: 0s !important;
				transition-delay: 0s !important;
			}
		`,
	});
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
			canvasToken: '--color-base-background-light',
			defaultToken: '--color-primary-500-light',
			hoverToken: '--color-primary-600-light',
			contentToken: '--color-base-white',
		},
		{
			route: '/es/',
			theme: 'dark' as const,
			canvasToken: '--color-neutral-950',
			defaultToken: '--color-primary-500-dark',
			hoverToken: '--color-primary-400-dark',
			contentToken: '--color-neutral-950',
		},
	] as const) {
		test(`${scenario.route} resolves ${scenario.theme} channel and button roles`, async ({
			page,
		}) => {
			await useTheme(page, scenario.theme);
			await page.goto(scenario.route);
			await page.waitForLoadState('networkidle');

			await expectColorRole(
				page,
				page.locator('body'),
				'background-color',
				scenario.canvasToken
			);

			const primaryButton = page.locator('#recruiter-hud-toggle');
			await expect(primaryButton).toBeVisible();
			// This contract validates resolved token ownership, not interpolation. Chromium
			// serializes an in-flight OKLCH transition as OKLab, so freeze only this control's
			// transition before comparing the final default/hover role values.
			await primaryButton.evaluate(element => {
				(element as HTMLElement).style.setProperty('transition', 'none', 'important');
			});
			await expectColorRole(page, primaryButton, 'background-color', scenario.defaultToken);
			await expectColorRole(page, primaryButton, 'color', scenario.contentToken);

			await primaryButton.hover();
			await expectColorRole(page, primaryButton, 'background-color', scenario.hoverToken);
			await expectColorRole(page, primaryButton, 'color', scenario.contentToken);
			await expectNoBlockingAxeViolations(page);

			await primaryButton.focus();
			await expect(primaryButton).toBeFocused();
			const focusShadow = await primaryButton.evaluate(
				element => getComputedStyle(element).boxShadow
			);
			expect(focusShadow).not.toBe('none');
		});
	}

	test('CLI resolves named terminal roles and retains keyboard behavior', async ({ page }) => {
		await useTheme(page, 'dark');
		await page.goto('/');
		await page.waitForFunction(
			() => typeof (window as Window & { __openCLI?: unknown }).__openCLI === 'function'
		);
		await page.evaluate(() => {
			document.dispatchEvent(
				new KeyboardEvent('keydown', {
					key: ':',
					shiftKey: true,
					bubbles: true,
					cancelable: true,
				})
			);
		});

		const overlay = page.locator('#cli-overlay');
		const terminal = overlay.locator('.border-channel-portfolio-terminal-cyan');
		const input = page.locator('#cli-input');
		await expect(overlay).toBeVisible();
		await expect(input).toBeFocused();
		await expectColorRole(page, terminal, 'border-top-color', '--color-primary-500-dark');

		await input.fill('help');
		await input.press('Enter');
		await expect(page.locator('#cli-output')).toContainText('Portfolio CLI');
		await expectNoBlockingAxeViolations(page);
	});

	test('retro splash resolves terminal roles and remains dismissible', async ({ page }) => {
		await useTheme(page, 'dark');
		await page.goto('/?retro=1');

		const splash = page.locator('#splash-screen');
		const continueButton = splash.locator('#retro-continue');
		await expect(splash).toBeVisible();
		await expectColorRole(page, continueButton, 'background-color', '--color-primary-500-dark');
		await expectNoBlockingAxeViolations(page);

		await continueButton.click();
		await expect(splash).toBeHidden();
	});

	for (const scenario of [
		{ theme: 'light' as const, canvasToken: '--color-base-background-light' },
		{ theme: 'dark' as const, canvasToken: '--color-neutral-950' },
	] as const) {
		test(`404 uses the ${scenario.theme} channel canvas`, async ({ page }) => {
			await useTheme(page, scenario.theme);
			await page.goto('/missing-design-system-token-route');
			await expectColorRole(
				page,
				page.locator('body'),
				'background-color',
				scenario.canvasToken
			);
			await expect(page.locator('h1')).toHaveCount(1);
		});
	}

	test('mobile navigation preserves focus and channel roles', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await useTheme(page, 'light');
		await page.goto('/');
		const trigger = page.locator('#mobile-menu-btn');
		await trigger.click();
		await expect(page.locator('#mobile-menu')).toBeVisible();
		await expect(page.locator('#mobile-menu-close')).toBeFocused();
		await expectNoBlockingAxeViolations(page);
	});
});
