import { test, expect } from './fixtures';

test.describe('Homepage', () => {
	test('shows professional positioning and primary actions immediately', async ({
		page,
		isMobile,
	}) => {
		await page.goto('/');

		await expect(page).toHaveTitle(/David Sandoval.*Software Engineer/i);
		await expect(page.locator('h1')).toHaveText(/David Sandoval/i);
		await expect(page.getByText(/Angular · \.NET · TypeScript/i).first()).toBeVisible();
		await expect(page.getByRole('link', { name: /view work/i })).toBeVisible();
		await expect(page.getByRole('link', { name: /get in touch/i })).toBeVisible();

		if (isMobile) {
			const mobileToggle = page.locator('#mobile-menu-btn');
			await expect(mobileToggle).toBeVisible();
			await mobileToggle.click();
			await expect(page.getByRole('link', { name: /resume/i }).first()).toBeVisible();
		} else {
			await expect(page.getByRole('link', { name: /resume/i }).first()).toBeVisible();
		}

		// Social evidence belongs to secondary surfaces (Recruiter HUD/footer), so
		// it must remain available in the document without competing with the
		// immediate hero actions.
		await expect(page.locator('a[href*="github.com"]').first()).toBeAttached();
		await expect(page.locator('a[href*="linkedin.com"]').first()).toBeAttached();
	});

	test('does not block the default first visit', async ({ page }) => {
		await page.goto('/');

		const splash = page.locator('#splash-screen');
		await expect(splash).toBeHidden();
		await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
		await expect(page.getByText(/Systems Architect|Lvl\. 99|LEVEL 5\+/i)).toHaveCount(0);
	});

	test('opens retro mode only when explicitly requested', async ({ page }) => {
		await page.goto('/?retro=1');

		const dialog = page.getByRole('dialog', { name: /retro mode/i });
		await expect(dialog).toBeVisible();
		await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');

		await page.keyboard.press('Escape');
		await expect(dialog).toBeHidden();
		await expect(page).toHaveURL(/\/$/);
		await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
	});

	test('has working navigation', async ({ page }) => {
		await page.goto('/');

		const desktopNav = page.locator('header nav a').first();
		const mobileToggle = page.locator('#mobile-menu-btn');

		const hasDesktop = await desktopNav.isVisible().catch(() => false);
		const hasMobile = await mobileToggle.isVisible().catch(() => false);
		expect(hasDesktop || hasMobile).toBe(true);
	});

	test('is responsive on mobile', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');

		await expect(page.locator('main, [role="main"]')).toBeVisible();
		await expect(page.getByRole('link', { name: /get in touch/i })).toBeVisible();
	});

	test('has no basic accessibility regressions', async ({ page }) => {
		await page.goto('/');

		expect(await page.locator('img:not([alt])').count()).toBe(0);
		await expect(page.locator('h1, h2, h3, h4, h5, h6').first()).toBeVisible();
	});

	test('applies the persisted theme', async ({ page }) => {
		const html = page.locator('html');

		await page.goto('/');
		await expect(html).toHaveClass(/dark/);

		await page.addInitScript(() => localStorage.setItem('theme', 'light'));
		await page.goto('/');
		await expect(html).not.toHaveClass(/dark/);
	});

	test('navigates section by section on wheel scroll', async ({ page, isMobile }) => {
		test.skip(isMobile, 'Mouse-wheel section navigation is a desktop pointer contract.');
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');

		const initialScrollY = await page.evaluate(() => window.scrollY);
		expect(initialScrollY).toBe(0);

		await page.mouse.wheel(0, 100);
		await page.waitForTimeout(650);

		const scrolledY = await page.evaluate(() => window.scrollY);
		expect(scrolledY).toBeGreaterThan(0);
	});
});

test.describe('Page Load Performance', () => {
	test('loads within acceptable time', async ({ page }) => {
		await page.goto('/');

		const loadTime = await page.evaluate(() => {
			const [entry] = performance.getEntriesByType(
				'navigation'
			) as PerformanceNavigationTiming[];
			return entry ? Math.round(entry.loadEventEnd - entry.startTime) : 0;
		});

		expect(loadTime).toBeLessThan(3000);
	});

	test('has no console errors', async ({ page }) => {
		const errors: string[] = [];
		page.on('console', msg => {
			if (msg.type() === 'error') {
				const text = msg.text();
				if (!text.includes('Failed to load resource') && !text.includes('net::ERR_')) {
					errors.push(text);
				}
			}
		});

		await page.goto('/');
		expect(errors).toEqual([]);
	});
});
