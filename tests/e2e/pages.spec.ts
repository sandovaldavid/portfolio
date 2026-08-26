import { test, expect } from './fixtures';

const pages = [
	{ path: '/', name: 'Home (English)' },
	{ path: '/about', name: 'About (English)' },
	{ path: '/projects', name: 'Projects (English)' },
	{ path: '/blog', name: 'Blog (English)' },
	{ path: '/es/', name: 'Home (Spanish)' },
	{ path: '/es/about', name: 'About (Spanish)' },
	{ path: '/es/projects', name: 'Projects (Spanish)' },
	{ path: '/es/blog', name: 'Blog (Spanish)' },
];

pages.forEach(({ path, name }) => {
	test(`${name} - should render without errors`, async ({ page }) => {
		await page.goto(path);

		// Verify page loaded successfully
		await expect(page).not.toHaveTitle(/404|Error/i);

		// Check that main content is visible
		const main = page.locator('main, [role="main"]');
		await expect(main).toBeVisible();
	});

	test(`${name} - should have proper meta tags`, async ({ page }) => {
		await page.goto(path);

		// Check for description meta tag
		const description = page.locator('meta[name="description"]');
		await expect(description).toHaveAttribute('content', /.+/);
	});

	test(`${name} - should have proper language attribute`, async ({ page }) => {
		await page.goto(path);

		// Check HTML lang attribute
		const htmlElement = page.locator('html');
		const lang = path.includes('/es') ? 'es' : 'en';
		await expect(htmlElement).toHaveAttribute('lang', lang);
	});
});

const internalRouteExpectations = [
	{ path: '/about', heading: 'David Sandoval' },
	{
		path: '/projects',
		heading: 'Projects built with evidence, scope and trade-offs.',
	},
	{ path: '/es/about', heading: 'David Sandoval' },
	{
		path: '/es/projects',
		heading: 'Proyectos construidos con evidencia, alcance y trade-offs.',
	},
];

test.describe('Internal route layout regression', () => {
	for (const { path, heading } of internalRouteExpectations) {
		test(`${path} renders its unique page content without homepage slots`, async ({ page }) => {
			await page.goto(path);

			const headings = page.locator('main h1');
			await expect(headings).toHaveCount(1);
			await expect(headings).toHaveText(heading);
			await expect(page.locator('#experience')).toHaveCount(0);
			await expect(page.locator('#technologies')).toHaveCount(0);
		});
	}
});

test.describe('Navigation between pages', () => {
	test('should navigate between English pages', async ({ page }) => {
		await page.goto('/');

		// Actually navigate: /blog is the only page link in the header nav
		// (the rest are same-page anchors). On small viewports the desktop nav
		// link is hidden, so open the mobile menu overlay and click there.
		const blogLink = page.locator('header a[href="/blog/"]').first();
		if (await blogLink.isVisible()) {
			await blogLink.click();
		} else {
			await page.locator('#mobile-menu-btn').click();
			await page.locator('#mobile-menu a[href="/blog/"]').click();
		}

		await expect(page).toHaveURL(/\/blog\/?$/);
		await expect(page.locator('main h1').first()).toBeVisible();
	});

	test('should have working links', async ({ page }) => {
		await page.goto('/');

		// Collect distinct internal page hrefs (skip pure anchors) up front
		const hrefs = await page.locator('a[href^="/"]').evaluateAll(anchors =>
			Array.from(
				new Set(
					anchors
						.map(a => a.getAttribute('href') ?? '')
						.filter(href => href !== '' && href !== '#')
						.map(href => href.split('#')[0] || '/')
				)
			)
		);
		expect(hrefs.length).toBeGreaterThan(0);

		// Every checked link must resolve — a null response (same-URL) counts as checked-and-ok
		let checked = 0;
		for (const href of hrefs.slice(0, 5)) {
			const response = await page.goto(href);
			if (response !== null) {
				expect(response.status(), `${href} returned ${response?.status()}`).toBeLessThan(
					400
				);
				checked++;
			}
		}
		expect(checked).toBeGreaterThan(0);
	});
});
