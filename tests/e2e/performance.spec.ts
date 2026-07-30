import { test, expect } from './fixtures';

const PRIORITY_LINKS = ['projects', 'blog', 'about-me'] as const;
const NON_PRIORITY_LINKS = ['experience', 'research'] as const;
const ROUTES = ['/', '/es/'] as const;

test.describe('Selective prefetch and font loading', () => {
	for (const route of ROUTES) {
		test(`${route} prefetches only the recruiter journey`, async ({ page }) => {
			await page.goto(route);

			for (const label of PRIORITY_LINKS) {
				const links = page.locator(`header a[data-section-id="${label}"]`);
				const count = await links.count();
				expect(count).toBeGreaterThan(0);
				for (let index = 0; index < count; index++) {
					await expect(links.nth(index)).toHaveAttribute('data-astro-prefetch', 'hover');
				}
			}

			for (const label of NON_PRIORITY_LINKS) {
				const links = page.locator(`header a[data-section-id="${label}"]`);
				const count = await links.count();
				expect(count).toBeGreaterThan(0);
				for (let index = 0; index < count; index++) {
					await expect(links.nth(index)).not.toHaveAttribute('data-astro-prefetch');
				}
			}

			await expect(page.locator('link[rel="preload"][as="font"]')).toHaveCount(1);
		});
	}
});
