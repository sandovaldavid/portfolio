import { test, expect } from './fixtures';

type RenderSample = {
	background: string;
	brainWidth: number;
	cssInHead: boolean;
	cssLoaded: boolean;
	colorScheme: string;
};

const sample = (): RenderSample => {
	const stylesheet = document.head.querySelector<HTMLLinkElement>('link[rel="stylesheet"]');
	const brain = document.querySelector<SVGElement>(
		matchMedia('(min-width: 1024px)').matches
			? 'header nav a[data-section-id="research"] svg'
			: '#mobile-menu-btn svg'
	);
	return {
		background: getComputedStyle(document.body).backgroundColor,
		brainWidth: brain ? parseFloat(getComputedStyle(brain).width) : 0,
		cssInHead: Boolean(stylesheet),
		cssLoaded: Boolean(stylesheet?.sheet),
		colorScheme: getComputedStyle(document.documentElement).colorScheme,
	};
};

test.describe('first rendered frame', () => {
	for (const route of ['/', '/es/', '/about/', '/projects/']) {
		test(`direct navigation to ${route} keeps CSS in the head`, async ({
			page,
			browserName,
		}) => {
			await page.addInitScript(() => {
				const capture = () => {
					const brain = document.querySelector(
						matchMedia('(min-width: 1024px)').matches
							? 'header nav a[data-section-id="research"] svg'
							: '#mobile-menu-btn svg'
					);
					if (!document.body || !brain) return requestAnimationFrame(capture);
					const stylesheet =
						document.head.querySelector<HTMLLinkElement>('link[rel="stylesheet"]');
					(
						window as typeof window & { firstRenderSample?: RenderSample }
					).firstRenderSample = {
						background: getComputedStyle(document.body).backgroundColor,
						brainWidth: parseFloat(getComputedStyle(brain).width),
						cssInHead: Boolean(stylesheet),
						cssLoaded: Boolean(stylesheet?.sheet),
						colorScheme: getComputedStyle(document.documentElement).colorScheme,
					};
				};
				requestAnimationFrame(capture);
			});

			const cssResponses: number[] = [];
			page.on('response', response => {
				if (new URL(response.url()).pathname.endsWith('.css'))
					cssResponses.push(response.status());
			});
			await page.goto(route);
			await expect
				.poll(() =>
					page.evaluate(
						() =>
							(window as typeof window & { firstRenderSample?: RenderSample })
								.firstRenderSample
					)
				)
				.toBeDefined();
			const first = await page.evaluate(
				() =>
					(window as typeof window & { firstRenderSample: RenderSample })
						.firstRenderSample
			);
			expect(first).toMatchObject({
				cssInHead: true,
				cssLoaded: true,
				colorScheme: 'dark',
			});
			expect(first.brainWidth).toBeGreaterThan(0);
			expect(first.brainWidth).toBeLessThanOrEqual(24);
			expect(first.background).not.toMatch(/^(rgba\(0, 0, 0, 0\)|rgb\(255, 255, 255\))$/);
			expect(cssResponses).toEqual([200]);
			if (browserName === 'chromium') {
				const timings = await page.evaluate(() => ({
					fcp: performance
						.getEntriesByType('paint')
						.find(entry => entry.name === 'first-contentful-paint')?.startTime,
					cssEnd: (
						performance.getEntriesByType('resource') as PerformanceResourceTiming[]
					).find(entry => entry.name.endsWith('.css'))?.responseEnd,
				}));
				expect(timings.fcp).toBeGreaterThanOrEqual(timings.cssEnd ?? Infinity);
			}
		});
	}

	test('ClientRouter retains the loaded stylesheet through the body swap', async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => {
			const original = document.head.querySelector('link[rel="stylesheet"]');
			document.addEventListener(
				'astro:after-swap',
				() => {
					const stylesheet =
						document.head.querySelector<HTMLLinkElement>('link[rel="stylesheet"]');
					const brain = document.querySelector(
						matchMedia('(min-width: 1024px)').matches
							? 'header nav a[data-section-id="research"] svg'
							: '#mobile-menu-btn svg'
					);
					(
						window as typeof window & {
							swapSample?: RenderSample & { persisted: boolean };
						}
					).swapSample = {
						background: getComputedStyle(document.body).backgroundColor,
						brainWidth: brain ? parseFloat(getComputedStyle(brain).width) : 0,
						cssInHead: Boolean(stylesheet),
						cssLoaded: Boolean(stylesheet?.sheet),
						colorScheme: getComputedStyle(document.documentElement).colorScheme,
						persisted: stylesheet === original,
					};
				},
				{ once: true }
			);
		});
		if (await page.locator('#mobile-menu-btn').isVisible()) {
			await page.locator('#mobile-menu-btn').click();
			await page.locator('#mobile-menu a[href="/blog/"]').click();
		} else {
			await page.locator('header a[href="/blog/"]').first().click();
		}
		await expect(page).toHaveURL(/\/blog\/$/);
		const swapped = await page.evaluate(
			() =>
				(window as typeof window & { swapSample: RenderSample & { persisted: boolean } })
					.swapSample
		);
		expect(swapped).toMatchObject({
			cssInHead: true,
			cssLoaded: true,
			colorScheme: 'dark',
			persisted: true,
		});
		expect(swapped.brainWidth).toBeGreaterThan(0);
		expect(swapped.brainWidth).toBeLessThanOrEqual(24);
		expect(swapped.background).not.toBe('rgba(0, 0, 0, 0)');
	});

	for (const [preference, osTheme, expected] of [
		['light', 'dark', 'light'],
		['dark', 'light', 'dark'],
		['system', 'light', 'light'],
		['system', 'dark', 'dark'],
	] as const) {
		test(`${preference} with ${osTheme} OS resolves ${expected} before rendering`, async ({
			page,
		}) => {
			await page.emulateMedia({ colorScheme: osTheme, reducedMotion: 'reduce' });
			await page.addInitScript(value => localStorage.setItem('theme', value), preference);
			await page.goto('/');
			const state = await page.evaluate(sample);
			expect(state).toMatchObject({
				cssInHead: true,
				cssLoaded: true,
				colorScheme: expected,
			});
			expect(state.brainWidth).toBeGreaterThan(0);
			expect(state.brainWidth).toBeLessThanOrEqual(24);
		});
	}

	test.describe('without JavaScript', () => {
		test.use({ javaScriptEnabled: false });
		test('the main content remains styled and accessible', async ({ page }) => {
			await page.goto('/es/');
			await expect(page.locator('main')).toBeVisible();
			await expect(page.locator('head link[rel="stylesheet"]')).toHaveCount(1);
			const state = await page.evaluate(sample);
			expect(state).toMatchObject({
				cssInHead: true,
				cssLoaded: true,
				colorScheme: 'light',
			});
			expect(state.brainWidth).toBeGreaterThan(0);
			expect(state.brainWidth).toBeLessThanOrEqual(24);
		});
	});
});
