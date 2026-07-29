import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';

const CRITICAL_ROUTES = [
	'/',
	'/es/',
	'/about',
	'/es/about',
	'/projects',
	'/es/projects',
	'/projects/yukidoke',
	'/es/projects/yukidoke',
] as const;
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const;

async function prepareRouteForAxe(page: Page, route: string) {
	const response = await page.goto(route);
	expect(response?.ok()).toBe(true);
	await page.evaluate(() => {
		localStorage.setItem('theme', 'dark');
		document.documentElement.classList.add('dark');
	});
	await page.reload();
	await page.waitForLoadState('domcontentloaded');
	await page.waitForLoadState('networkidle');
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
}

test.describe('Pull request smoke and accessibility gates', () => {
	for (const route of CRITICAL_ROUTES) {
		test(`${route} renders unique content without serious axe violations`, async ({ page }) => {
			await prepareRouteForAxe(page, route);
			await expect(page.locator('main').first()).toBeVisible();
			await expect(page.locator('h1')).toHaveCount(1);

			const results = await new AxeBuilder({ page }).withTags([...WCAG_TAGS]).analyze();
			const blockingViolations = results.violations.filter(
				violation => violation.impact === 'critical' || violation.impact === 'serious'
			);
			expect(blockingViolations).toEqual([]);
		});
	}

	test('localized About routes render their profile entry', async ({ page }) => {
		await page.goto('/about');
		await expect(page).toHaveTitle('About David Sandoval — Software Engineer');
		await expect(page.getByRole('heading', { level: 1, name: 'Full biography' })).toBeVisible();
		await expect(page.getByText('Angular and reactive frontend architecture')).toBeVisible();

		await page.goto('/es/about');
		await expect(page).toHaveTitle('Sobre David Sandoval — Ingeniero de Software');
		await expect(
			page.getByRole('heading', { level: 1, name: 'Biografía completa' })
		).toBeVisible();
		await expect(page.getByText('Angular y arquitectura frontend reactiva')).toBeVisible();
	});

	for (const scenario of [
		{
			route: '/',
			tablistName: 'Experience tabs',
			achievement: 'Migrated an educational institutional site from WordPress to Angular',
		},
		{
			route: '/es/',
			tablistName: 'Pestañas de experiencia',
			achievement:
				'Realicé la migración de un sitio institucional educativo de WordPress a Angular',
		},
	] as const) {
		test(`${scenario.route} renders localized keyboard-accessible experience tabs`, async ({
			page,
		}) => {
			await page.goto(scenario.route);

			const tablist = page.getByRole('tablist', { name: scenario.tablistName });
			const tabs = tablist.getByRole('tab');
			await expect(tabs).toHaveCount(3);
			await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');

			await tabs.nth(0).focus();
			await tabs.nth(0).press('ArrowDown');
			await expect(tabs.nth(1)).toBeFocused();
			await tabs.nth(1).press('Enter');
			await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');

			const panel = page.locator(
				'[role="tabpanel"][data-experience-id="chirasoft-fullstack-developer"]'
			);
			await expect(panel).toHaveAttribute('data-active', 'true');
			await expect(panel.getByText(scenario.achievement, { exact: false })).toBeVisible();
		});
	}

	for (const scenario of [
		{
			catalogRoute: '/projects',
			detailRoute: '/projects/campus-map',
			category: 'Full-Stack Development',
			cardLabel: 'Feature',
			banner: 'BOSS FIGHT // CASE STUDY',
			timeline: '3 months',
			role: 'Solo Developer',
			imageAlt: 'UNP Campus Map interactive campus directory preview',
			forbidden: ['3 meses', 'Desarrollador independiente'],
		},
		{
			catalogRoute: '/es/projects',
			detailRoute: '/es/projects/campus-map',
			category: 'Desarrollo Full-Stack',
			cardLabel: 'Destacado',
			banner: 'BATALLA FINAL // CASO DE ESTUDIO',
			timeline: '3 meses',
			role: 'Desarrollador independiente',
			imageAlt: 'Vista previa del directorio interactivo UNP Campus Map',
			forbidden: ['3 months', 'Solo Developer', 'BOSS FIGHT // CASE STUDY'],
		},
	] as const) {
		test(`${scenario.detailRoute} renders localized project and case-study content`, async ({
			page,
		}) => {
			await page.goto(scenario.catalogRoute);
			await expect(page.getByText(scenario.category).first()).toBeVisible();
			await expect(page.getByText(scenario.cardLabel).first()).toBeVisible();
			await expect(page.getByRole('img', { name: scenario.imageAlt }).first()).toBeVisible();

			await page.goto(scenario.detailRoute);
			await expect(
				page.getByRole('heading', { level: 1, name: 'UNP Campus Map' })
			).toBeVisible();
			await expect(page.getByText(scenario.banner)).toBeVisible();
			await expect(page.getByText(scenario.timeline, { exact: true })).toBeVisible();
			await expect(page.getByText(scenario.role, { exact: true })).toBeVisible();
			await expect(page.getByRole('img', { name: scenario.imageAlt })).toBeVisible();

			for (const forbidden of scenario.forbidden) {
				await expect(page.getByText(forbidden, { exact: true })).toHaveCount(0);
			}
		});
	}
});
