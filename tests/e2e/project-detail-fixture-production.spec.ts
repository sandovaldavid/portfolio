import { expect, test } from '@playwright/test';

const fixtures = [
	{ slug: 'project-detail-fixture', title: 'MCP Systems Fixture' },
	{ slug: 'frontend-project-fixture', title: 'Frontend Product Fixture' },
	{ slug: 'fullstack-project-fixture', title: 'Full-Stack Platform Fixture' },
	{ slug: 'ml-ai-project-fixture', title: 'ML / AI Experiment Fixture' },
] as const;

test.describe('Project Detail development fixtures production boundary', () => {
	test('does not expose development fixtures in the production project catalog', async ({ page }) => {
		await page.goto('/projects/');
		for (const fixture of fixtures) {
			await expect(page.getByRole('heading', { name: fixture.title, exact: true })).toHaveCount(0);
			await expect(page.locator(`a[href*="${fixture.slug}"]`)).toHaveCount(0);
		}
	});

	for (const fixture of fixtures) {
		test(`${fixture.slug} does not generate production detail routes`, async ({ page }) => {
			for (const prefix of ['', '/es']) {
				const response = await page.goto(`${prefix}/projects/${fixture.slug}/`);
				expect(response?.status()).toBe(404);
				await expect(page.locator('[data-project-case-study="mdx"]')).toHaveCount(0);
			}
		});
	}
});
