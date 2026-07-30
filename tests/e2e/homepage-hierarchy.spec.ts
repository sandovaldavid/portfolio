import { test, expect } from '@playwright/test';

const ROUTES = ['/', '/es/'] as const;

test.describe('Recruiter-first homepage hierarchy', () => {
	for (const route of ROUTES) {
		test(`${route} orders sections as hero, experience, projects, research, about, technologies`, async ({
			page,
		}) => {
			await page.goto(route);

			const sectionIds = await page
				.locator('main section[id]')
				.evaluateAll(sections => sections.map(section => section.id));

			expect(sectionIds).toEqual([
				'experience',
				'projects',
				'research',
				'about-me',
				'technologies',
			]);
		});

		test(`${route} keeps the top navigation focused on the recruiter journey`, async ({
			page,
		}) => {
			await page.goto(route);

			// The mobile overlay nav renders the same links off-screen, so scope to the
			// desktop nav only (outside #mobile-menu) to count each destination once.
			const navLabels = await page
				.locator('header a[data-section-id]:not(#mobile-menu a)')
				.evaluateAll(links => links.map(link => (link as HTMLElement).dataset.sectionId));

			expect(navLabels).toEqual(['experience', 'projects', 'research', 'about-me', 'blog']);
			await expect(page.locator('header a[data-section-id="technologies"]')).toHaveCount(0);
		});
	}

	test('the technologies section remains reachable on the page even though it is not top-level nav', async ({
		page,
	}) => {
		await page.goto('/');

		await expect(page.locator('#technologies')).toBeAttached();
		await page.locator('#technologies').scrollIntoViewIfNeeded();
		await expect(page.locator('#technologies')).toBeVisible();
	});
});
