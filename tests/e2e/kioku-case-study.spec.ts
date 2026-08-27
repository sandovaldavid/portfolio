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
			kicker: 'PROJECT CASE STUDY · BACKEND ENGINEERING',
			lifecycle: 'Active',
			source: 'Public source',
			version: 'v3.1.2',
			problem: 'Agent context should survive the session that created it',
			system: 'Local-first MCP boundary',
			releaseStatus: 'A stable release and an active development line',
			learnings: 'What this project changed in how I build',
			resources: 'Project resources',
			share: 'Share',
		},
		{
			path: '/es/projects/kioku',
			kicker: 'CASO DE ESTUDIO · INGENIERÍA BACKEND',
			lifecycle: 'Activo',
			source: 'Código público',
			version: 'v3.1.2',
			problem: 'El contexto de un agente debe sobrevivir a la sesión que lo creó',
			system: 'Límite MCP local-first',
			releaseStatus: 'Una versión estable y una línea de desarrollo activa',
			learnings: 'Qué cambió este proyecto en mi forma de construir',
			resources: 'Recursos del proyecto',
			share: 'Compartir',
		},
	] as const) {
		test(`renders current bilingual project facts at ${locale.path}`, async ({ page }) => {
			await page.goto(locale.path);

			const caseStudy = page.locator('[data-project-case-study="mdx"]');
			await expect(caseStudy).toBeVisible();
			await expect(page.getByRole('heading', { level: 1, name: 'Kioku' })).toBeVisible();
			await expect(page.getByText(locale.kicker, { exact: true })).toBeVisible();
			await expect(page.getByText(locale.lifecycle, { exact: true })).toBeVisible();
			await expect(page.getByText(locale.source, { exact: true })).toBeVisible();
			await expect(page.getByText(locale.version, { exact: true })).toBeVisible();
			await expect(page.getByRole('heading', { name: locale.problem })).toBeVisible();
			await expect(page.getByRole('heading', { name: locale.system })).toBeVisible();
			await expect(page.getByRole('heading', { name: locale.releaseStatus })).toBeVisible();
			await expect(page.getByRole('heading', { name: locale.learnings })).toBeVisible();

			const resources = page.getByRole('navigation', { name: locale.resources });
			await expect(resources).toBeVisible();
			await expect(resources.locator('[data-project-resource="repository"]')).toHaveCount(2);
			await expect(resources.locator('[data-resource-tone="info"]')).toHaveCount(2);
			await expect(resources.locator('[data-project-resource="docs"]')).toHaveAttribute(
				'data-resource-tone',
				'brand'
			);
			await expect(resources.locator('[data-project-resource="package"]')).toHaveAttribute(
				'data-resource-tone',
				'secondary'
			);
			await expect(resources.getByRole('button', { name: locale.share })).toBeVisible();

			for (const href of [
				'https://kioku.sandovaldavid.com',
				'https://github.com/sandovaldavid/kioku',
				'https://www.nuget.org/packages/kioku-mcp-server',
				'https://github.com/sandovaldavid/kioku-obsidian',
			]) {
				await expect(page.locator(`a[href="${href}"]`)).toBeVisible();
			}

			const diagrams = page.locator('[data-mermaid-figure]');
			await expect(diagrams).toHaveCount(2);
			for (let index = 0; index < 2; index += 1) {
				const diagram = diagrams.nth(index);
				await diagram.scrollIntoViewIfNeeded();

				const host = diagram.locator('[data-mermaid-host]');
				await expect(host).toHaveAttribute('data-mermaid-state', 'rendered');
				await expect(host).toHaveAttribute('role', 'region');
				await expect(host).toHaveAttribute('tabindex', '0');
				await expect(host).toHaveAttribute('aria-label', /.+/);

				const svg = diagram.locator('[data-diagram-svg]');
				await expect(svg).toBeVisible();
				await expect(svg).toHaveAttribute('role', 'img');
			}
		});
	}
});
