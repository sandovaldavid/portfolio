import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const brandAssets = [
	['/favicon.light.svg', 'image/svg+xml'],
	['/favicon.dark.svg', 'image/svg+xml'],
	['/apple-touch-icon.png', 'image/png'],
	['/og/preview-portfolio-home-en-dark.png', 'image/png'],
	['/og/preview-portfolio-home-es-dark.png', 'image/png'],
	['/brand/favicon-16-light.svg', 'image/svg+xml'],
	['/brand/favicon-16-dark.svg', 'image/svg+xml'],
	['/brand/favicon-32-light.svg', 'image/svg+xml'],
	['/brand/favicon-32-dark.svg', 'image/svg+xml'],
	['/brand/favicon-64-light.svg', 'image/svg+xml'],
	['/brand/favicon-64-dark.svg', 'image/svg+xml'],
	['/brand/logo-primary-light.svg', 'image/svg+xml'],
	['/brand/logo-primary-dark.svg', 'image/svg+xml'],
	['/brand/icon-192.png', 'image/png'],
	['/brand/icon-512.png', 'image/png'],
] as const;

const navigationLocales = [
	{ path: '/', accessibleName: 'David Sandoval — Home' },
	{ path: '/es/', accessibleName: 'David Sandoval — Inicio' },
] as const;

async function installTheme(page: Page, theme: 'light' | 'dark') {
	await page.addInitScript(value => localStorage.setItem('theme', value), theme);
}

function parseTransitionDurations(value: string | undefined): number[] {
	return (value ?? '')
		.split(',')
		.map(duration => duration.trim())
		.filter(Boolean)
		.map(duration =>
			duration.endsWith('ms')
				? Number.parseFloat(duration) / 1000
				: Number.parseFloat(duration)
		);
}

test.describe('brand identity assets and typography', () => {
	test('serves the canonical Logo v2 light and dark asset matrix', async ({ request }) => {
		for (const [path, contentType] of brandAssets) {
			const response = await request.get(path);
			expect(response.ok(), path).toBe(true);
			expect(response.headers()['content-type'], path).toContain(contentType);
			expect((await response.body()).byteLength, path).toBeGreaterThan(100);
		}
	});

	test('home metadata uses localized Open Graph cards and theme-aware favicon', async ({
		page,
	}) => {
		for (const scenario of [
			{ path: '/', image: '/og/preview-portfolio-home-en-dark.png' },
			{ path: '/es/', image: '/og/preview-portfolio-home-es-dark.png' },
		] as const) {
			await page.goto(scenario.path);
			await expect(
				page.locator('link[rel="icon"][media="(prefers-color-scheme: light)"]')
			).toHaveAttribute('href', '/favicon.light.svg');
			await expect(
				page.locator('link[rel="icon"][media="(prefers-color-scheme: dark)"]')
			).toHaveAttribute('href', '/favicon.dark.svg');
			await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
				'content',
				`https://sandovaldavid.com${scenario.image}`
			);
			await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
				'content',
				`https://sandovaldavid.com${scenario.image}`
			);
		}
	});

	test('manifest references Logo v2 app-icon exports, not the retired project mark', async ({
		request,
	}) => {
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
		expect(manifest.icons.some(icon => icon.src.includes('project-mark'))).toBe(false);
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
		test(`${locale.path} exposes the localized home identity`, async ({ page }) => {
			await page.setViewportSize({ width: 1280, height: 800 });
			await installTheme(page, 'dark');
			await page.goto(locale.path);

			const brandLink = page.locator('header a.brand-logo-link');
			const name = brandLink.locator('.brand-logo-name');
			const mark = brandLink.locator('[data-brand-logo]');

			await expect(brandLink).toBeVisible();
			await expect(brandLink).toHaveAttribute('aria-label', locale.accessibleName);
			await expect(brandLink).toHaveCSS('height', '44px');
			await expect(name).toBeVisible();
			await expect(name).toHaveText('David Sandoval');
			await expect(mark).toHaveAttribute('src', '/brand/logo-primary-dark.svg');
			await expect(mark).toHaveAttribute('data-brand-mode', 'dark');

			const typography = await name.evaluate(element => {
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
		test(`${theme} mode exposes stable default, hover and focus states`, async ({
			page,
		}, testInfo) => {
			await page.setViewportSize({ width: 1280, height: 800 });
			await installTheme(page, theme);
			await page.goto('/');

			const header = page.locator('header').first();
			const brandLink = header.locator('a.brand-logo-link');
			const name = brandLink.locator('.brand-logo-name');
			const mark = brandLink.locator('[data-brand-logo]');

			await expect(mark).toHaveAttribute('src', `/brand/logo-primary-${theme}.svg`);
			await expect(mark).toHaveAttribute('data-brand-mode', theme);

			const defaultState = await name.evaluate(element => ({
				color: getComputedStyle(element).color,
				underlineTransform: getComputedStyle(element, '::after').transform,
			}));
			await testInfo.attach(`navigation-lockup-${theme}-default`, {
				body: await header.screenshot(),
				contentType: 'image/png',
			});

			await brandLink.hover();
			await page.waitForTimeout(200);
			const hoverState = await name.evaluate(element => ({
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
		{ width: 390, nameVisible: false, mobileMenuVisible: true },
		{ width: 768, nameVisible: false, mobileMenuVisible: true },
		{ width: 1024, nameVisible: true, mobileMenuVisible: false },
		{ width: 1440, nameVisible: true, mobileMenuVisible: false },
	] as const) {
		test(`stays collision-free at ${viewport.width}px`, async ({ page }) => {
			await page.setViewportSize({ width: viewport.width, height: 844 });
			await installTheme(page, 'dark');
			await page.goto('/');

			const brandLink = page.locator('header a.brand-logo-link');
			const name = brandLink.locator('.brand-logo-name');
			const mobileMenu = page.locator('#mobile-menu-btn');
			const desktopNav = page.locator('header nav[aria-label="Main navigation"]');

			if (viewport.nameVisible) await expect(name).toBeVisible();
			else await expect(name).toBeHidden();

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
			await installTheme(page, theme);
			await page.goto('/');
			const header = page.locator('header').first();
			await expect(header.locator('.brand-logo-name')).toBeHidden();
			await expect(header.locator('[data-brand-logo]')).toHaveAttribute(
				'src',
				`/brand/logo-primary-${theme}.svg`
			);
			await testInfo.attach(`navigation-lockup-${theme}-mobile`, {
				body: await header.screenshot(),
				contentType: 'image/png',
			});
		}
	});

	test('reduced motion keeps the lockup stable and free of inline animation', async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.setViewportSize({ width: 1280, height: 800 });
		await installTheme(page, 'dark');
		await page.goto('/');

		const brandLink = page.locator('header a.brand-logo-link');
		await brandLink.hover();
		const motion = await brandLink.evaluate(element => {
			const name = element.querySelector<HTMLElement>('.brand-logo-name');
			const linkStyle = getComputedStyle(element);
			const nameStyle = name ? getComputedStyle(name) : null;
			const underlineStyle = name ? getComputedStyle(name, '::after') : null;
			return {
				linkAnimation: linkStyle.animationName,
				linkTransition: linkStyle.transitionDuration,
				nameAnimation: nameStyle?.animationName,
				nameTransition: nameStyle?.transitionDuration,
				underlineTransition: underlineStyle?.transitionDuration,
				hasInlineStyle:
					element.hasAttribute('style') || Boolean(name?.hasAttribute('style')),
			};
		});

		expect(motion.linkAnimation).toBe('none');
		expect(motion.nameAnimation).toBe('none');
		for (const duration of [
			motion.linkTransition,
			motion.nameTransition,
			motion.underlineTransition,
		]) {
			const seconds = parseTransitionDurations(duration);
			expect(seconds.length).toBeGreaterThan(0);
			expect(Math.max(...seconds)).toBeLessThanOrEqual(0.00001);
		}
		expect(motion.hasInlineStyle).toBe(false);
	});
});
