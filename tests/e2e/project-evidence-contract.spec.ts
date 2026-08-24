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

	test('detail action bar adapts repositories, documentation, live demo and share to project evidence', async ({
		page,
	}) => {
		await page.goto('/projects/kioku');
		const kiokuResources = page.locator('[data-project-resources]');
		await expect(kiokuResources.locator('[data-project-resource="repository"]')).toHaveCount(2);
		await expect(kiokuResources.locator('[data-project-resource="docs"]')).toHaveCount(1);
		await expect(kiokuResources.locator('[data-project-resource="package"]')).toHaveCount(1);
		await expect(kiokuResources.locator('[data-project-resource="demo"]')).toHaveCount(0);
		await expect(kiokuResources.locator('[data-project-share]')).toBeVisible();
		await expect(kiokuResources.locator('a[href="https://github.com/sandovaldavid/kioku"]')).toBeVisible();
		await expect(
			kiokuResources.locator('a[href="https://github.com/sandovaldavid/kioku-obsidian"]')
		).toBeVisible();
		await expect(kiokuResources.locator('a[href="https://kioku.sandovaldavid.com"]')).toBeVisible();

		await page.goto('/projects/fluentreads');
		const fluentReadsResources = page.locator('[data-project-resources]');
		await expect(fluentReadsResources.locator('[data-project-resource="repository"]')).toHaveCount(1);
		await expect(fluentReadsResources.locator('[data-project-resource="demo"]')).toHaveCount(1);
		await expect(fluentReadsResources.locator('[data-project-share]')).toBeVisible();

		await page.goto('/projects/yukidoke');
		const yukidokeResources = page.locator('[data-project-resources]');
		await expect(yukidokeResources.locator('[data-project-resource="repository"]')).toHaveCount(0);
		await expect(yukidokeResources.locator('[data-project-resource="docs"]')).toHaveCount(0);
		await expect(yukidokeResources.locator('[data-project-resource="demo"]')).toHaveCount(0);
		await expect(yukidokeResources.locator('[data-project-resource="package"]')).toHaveCount(0);
		await expect(yukidokeResources.locator('[data-project-share]')).toBeVisible();
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

	test('/projects/mad-ai distinguishes its public Angular client from the private Django API', async ({
		page,
	}) => {
		await page.goto('/projects/mad-ai');
		await expect(page.getByText('MAINTAINED · ANGULAR 20 + DJANGO 5.2', { exact: true })).toBeVisible();
		await expect(page.getByText('PUBLIC CLIENT · PRIVATE API', { exact: true })).toBeVisible();
		await expect(page.locator('a[href="https://github.com/sandovaldavid/MAD-AI"]')).toBeVisible();
		await expect(
			page.getByRole('heading', { name: 'The private API uses a pragmatic modular Django architecture' })
		).toBeVisible();
		await expect(page.getByText('Django 5.2.3', { exact: false })).toBeVisible();
		await expect(page.getByText('Django REST Framework 3.16.0', { exact: false })).toBeVisible();
		await expect(page.getByText('Django Channels', { exact: true })).toHaveCount(0);
	});

	test('/projects/fluentreads keeps source and its verified live demo actionable without stale metrics', async ({
		page,
	}) => {
		await page.goto('/projects/fluentreads');
		await expect(page.getByText('LIVE DEMO', { exact: true })).toBeVisible();
		await expect(page.locator('a[href="https://fluentreads.vercel.app"]')).toBeVisible();
		await expect(page.locator('a[href="https://github.com/sandovaldavid/fluentreads"]')).toBeVisible();
		await expect(
			page.getByRole('heading', { name: 'NO DATABASE, AUTH OR ONLINE PAYMENT GATEWAY' })
		).toBeVisible();
		await expect(page.getByText(/95\+ Performance|100 Accessibility/)).toHaveCount(0);
	});

	test('/projects/auctions exposes analytics plus the current concurrency and runtime boundaries', async ({
		page,
	}) => {
		await page.goto('/projects/auctions');
		await expect(page.getByText('NO PUBLIC DEMO', { exact: true })).toBeVisible();
		await expect(page.locator('a[href="https://github.com/sandovaldavid/auctions"]')).toBeVisible();
		await expect(page.locator('a[href*="herokuapp.com"]')).toHaveCount(0);
		await expect(page.getByRole('heading', { name: 'The maintained codebase grew beyond the original course workflow' })).toBeVisible();
		await expect(page.getByText('AuctionAnalytics', { exact: false }).first()).toBeVisible();
		await expect(
			page.getByRole('heading', { name: 'NO LIVE DEMO OR CONCURRENCY GUARANTEE' })
		).toBeVisible();
		await expect(page.getByRole('heading', { name: 'NO CURRENT DRF OR WEBSOCKET CLAIM' })).toBeVisible();
	});
});
