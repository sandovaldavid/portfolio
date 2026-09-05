import { test, expect } from '@playwright/test';

test.describe('Yukidoke flagship case study', () => {
	test('is the first featured project on the English homepage', async ({ page }) => {
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
			lifecycle: 'Active',
			source: 'Private source',
			problem: 'Shared household money still contains private information',
			system: 'Presentation is separated from financial authority',
			implementation: 'What the V1 beta includes today',
			privacy: 'Resource existence is part of the authorization model',
			boundary: 'V1 remains a private beta',
			learning: 'Engineering lessons from the household boundary',
		},
		{
			path: '/es/projects/yukidoke',
			lifecycle: 'Activo',
			source: 'Código privado',
			problem: 'El dinero compartido del hogar todavía contiene información privada',
			system: 'La presentación está separada de la autoridad financiera',
			implementation: 'Qué incluye hoy la beta V1',
			privacy: 'La existencia de un recurso forma parte del modelo de autorización',
			boundary: 'V1 sigue en beta privada',
			learning: 'Lecciones de ingeniería del límite por hogar',
		},
	] as const) {
		test(`renders current bilingual MDX at ${locale.path}`, async ({ page }) => {
			await page.goto(locale.path);

			await expect(page.locator('[data-project-case-study="mdx"]')).toBeVisible();
			await expect(page.getByRole('heading', { level: 1, name: 'Yukidoke' })).toBeVisible();

			const status = page.locator('[data-project-status]');
			await expect(status).toContainText(locale.lifecycle);
			await expect(status).toContainText(locale.source);

			for (const heading of [
				locale.problem,
				locale.system,
				locale.implementation,
				locale.privacy,
				locale.boundary,
				locale.learning,
			]) {
				await expect(page.getByRole('heading', { name: heading })).toBeVisible();
			}

			await expect(page.getByText('0.9.0-rc.1', { exact: true })).toBeVisible();

			const mermaidFigure = page.locator('[data-mermaid-figure]');
			await expect(mermaidFigure).toHaveCount(1);
			await mermaidFigure.scrollIntoViewIfNeeded();
			await expect(mermaidFigure.locator('svg')).toBeVisible();
			await expect(mermaidFigure.getByText('PostgreSQL 16', { exact: true })).toBeVisible();

			await expect(page.locator('a[href*="github.com/sandovaldavid/yukidoke"]')).toHaveCount(
				0
			);
		});
	}
});
