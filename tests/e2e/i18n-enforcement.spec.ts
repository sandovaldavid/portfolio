import type { Page } from '@playwright/test';
import {
	REPRESENTATIVE_ROUTE_PAIRS,
	SPANISH_FORBIDDEN_PHRASES,
} from '../../scripts/i18n/config.mjs';
import { expect, test } from './fixtures';

const normalizeRoute = (route: string): string => {
	const pathname = new URL(route, 'https://sandovaldavid.com').pathname;
	return pathname === '/' ? pathname : pathname.replace(/\/$/, '');
};

async function expectLocalizedRoute(
	page: Page,
	route: string,
	locale: 'en' | 'es',
	expectedEnglishPath: string,
	expectedSpanishPath: string
) {
	const response = await page.goto(route);
	expect(response?.ok()).toBe(true);
	await expect(page.locator('html')).toHaveAttribute('lang', locale);

	const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
	expect(canonical).toBeTruthy();
	expect(normalizeRoute(canonical ?? '')).toBe(normalizeRoute(route));

	const englishAlternate = await page
		.locator('link[rel="alternate"][hreflang="en"]:not([type="application/rss+xml"])')
		.getAttribute('href');
	const spanishAlternate = await page
		.locator('link[rel="alternate"][hreflang="es"]:not([type="application/rss+xml"])')
		.getAttribute('href');
	const defaultAlternate = await page
		.locator('link[rel="alternate"][hreflang="x-default"]')
		.getAttribute('href');

	expect(normalizeRoute(englishAlternate ?? '')).toBe(normalizeRoute(expectedEnglishPath));
	expect(normalizeRoute(spanishAlternate ?? '')).toBe(normalizeRoute(expectedSpanishPath));
	expect(normalizeRoute(defaultAlternate ?? '')).toBe(normalizeRoute(expectedEnglishPath));

	const languageTargets = await page
		.locator('a[data-language-base-path]')
		.evaluateAll(links =>
			links
				.map(link => (link as HTMLAnchorElement).dataset.languageBasePath)
				.filter((target): target is string => Boolean(target))
		);
	expect(languageTargets.map(normalizeRoute)).toContain(normalizeRoute(expectedEnglishPath));
	expect(languageTargets.map(normalizeRoute)).toContain(normalizeRoute(expectedSpanishPath));

	if (locale === 'es') {
		const html = await page.content();
		for (const phrase of SPANISH_FORBIDDEN_PHRASES) {
			expect(html, `${route} contains English-only phrase: ${phrase}`).not.toContain(phrase);
		}
	}
}

test.describe('mandatory bilingual route matrix', () => {
	for (const pair of REPRESENTATIVE_ROUTE_PAIRS) {
		test(`${pair.english} and ${pair.spanish} expose verified localized contracts`, async ({
			page,
		}) => {
			await expectLocalizedRoute(page, pair.english, 'en', pair.english, pair.spanish);
			await expectLocalizedRoute(page, pair.spanish, 'es', pair.english, pair.spanish);
		});
	}

	for (const scenario of [
		{
			route: '/missing-i18n-quality-route',
			locale: 'en',
			title: '404 - Page not found | David Sandoval',
			heading: 'Page not found',
			homeLabel: 'Go to home',
			homePath: '/',
		},
		{
			route: '/es/missing-i18n-quality-route',
			locale: 'es',
			title: '404 - Página no encontrada | David Sandoval',
			heading: 'Página no encontrada',
			homeLabel: 'Ir al inicio',
			homePath: '/es/',
		},
	] as const) {
		test(`${scenario.route} preserves localized 404 behavior`, async ({ page }) => {
			const response = await page.goto(scenario.route);
			expect(response?.status()).toBe(404);
			await expect(page.locator('html')).toHaveAttribute('lang', scenario.locale);
			await expect(page).toHaveTitle(scenario.title);
			await expect(
				page.getByRole('heading', { level: 1, name: scenario.heading })
			).toBeVisible();
			await expect(page.getByRole('link', { name: scenario.homeLabel })).toHaveAttribute(
				'href',
				scenario.homePath
			);
		});
	}
});

test.describe('deduplicated legacy page pairs', () => {
	for (const scenario of [
		{
			route: '/atena',
			locale: 'en',
			heading: 'Mission details: Atena',
			forbiddenHeading: 'Detalles de misión: Atena',
		},
		{
			route: '/es/atena',
			locale: 'es',
			heading: 'Detalles de misión: Atena',
			forbiddenHeading: 'Mission details: Atena',
		},
		{
			route: '/skills',
			locale: 'en',
			heading: 'Skills inventory',
			forbiddenHeading: 'Inventario de habilidades',
		},
		{
			route: '/es/skills',
			locale: 'es',
			heading: 'Inventario de habilidades',
			forbiddenHeading: 'Skills inventory',
		},
		{
			route: '/components',
			locale: 'en',
			heading: 'UI components showcase',
			forbiddenHeading: 'Muestra de componentes UI',
		},
		{
			route: '/es/components',
			locale: 'es',
			heading: 'Muestra de componentes UI',
			forbiddenHeading: 'UI components showcase',
		},
	] as const) {
		test(`${scenario.route} renders only its canonical localized presentation`, async ({
			page,
		}) => {
			const response = await page.goto(scenario.route);
			expect(response?.ok()).toBe(true);
			await expect(page.locator('html')).toHaveAttribute('lang', scenario.locale);
			await expect(page.locator('main')).toHaveCount(1);
			await expect(page.getByRole('heading', { name: scenario.heading })).toBeVisible();
			await expect(
				page.getByRole('heading', { name: scenario.forbiddenHeading })
			).toHaveCount(0);
		});
	}
});
