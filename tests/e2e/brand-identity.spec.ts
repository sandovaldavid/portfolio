import type { Page } from '@playwright/test';
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

const navigationLocales = [
	{ path: '/', accessibleName: 'David Sandoval — Home' },
	{ path: '/es/', accessibleName: 'David Sandoval — Inicio' },
] as const;

async function installTheme(page: Page, theme: 'light' | 'dark') {
	await page.addInitScript(value => localStorage.setItem('theme', value), theme);
}

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

test.describe('navigation brand lockup', () => {
	for (const locale of navigationLocales) {
		test(`${locale.path} exposes the localized home signature`, async ({ page }) => {
			await page.setViewportSize({ width: 1280, height: 800 });
			await installTheme(page, 'dark');
			await page.goto(locale.path);

			const brandLink = page.locator('header a.brand-logo-link');
			const signature = brandLink.locator('.brand-logo-signature');

			await expect(brandLink).toBeVisible();
			await expect(brandLink).toHaveAttribute('aria-label', locale.accessibleName);
			await expect(brandLink).toHaveCSS('height', '44px');
			await expect(signature).toBeVisible();
			await expect(signature).toHaveText('<sandovaldavid/>');
			await expect(brandLink.locator('[data-brand-mode="dark"]')).toBeVisible();
			await expect(brandLink.locator('[data-brand-mode="light"]')).toBeHidden();

			const typography = await signature.evaluate(element => {
				const style = getComputedStyle(element);
				return {
					fontFamily: style.fontFamily,
					fontSize: style.fontSize,
					lineHeight: style.lineHeight,
					letterSpacing: style.letterSpacing,
				};
			});
			expect(typography.fontFamily).toContain('Share Tech Mono');
			expect(typography.fontSize).toBe('16px');
			expect(typography.lineHeight).toBe('22px');
			expect(typography.letterSpacing).toBe('1px');
		});
	}

	for (const theme of ['light', 'dark'] as const) {
		test(`${theme} mode exposes stable default, hover and focus states`, async ({ page }, testInfo) => {
			await page.setViewportSize({ width: 1280, height: 800 });
			await installTheme(page, theme);
			await page.goto('/');

			const header = page.locator('header').first();
			const brandLink = header.locator('a.brand-logo-link');
			const signature = brandLink.locator('.brand-logo-signature');
			const activeAsset = brandLink.locator(`[data-brand-mode="${theme}"]`);
			const inactiveAsset = brandLink.locator(
				`[data-brand-mode="${theme === 'light' ? 'dark' : 'light'}"]`
			);

			await expect(activeAsset).toBeVisible();
			await expect(inactiveAsset).toBeHidden();

			const defaultState = await signature.evaluate(element => ({
				color: getComputedStyle(element).color,
				underlineTransform: getComputedStyle(element, '::after').transform,
			}));
			await testInfo.attach(`navigation-lockup-${theme}-default`, {
				body: await header.screenshot(),
				contentType: 'image/png',
			});

			await brandLink.hover();
			const hoverState = await signature.evaluate(element => ({
				color: getComputedStyle(element).color,
				underlineTransform: getComputedStyle(element, '::after').transform,
			}));
			expect(hoverState.color).not.toBe(defaultState.color);
			expect(hoverState.underlineTransform).not.toBe(defaultState.underlineTransform);
			await testInfo.attach(`navigation-lockup-${theme}-hover`, {
				body: await header.screenshot(),
				contentType: 'image/png',
			});

			await brandLink.focus();
			await expect(brandLink).toBeFocused();
			const focusState = await brandLink.evaluate(element => {
				const style = getComputedStyle(element);
				return {
					outlineWidth: style.outlineWidth,
					outlineStyle: style.outlineStyle,
					outlineColor: style.outlineColor,
				};
			});
			expect(focusState.outlineWidth).toBe('2px');
			expect(focusState.outlineStyle).toBe('solid');
			expect(focusState.outlineColor).not.toBe('rgba(0, 0, 0, 0)');
			await testInfo.attach(`navigation-lockup-${theme}-focus`, {
				body: await header.screenshot(),
				contentType: 'image/png',
			});
		});
	}

	for (const viewport of [
		{ width: 390, signatureVisible: false, mobileMenuVisible: true },
		{ width: 768, signatureVisible: true, mobileMenuVisible: true },
		{ width: 1024, signatureVisible: true, mobileMenuVisible: false },
		{ width: 1440, signatureVisible: true, mobileMenuVisible: false },
	] as const) {
		test(`stays collision-free at ${viewport.width}px`, async ({ page }) => {
			await page.setViewportSize({ width: viewport.width, height: 844 });
			await installTheme(page, 'dark');
			await page.goto('/');

			const brandLink = page.locator('header a.brand-logo-link');
			const signature = brandLink.locator('.brand-logo-signature');
			const mobileMenu = page.locator('#mobile-menu-btn');
			const desktopNav = page.locator('header nav[aria-label="Main navigation"]');

			if (viewport.signatureVisible) {
				await expect(signature).toBeVisible();
			} else {
				await expect(signature).toBeHidden();
			}

			if (viewport.mobileMenuVisible) {
				await expect(mobileMenu).toBeVisible();
				await expect(desktopNav).toBeHidden();
				const brandBox = await brandLink.boundingBox();
				const menuBox = await mobileMenu.boundingBox();
				expect(brandBox).not.toBeNull();
				expect(menuBox).not.toBeNull();
				expect((brandBox?.x ?? 0) + (brandBox?.width ?? 0)).toBeLessThanOrEqual(
					menuBox?.x ?? Number.POSITIVE_INFINITY
				);
			} else {
				await expect(mobileMenu).toBeHidden();
				await expect(desktopNav).toBeVisible();
			}

			const overflow = await page.evaluate(() => ({
				documentWidth: document.documentElement.scrollWidth,
				viewportWidth: window.innerWidth,
			}));
			expect(overflow.documentWidth).toBeLessThanOrEqual(overflow.viewportWidth);
		});
	}

	test('captures compact mobile evidence in Light and Dark Mode', async ({ page }, testInfo) => {
		await page.setViewportSize({ width: 390, height: 844 });

		for (const theme of ['light', 'dark'] as const) {
			await page.addInitScript(value => localStorage.setItem('theme', value), theme);
			await page.goto('/');
			const header = page.locator('header').first();
			await expect(header.locator('.brand-logo-signature')).toBeHidden();
			await testInfo.attach(`navigation-lockup-${theme}-mobile`, {
				body: await header.screenshot(),
				contentType: 'image/png',
			});
		}
	});

	test('reduced motion keeps the lockup stable and free of inline animation', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.setViewportSize({ width: 1280, height: 800 });
		await installTheme(page, 'dark');
		await page.goto('/');

		const brandLink = page.locator('header a.brand-logo-link');
		await brandLink.hover();
		const motion = await brandLink.evaluate(element => {
			const signature = element.querySelector<HTMLElement>('.brand-logo-signature');
			const linkStyle = getComputedStyle(element);
			const signatureStyle = signature ? getComputedStyle(signature) : null;
			const underlineStyle = signature ? getComputedStyle(signature, '::after') : null;
			return {
				linkAnimation: linkStyle.animationName,
				linkTransition: linkStyle.transitionDuration,
				signatureAnimation: signatureStyle?.animationName,
				signatureTransition: signatureStyle?.transitionDuration,
				underlineTransition: underlineStyle?.transitionDuration,
				hasInlineStyle: element.hasAttribute('style') || Boolean(signature?.hasAttribute('style')),
			};
		});

		expect(motion.linkAnimation).toBe('none');
		expect(motion.signatureAnimation).toBe('none');
		expect(motion.linkTransition).toBe('0s');
		expect(motion.signatureTransition).toBe('0s');
		expect(motion.underlineTransition).toBe('0s');
		expect(motion.hasInlineStyle).toBe(false);
	});
});
