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
			status: 'ACTIVE · STABLE 3.1.2 + DEVELOPMENT',
			problem: 'Agent context should survive the session that created it',
			system: 'Local-first MCP boundary',
			evidence: 'What is verifiable today',
			learnings: 'What this project changed in how I build',
			resources: 'Project resources',
		},
		{
			path: '/es/projects/kioku',
			kicker: 'CASO DE ESTUDIO · INGENIERÍA BACKEND',
			status: 'ACTIVO · ESTABLE 3.1.2 + DESARROLLO',
			problem: 'El contexto del agente debe sobrevivir a la sesión que lo creó',
			system: 'Límite MCP local-first',
			evidence: 'Qué es verificable hoy',
			learnings: 'Qué cambió este proyecto en mi forma de construir',
			resources: 'Recursos del proyecto',
		},
	] as const) {
		test(`renders current bilingual evidence at ${locale.path}`, async ({ page }) => {
			await page.goto(locale.path);

			const caseStudy = page.locator('[data-project-case-study="mdx"]');
			await expect(caseStudy).toBeVisible();
			await expect(page.getByRole('heading', { level: 1, name: 'Kioku' })).toBeVisible();
			await expect(page.getByText(locale.kicker, { exact: true })).toBeVisible();
			await expect(page.getByText(locale.status, { exact: true })).toBeVisible();
			await expect(page.getByRole('heading', { name: locale.problem })).toBeVisible();
			await expect(page.getByRole('heading', { name: locale.system })).toBeVisible();
			await expect(page.getByRole('heading', { name: locale.evidence })).toBeVisible();
			await expect(page.getByRole('heading', { name: locale.learnings })).toBeVisible();
			await expect(page.getByRole('navigation', { name: locale.resources })).toBeVisible();

			for (const href of [
				'https://kioku.sandovaldavid.com',
				'https://github.com/sandovaldavid/kioku',
				'https://www.nuget.org/packages/kioku-mcp-server',
				'https://github.com/sandovaldavid/kioku-obsidian',
			]) {
				await expect(page.locator(`a[href="${href}"]`)).toBeVisible();
			}

			await expect(page.locator('[data-mermaid-figure]')).toHaveCount(2);
			await expect(page.getByText('3.1.2', { exact: false }).first()).toBeVisible();
		});
	}
});
