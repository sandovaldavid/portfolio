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
	'/research',
	'/es/research',
	'/projects/yukidoke',
	'/es/projects/yukidoke',
	'/projects/kioku',
	'/es/projects/kioku',
	'/projects/campus-map',
	'/es/projects/campus-map',
	'/projects/mad-ai',
	'/es/projects/mad-ai',
	'/projects/fluentreads',
	'/es/projects/fluentreads',
	'/projects/auctions',
	'/es/projects/auctions',
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
		await expect(
			page.getByRole('heading', { level: 1, name: 'About David Sandoval' })
		).toBeVisible();
		await expect(page.getByText('Angular and reactive frontend architecture')).toBeVisible();

		await page.goto('/es/about');
		await expect(page).toHaveTitle('Sobre David Sandoval — Ingeniero de Software');
		await expect(
			page.getByRole('heading', { level: 1, name: 'Sobre David Sandoval' })
		).toBeVisible();
		await expect(page.getByText('Angular y arquitectura frontend reactiva')).toBeVisible();
	});

	for (const scenario of [
		{
			route: '/research',
			title:
				'Predicting the Abandonment State of OSS Repositories using BiLSTM Neural Networks',
			statusCopy: 'Results will be published upon thesis completion.',
		},
		{
			route: '/es/research',
			title:
				'Predicción del Estado de Abandono de Repositorios OSS usando Redes Neuronales BiLSTM',
			statusCopy: 'Los resultados se publicarán al completar la tesis.',
		},
	] as const) {
		test(`${scenario.route} renders localized research MDX composition`, async ({ page }) => {
			await page.goto(scenario.route);
			await expect(page.locator('[data-research-page="mdx"]')).toBeVisible();
			await expect(page.getByRole('heading', { level: 1, name: scenario.title })).toBeVisible();
			await expect(page.locator('[data-research-section]')).toHaveCount(7);
			await expect(page.locator('[data-evaluation-criteria]')).toHaveCount(1);
			await expect(page.locator('[data-mermaid-figure]')).toHaveCount(1);
			await expect(page.getByText(scenario.statusCopy, { exact: false })).toBeVisible();
		});
	}

	for (const scenario of [
		{
			route: '/',
			tablistName: 'Experience tabs',
			achievement: 'Migrated an institutional portal frontend from WordPress to Angular 19',
		},
		{
			route: '/es/',
			tablistName: 'Pestañas de experiencia',
			achievement: 'Migré el frontend de un portal institucional de WordPress a Angular 19',
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
			lifecycle: 'Maintained',
			imageAlt: 'UNP Campus Map academic faculty and school directory preview',
			kicker: 'PROJECT CASE STUDY · ACADEMIC DIRECTORY',
			detailSource: 'Public source',
			detailLifecycle: 'Maintained',
			evidenceHeading: 'The current repository defines the product boundary',
			forbidden: ['3 months', 'Solo Developer', 'BOSS FIGHT // CASE STUDY'],
		},
		{
			catalogRoute: '/es/projects',
			detailRoute: '/es/projects/campus-map',
			category: 'Desarrollo Full-Stack',
			lifecycle: 'Mantenido',
			imageAlt:
				'Vista previa del directorio académico de facultades y escuelas UNP Campus Map',
			kicker: 'CASO DE ESTUDIO · DIRECTORIO ACADÉMICO',
			detailSource: 'Código público',
			detailLifecycle: 'Mantenido',
			evidenceHeading: 'El repositorio actual define el límite del producto',
			forbidden: ['3 meses', 'Desarrollador independiente', 'BOSS FIGHT // CASE STUDY'],
		},
	] as const) {
		test(`${scenario.detailRoute} renders localized MDX project evidence`, async ({ page }) => {
			await page.goto(scenario.catalogRoute);
			await expect(page.getByText(scenario.category).first()).toBeVisible();
			await expect(page.getByText(scenario.lifecycle, { exact: true }).first()).toBeVisible();
			await expect(page.getByRole('img', { name: scenario.imageAlt }).first()).toBeVisible();

			await page.goto(scenario.detailRoute);
			await expect(page.locator('[data-project-case-study="mdx"]')).toBeVisible();
			await expect(
				page.getByRole('heading', { level: 1, name: 'UNP Campus Map' })
			).toBeVisible();
			await expect(page.getByText(scenario.kicker, { exact: true })).toBeVisible();
			const status = page.locator('[data-project-status]');
			await expect(status.getByText(scenario.detailSource, { exact: true })).toBeVisible();
			await expect(status.getByText(scenario.detailLifecycle, { exact: true })).toBeVisible();
			await expect(
				page.getByRole('heading', { name: scenario.evidenceHeading })
			).toBeVisible();
			await expect(page.locator('[data-mermaid-figure]')).toHaveCount(1);

			for (const forbidden of scenario.forbidden) {
				await expect(page.getByText(forbidden, { exact: true })).toHaveCount(0);
			}
		});
	}
});
