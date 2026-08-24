import { test, expect } from '@playwright/test';

test.describe('Recruiter evidence, access and status contract', () => {
	test('homepage featured cards expose lifecycle and only actionable public source evidence', async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/');

		const yukidokeCard = page.locator('article', {
			has: page.getByRole('heading', { name: 'Yukidoke' }),
		});
		await expect(yukidokeCard.getByText('Active', { exact: true })).toBeVisible();
		await expect(yukidokeCard.locator('a[href*="github.com/sandovaldavid/yukidoke"]')).toHaveCount(
			0
		);

		const kiokuCard = page.locator('article', {
			has: page.getByRole('heading', { name: 'Kioku' }),
		});
		await expect(kiokuCard.getByText('Active', { exact: true })).toBeVisible();
		await expect(
			kiokuCard.locator('a[href="https://github.com/sandovaldavid/kioku"]')
		).toBeVisible();
	});

	for (const locale of [
		{
			path: '/projects/campus-map',
			status: 'MAINTAINED · NEXT.JS 16 CODEBASE',
			source: 'https://github.com/sandovaldavid/unp-campus-map',
			boundary: 'THE INTERACTIVE MAP IS NOT PRESENTED AS SHIPPED',
		},
		{
			path: '/es/projects/campus-map',
			status: 'MANTENIDO · CODEBASE NEXT.JS 16',
			source: 'https://github.com/sandovaldavid/unp-campus-map',
			boundary: 'EL MAPA INTERACTIVO NO SE PRESENTA COMO ENTREGADO',
		},
	] as const) {
		test(`${locale.path} exposes source while keeping unavailable demo explicit`, async ({ page }) => {
			await page.goto(locale.path);
			await expect(page.getByText(locale.status, { exact: true })).toBeVisible();
			await expect(page.locator(`a[href="${locale.source}"]`)).toBeVisible();
			await expect(page.getByRole('heading', { name: locale.boundary })).toBeVisible();
			await expect(page.locator('a[href*="mapa-unp.sandovaldavid.com"]')).toHaveCount(0);
		});
	}

	test('/projects/fluentreads keeps source and its verified live demo actionable', async ({ page }) => {
		await page.goto('/projects/fluentreads');
		await expect(page.getByText('LIVE DEMO', { exact: true })).toBeVisible();
		await expect(page.locator('a[href="https://fluentreads.vercel.app"]')).toBeVisible();
		await expect(page.locator('a[href="https://github.com/sandovaldavid/fluentreads"]')).toBeVisible();
		await expect(
			page.getByRole('heading', { name: 'NO DATABASE, AUTH OR ONLINE PAYMENT GATEWAY' })
		).toBeVisible();
	});

	test('/projects/auctions does not surface the historical placeholder demo', async ({ page }) => {
		await page.goto('/projects/auctions');
		await expect(page.getByText('NO PUBLIC DEMO', { exact: true })).toBeVisible();
		await expect(page.locator('a[href="https://github.com/sandovaldavid/auctions"]')).toBeVisible();
		await expect(page.locator('a[href*="herokuapp.com"]')).toHaveCount(0);
	});
});
