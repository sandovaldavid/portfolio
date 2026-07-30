import { test, expect } from '@playwright/test';

test.describe('Kioku public backend case study', () => {
	test('is one of the first two featured projects on the English homepage', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByRole('heading', { name: 'Kioku' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Case Study' }).nth(1)).toHaveAttribute(
			'href',
			'/projects/kioku/'
		);
	});

	for (const locale of [
		{
			path: '/projects/kioku',
			status: 'Release 2.3.0 stable — active development on a narrower contract',
			implemented: 'IMPLEMENTED // VERIFIED IN REPOSITORY DOCUMENTATION',
			planned: 'PLANNED // NOT PRESENTED AS SHIPPED',
			limitations: 'ACCESS AND EVIDENCE LIMITATIONS',
			adapter: 'MCP Adapter',
			source: 'Kioku — MCP server for Obsidian',
		},
		{
			path: '/es/projects/kioku',
			status: 'Release 2.3.0 estable — desarrollo activo sobre un contrato más reducido',
			implemented: 'IMPLEMENTADO // VERIFICADO EN LA DOCUMENTACIÓN DEL REPOSITORIO',
			planned: 'PLANIFICADO // NO PRESENTADO COMO ENTREGADO',
			limitations: 'LIMITACIONES DE ACCESO Y EVIDENCIA',
			adapter: 'Adaptador MCP',
			source: 'Kioku — servidor MCP para Obsidian',
		},
	]) {
		test(`renders verifiable bilingual evidence at ${locale.path}`, async ({ page }) => {
			await page.goto(locale.path);

			await expect(page.getByRole('heading', { level: 1, name: 'Kioku' })).toBeVisible();
			await expect(page.getByText(locale.status, { exact: true })).toBeVisible();
			await expect(page.getByRole('heading', { name: locale.implemented })).toBeVisible();
			await expect(page.getByRole('heading', { name: locale.planned })).toBeVisible();
			await expect(page.getByRole('heading', { name: locale.limitations })).toBeVisible();
			await expect(page.getByText(locale.adapter, { exact: true })).toBeVisible();
			await expect(page.getByRole('link', { name: locale.source })).toHaveAttribute(
				'href',
				'https://github.com/sandovaldavid/kioku'
			);
		});
	}
});
