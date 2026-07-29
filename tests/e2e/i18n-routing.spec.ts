import { expect, test } from './fixtures';

const routePairs = [
	{ source: '/', label: 'Español', target: '/es/' },
	{ source: '/es/', label: 'English', target: '/' },
	{ source: '/about', label: 'Español', target: '/es/about' },
	{ source: '/es/about', label: 'English', target: '/about' },
	{ source: '/about/', label: 'Español', target: '/es/about/' },
	{ source: '/es/about/', label: 'English', target: '/about/' },
	{ source: '/blog', label: 'Español', target: '/es/blog' },
	{ source: '/es/blog', label: 'English', target: '/blog' },
	{ source: '/projects/yukidoke', label: 'Español', target: '/es/projects/yukidoke' },
	{ source: '/es/projects/yukidoke', label: 'English', target: '/projects/yukidoke' },
] as const;

async function openLanguagePanel(page: import('@playwright/test').Page) {
	await page.locator('#recruiter-hud-toggle').click();
	const panel = page.locator('#recruiter-hud-panel');
	await expect(panel).toBeVisible();
	return panel;
}

test.describe('Astro-native locale routing', () => {
	for (const scenario of routePairs) {
		test(`${scenario.source} resolves ${scenario.target}`, async ({ page }) => {
			await page.goto(scenario.source);
			const panel = await openLanguagePanel(page);
			const target = panel.getByRole('link', { name: scenario.label });

			await expect(target).toHaveAttribute('href', scenario.target);
			if (scenario.label === 'English') {
				await expect(target).not.toHaveAttribute('href', /^\/en(?:\/|$)/);
			}
		});
	}

	test('preserves query and fragment through ClientRouter navigation', async ({ page }) => {
		await page.goto('/about?source=e2e#focus');
		let panel = await openLanguagePanel(page);
		const spanishLink = panel.getByRole('link', { name: 'Español' });

		await expect(spanishLink).toHaveAttribute('href', '/es/about?source=e2e#focus');
		await spanishLink.click();
		await expect(page).toHaveURL(/\/es\/about\?source=e2e#focus$/);
		await expect(page.locator('html')).toHaveAttribute('lang', 'es');

		panel = await openLanguagePanel(page);
		const englishLink = panel.getByRole('link', { name: 'English' });
		await expect(englishLink).toHaveAttribute('href', '/about?source=e2e#focus');
		await englishLink.click();
		await expect(page).toHaveURL(/\/about\?source=e2e#focus$/);
		await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	});

	for (const path of ['/en/about', '/fr/about']) {
		test(`${path} is not accepted as a locale route`, async ({ page }) => {
			const response = await page.goto(path);
			expect(response?.status()).toBe(404);
		});
	}
});
