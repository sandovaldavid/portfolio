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
			status: 'ACTIVE · STABLE 2.3.0 + DEVELOPMENT',
			source: 'PUBLIC SOURCE',
			demo: 'NO HOSTED DEMO',
			problem: 'SESSION CONTEXT IS NOT DURABLE',
			approach: 'LOCAL-FIRST MCP + OBSIDIAN',
			tradeoffs: 'ONE DEPLOYABLE ASSEMBLY',
			outcome: 'PUBLISHED TOOL AND HANDOFF EVIDENCE',
			evidence: 'Evidence and limitations',
			verified: 'RELEASES, TESTS, CI AND DOCUMENTED EVALUATION',
			boundaries: 'UNRELEASED WORK IS LABELED',
			learnings: 'Learning extraction',
			learningBody:
				'Durable, human-readable Markdown survives session and process boundaries better than provider-specific history.',
		},
		{
			path: '/es/projects/kioku',
			kicker: 'CASO DE ESTUDIO · INGENIERÍA BACKEND',
			status: 'ACTIVO · ESTABLE 2.3.0 + DESARROLLO',
			source: 'CÓDIGO PÚBLICO',
			demo: 'SIN DEMO ALOJADA',
			problem: 'EL CONTEXTO DE SESIÓN NO ES DURABLE',
			approach: 'MCP LOCAL-FIRST + OBSIDIAN',
			tradeoffs: 'UN SOLO ENSAMBLADO DESPLEGABLE',
			outcome: 'HERRAMIENTA PUBLICADA Y EVIDENCIA DE TRASPASO',
			evidence: 'Evidencia y limitaciones',
			verified: 'RELEASES, TESTS, CI Y EVALUACIÓN DOCUMENTADA',
			boundaries: 'EL TRABAJO NO PUBLICADO ESTÁ ETIQUETADO',
			learnings: 'Extracción de aprendizajes',
			learningBody:
				'Markdown durable y legible por humanos sobrevive mejor los límites de sesión y proceso que un historial específico de proveedor.',
		},
	]) {
		test(`renders the concise bilingual v2 presentation at ${locale.path}`, async ({ page }) => {
			await page.goto(locale.path);

			const caseStudy = page.locator('[data-project-case-study="v2"]');
			await expect(caseStudy).toBeVisible();
			await expect(page.getByRole('heading', { level: 1, name: 'Kioku' })).toBeVisible();
			await expect(page.getByText(locale.kicker, { exact: true })).toBeVisible();
			await expect(page.getByText(locale.status, { exact: true })).toBeVisible();
			await expect(page.getByText(locale.demo, { exact: true })).toBeVisible();
			await expect(page.getByRole('heading', { name: locale.problem })).toBeVisible();
			await expect(page.getByRole('heading', { name: locale.approach })).toBeVisible();
			await expect(page.getByRole('heading', { name: locale.tradeoffs })).toBeVisible();
			await expect(page.getByRole('heading', { name: locale.outcome })).toBeVisible();
			await expect(page.getByRole('heading', { name: locale.evidence })).toBeVisible();
			await expect(page.getByRole('heading', { name: locale.verified })).toBeVisible();
			await expect(page.getByRole('heading', { name: locale.boundaries })).toBeVisible();
			await expect(page.getByRole('heading', { name: locale.learnings })).toBeVisible();
			await expect(page.getByText(locale.learningBody, { exact: true })).toBeVisible();

			const sourceBadgeLink = page.locator('a[href="https://github.com/sandovaldavid/kioku"]');
			await expect(sourceBadgeLink).toBeVisible();
			await expect(sourceBadgeLink).toContainText(locale.source);

			await expect(caseStudy.locator('figure')).toHaveCount(0);
		});
	}
});