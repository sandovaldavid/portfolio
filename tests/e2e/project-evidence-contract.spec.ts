import { test, expect } from '@playwright/test';

test.describe('Recruiter evidence, access and status contract', () => {
	test('homepage featured cards expose lifecycle and source-access badges', async ({ page }) => {
		await page.goto('/');

		const yukidokeCard = page.locator('article', {
			has: page.getByRole('heading', { name: 'Yukidoke' }),
		});
		await expect(yukidokeCard.getByText('Active', { exact: true })).toBeVisible();
		await expect(yukidokeCard.getByText('Private source', { exact: true })).toBeVisible();

		const kiokuCard = page.locator('article', {
			has: page.getByRole('heading', { name: 'Kioku' }),
		});
		await expect(kiokuCard.getByText('Active', { exact: true })).toBeVisible();
		await expect(kiokuCard.getByText('Public source', { exact: true })).toBeVisible();
	});

	for (const locale of [
		{
			path: '/projects/campus-map',
			lifecycleLabel: 'LIFECYCLE',
			demo: 'No public demo; the previously hosted preview domain no longer resolves.',
			previewButton: 'Preview',
		},
		{
			path: '/es/projects/campus-map',
			lifecycleLabel: 'CICLO DE VIDA',
			demo: 'Sin demo pública; el dominio de vista previa que se alojaba anteriormente ya no resuelve.',
			previewButton: 'Vista previa',
		},
	] as const) {
		test(`${locale.path} discloses the dead demo link instead of presenting it as live`, async ({
			page,
		}) => {
			await page.goto(locale.path);

			await expect(page.getByText(locale.lifecycleLabel).first()).toBeVisible();
			await expect(page.getByText(locale.demo, { exact: true })).toBeVisible();
			await expect(page.getByRole('link', { name: locale.previewButton })).toHaveCount(0);
		});
	}

	test('/projects/fluentreads keeps its verified live demo link', async ({ page }) => {
		await page.goto('/projects/fluentreads');

		await expect(
			page.getByText('Live demo available at the hosted preview deployment.')
		).toBeVisible();
		await expect(page.getByRole('link', { name: 'Preview' })).toHaveAttribute(
			'href',
			'https://fluentreads.vercel.app'
		);
	});
});
