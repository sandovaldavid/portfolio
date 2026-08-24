import { expect, test } from '@playwright/test';

test.describe('Project Detail development fixture production boundary', () => {
	test('does not appear in the production project catalog', async ({ page }) => {
		await page.goto('/projects/');
		await expect(page.getByRole('heading', { name: 'Project Detail Fixture', exact: true })).toHaveCount(0);
		await expect(page.locator('a[href*="project-detail-fixture"]')).toHaveCount(0);
	});

	test('does not generate a production project detail route', async ({ page }) => {
		const response = await page.goto('/projects/project-detail-fixture/');
		expect(response?.status()).toBe(404);
		await expect(page.locator('[data-project-case-study="mdx"]')).toHaveCount(0);
	});

	test('does not generate a Spanish production project detail route', async ({ page }) => {
		const response = await page.goto('/es/projects/project-detail-fixture/');
		expect(response?.status()).toBe(404);
		await expect(page.locator('[data-project-case-study="mdx"]')).toHaveCount(0);
	});
});
