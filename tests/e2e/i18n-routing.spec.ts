import { expect, test } from './fixtures';

const routePairs = [
	{ source: '/', label: 'Español', target: '/es/' },
	{ source: '/es/', label: 'English', target: '/' },
	{ source: '/about', label: 'Español', target: '/es/about/' },
	{ source: '/es/about', label: 'English', target: '/about/' },
	{ source: '/about/', label: 'Español', target: '/es/about/' },
	{ source: '/es/about/', label: 'English', target: '/about/' },
	{ source: '/blog', label: 'Español', target: '/es/blog/' },
	{ source: '/es/blog', label: 'English', target: '/blog/' },
	{ source: '/projects/yukidoke', label: 'Español', target: '/es/projects/yukidoke/' },
	{ source: '/es/projects/yukidoke', label: 'English', target: '/projects/yukidoke/' },
] as const;

async function openLanguagePanel(page: import('@playwright/test').Page) {
	const recruiterToggle = page.locator('#recruiter-hud-toggle');
	if (await recruiterToggle.isVisible().catch(() => false)) {
		await recruiterToggle.click();
		const panel = page.locator('#recruiter-hud-panel');
		await expect(panel).toBeVisible();
		return panel;
	}

	await page.locator('#mobile-menu-btn').click();
	const menu = page.locator('#mobile-menu');
	await expect(menu).toBeVisible();
	return menu;
}

test.describe('Astro-native locale routing', () => {
	for (const scenario of routePairs) {
		test(`${scenario.source} resolves ${scenario.target}`, async ({ page }) => {
			await page.goto(scenario.source);

			// Static SEO alternates use the canonical directory route shape generated
			// by Astro (trailing slash for non-root pages). LanguagePicker path-shape
			// preservation is tested separately below because it operates on the live
			// browser URL, including query strings and fragments.
			const targetLanguage = scenario.label === 'Español' ? 'es' : 'en';
			const alternate = page.locator(
				`head link[rel="alternate"][hreflang="${targetLanguage}"]:not([type])`
			);
			await expect(alternate).toHaveCount(1);
			const alternateHref = await alternate.getAttribute('href');
			expect(alternateHref).not.toBeNull();
			const alternateUrl = new URL(alternateHref!, page.url());
			expect(alternateUrl.pathname).toBe(scenario.target);

			if (scenario.label === 'English') {
				expect(alternateUrl.pathname).not.toMatch(/^\/en(?:\/|$)/);
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
