import { test, expect } from '@playwright/test';

test.describe('Yukidoke flagship case study', () => {
	test('is one of the first two featured projects on the English homepage', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByRole('heading', { name: 'Yukidoke' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Case Study' }).first()).toHaveAttribute(
			'href',
			'/projects/yukidoke/'
		);
	});

	for (const locale of [
		{
			path: '/projects/yukidoke',
			status: 'V1 beta — active architecture migration',
			implemented: 'IMPLEMENTED // VERIFIED IN REPOSITORY DOCUMENTATION',
			planned: 'PLANNED // NOT PRESENTED AS SHIPPED',
			limitations: 'ACCESS AND EVIDENCE LIMITATIONS',
			client: 'Angular 22 SPA',
			api: '.NET 10 Minimal API',
		},
		{
			path: '/es/projects/yukidoke',
			status: 'Beta V1 — migración arquitectónica activa',
			implemented: 'IMPLEMENTADO // VERIFICADO EN LA DOCUMENTACIÓN DE LOS REPOSITORIOS',
			planned: 'PLANIFICADO // NO PRESENTADO COMO ENTREGADO',
			limitations: 'LIMITACIONES DE ACCESO Y EVIDENCIA',
			client: 'SPA Angular 22',
			api: 'Minimal API .NET 10',
		},
	]) {
		test(`renders verifiable bilingual evidence at ${locale.path}`, async ({ page }) => {
			await page.goto(locale.path);

			await expect(page.getByRole('heading', { level: 1, name: 'Yukidoke' })).toBeVisible();
			await expect(page.getByText(locale.status, { exact: true })).toBeVisible();
			await expect(page.getByRole('heading', { name: locale.implemented })).toBeVisible();
			await expect(page.getByRole('heading', { name: locale.planned })).toBeVisible();
			await expect(page.getByRole('heading', { name: locale.limitations })).toBeVisible();
			await expect(page.getByText(locale.client, { exact: true })).toBeVisible();
			await expect(page.getByText(locale.api, { exact: true })).toBeVisible();
			await expect(page.getByText('PostgreSQL 16', { exact: true })).toBeVisible();
			await expect(page.getByRole('link', { name: /Yukidoke Web/ })).toHaveAttribute(
				'href',
				'https://github.com/sandovaldavid/yukidoke-web'
			);
			await expect(page.getByRole('link', { name: /Yukidoke API/ })).toHaveAttribute(
				'href',
				'https://github.com/sandovaldavid/yukidoke-api'
			);
		});
	}
});
