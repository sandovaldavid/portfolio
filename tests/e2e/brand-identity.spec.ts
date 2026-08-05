import { expect, test } from './fixtures';

const brandAssets = [
	['/favicon.svg', 'image/svg+xml'],
	['/favicon.ico', 'image/'],
	['/brand/favicon-16-light.svg', 'image/svg+xml'],
	['/brand/favicon-16-dark.svg', 'image/svg+xml'],
	['/brand/favicon-32-light.svg', 'image/svg+xml'],
	['/brand/favicon-32-dark.svg', 'image/svg+xml'],
	['/brand/favicon-64-light.svg', 'image/svg+xml'],
	['/brand/favicon-64-dark.svg', 'image/svg+xml'],
	['/brand/logo-primary-light.svg', 'image/svg+xml'],
	['/brand/logo-primary-dark.svg', 'image/svg+xml'],
	['/brand/project-mark-light.svg', 'image/svg+xml'],
	['/brand/project-mark-dark.svg', 'image/svg+xml'],
	['/brand/icon-192.png', 'image/png'],
	['/brand/icon-512.png', 'image/png'],
	['/apple-touch-icon.png', 'image/png'],
	['/brand/og-image-light.png', 'image/png'],
	['/brand/og-image-dark.png', 'image/png'],
	['/brand/watermark-light.svg', 'image/svg+xml'],
	['/brand/watermark-dark.svg', 'image/svg+xml'],
] as const;

test.describe('brand identity assets and typography', () => {
	test('serves the complete light and dark asset matrix', async ({ request }) => {
		for (const [path, contentType] of brandAssets) {
			const response = await request.get(path);
			expect(response.ok(), path).toBe(true);
			expect(response.headers()['content-type'], path).toContain(contentType);
			expect((await response.body()).byteLength, path).toBeGreaterThan(100);
		}
	});

	test('home metadata uses the branded dark Open Graph card', async ({ page }) => {
		for (const path of ['/', '/es/']) {
			await page.goto(path);
			await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
			await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
				'content',
				'https://sandovaldavid.com/brand/og-image-dark.png'
			);
			await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
				'content',
				'https://sandovaldavid.com/brand/og-image-dark.png'
			);
		}
	});

	test('manifest references the approved default project mark exports', async ({ request }) => {
		const response = await request.get('/site.webmanifest');
		expect(response.ok()).toBe(true);
		const manifest = (await response.json()) as {
			background_color: string;
			theme_color: string;
			icons: Array<{ src: string; sizes: string }>;
		};

		expect(manifest.background_color).toBe('#020408');
		expect(manifest.theme_color).toBe('#00B0FF');
		expect(manifest.icons).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ src: '/brand/icon-192.png', sizes: '192x192' }),
				expect.objectContaining({ src: '/brand/icon-512.png', sizes: '512x512' }),
			])
		);
	});

	test('hero display font survives a full reload without falling back', async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => document.fonts.ready);

		const assertHeroFont = async () => {
			const font = await page.locator('#hero-title').evaluate(element => {
				const style = getComputedStyle(element);
				return {
					family: style.fontFamily,
					weight: style.fontWeight,
					loaded: document.fonts.check('700 72px "JetBrains Mono"', 'David Sandoval'),
				};
			});
			expect(font.family).toContain('JetBrains Mono');
			expect(font.weight).toBe('700');
			expect(font.loaded).toBe(true);
		};

		await assertHeroFont();
		await page.reload({ waitUntil: 'networkidle' });
		await page.evaluate(() => document.fonts.ready);
		await assertHeroFont();
	});
});
