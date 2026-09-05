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

	test('animates theme changes without input lag and keeps the favicon aligned', async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.addInitScript(() => localStorage.setItem('theme', 'light'));
		await page.goto('/');

		const html = page.locator('html');
		const runtimeFavicon = page.locator('link[data-theme-favicon-active]');
		await expect(html).not.toHaveClass(/dark/);
		await expect(html).toHaveAttribute('data-theme-resolved', 'light');
		await expect(runtimeFavicon).toHaveAttribute('href', '/favicon.light.svg');

		await page.locator('#recruiter-hud-toggle').click();
		const themeToggle = page.locator('#recruiter-hud-panel [data-theme-toggle]');
		const sunIcon = themeToggle.locator('[data-theme-icon="light"]');
		const moonIcon = themeToggle.locator('[data-theme-icon="dark"]');
		const systemIcon = themeToggle.locator('[data-theme-icon="system"]');
		await expect(themeToggle).toBeVisible();
		await expect(sunIcon).toHaveAttribute('data-theme-active', 'true');
		await expect(moonIcon).toHaveAttribute('data-theme-active', 'false');
		await expect(systemIcon).toHaveAttribute('data-theme-active', 'false');

		const transition = await page.evaluate(async () => {
			const root = document.documentElement;
			const body = document.body;
			const panel = document.querySelector<HTMLElement>('#recruiter-hud-panel');
			const toggle = panel?.querySelector<HTMLButtonElement>('[data-theme-toggle]');
			if (!panel || !toggle) throw new Error('Recruiter HUD theme toggle not found');

			const before = {
				bodyBackground: getComputedStyle(body).backgroundColor,
				panelBackground: getComputedStyle(panel).backgroundColor,
			};

			toggle.click();

			const immediate = {
				resolvedTheme: root.dataset.themeResolved,
				isDark: root.classList.contains('dark'),
				currentPreference: toggle.dataset.themeCurrent,
				rootTransitionProperty: getComputedStyle(root).transitionProperty,
				rootTransitionDuration: getComputedStyle(root).transitionDuration,
			};

			await new Promise(resolve => setTimeout(resolve, 90));
			const middle = {
				bodyBackground: getComputedStyle(body).backgroundColor,
				panelBackground: getComputedStyle(panel).backgroundColor,
			};

			await new Promise(resolve => setTimeout(resolve, 220));
			const after = {
				bodyBackground: getComputedStyle(body).backgroundColor,
				panelBackground: getComputedStyle(panel).backgroundColor,
			};

			return { before, immediate, middle, after };
		});

		expect(transition.immediate.resolvedTheme).toBe('dark');
		expect(transition.immediate.isDark).toBe(true);
		expect(transition.immediate.currentPreference).toBe('dark');
		expect(transition.immediate.rootTransitionProperty).toBe(
			'background-color, border-color, color, fill, stroke'
		);
		expect(transition.immediate.rootTransitionDuration).toBe('0.18s');
		expect(transition.middle.bodyBackground).not.toBe(transition.before.bodyBackground);
		expect(transition.middle.bodyBackground).not.toBe(transition.after.bodyBackground);
		expect(transition.middle.panelBackground).not.toBe(transition.before.panelBackground);
		expect(transition.middle.panelBackground).not.toBe(transition.after.panelBackground);
		await expect(html).toHaveClass(/dark/);
		await expect(html).toHaveAttribute('data-theme-resolved', 'dark');
		await expect(runtimeFavicon).toHaveAttribute('href', '/favicon.dark.svg');
		await expect.poll(() => page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');
		await expect(sunIcon).toHaveAttribute('data-theme-active', 'false');
		await expect(moonIcon).toHaveAttribute('data-theme-active', 'true');
		await expect(systemIcon).toHaveAttribute('data-theme-active', 'false');

		await expect.poll(() => html.getAttribute('class')).not.toContain('theme-transition');

		await themeToggle.click();
		await expect.poll(() => page.evaluate(() => localStorage.getItem('theme'))).toBe('system');
		await expect(moonIcon).toHaveAttribute('data-theme-active', 'false');
		await expect(systemIcon).toHaveAttribute('data-theme-active', 'true');

		await themeToggle.click();
		await expect.poll(() => page.evaluate(() => localStorage.getItem('theme'))).toBe('light');
		await expect(systemIcon).toHaveAttribute('data-theme-active', 'false');
		await expect(sunIcon).toHaveAttribute('data-theme-active', 'true');
	});

	test('keeps the cyclic preference order when toggled before the transition settles', async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.addInitScript(() => localStorage.setItem('theme', 'light'));
		await page.goto('/');

		await page.locator('#recruiter-hud-toggle').click();
		const themeToggle = page.locator('#recruiter-hud-panel [data-theme-toggle]');
		await expect(themeToggle).toBeVisible();

		const rapidState = await themeToggle.evaluate(button => {
			if (!(button instanceof HTMLButtonElement)) throw new Error('Theme toggle not found');
			button.click();
			const afterFirst = {
				preference: localStorage.getItem('theme'),
				resolved: document.documentElement.dataset.themeResolved,
			};
			button.click();
			const afterSecond = {
				preference: localStorage.getItem('theme'),
				current: button.dataset.themeCurrent,
			};
			return { afterFirst, afterSecond };
		});

		expect(rapidState.afterFirst.preference).toBe('dark');
		expect(rapidState.afterFirst.resolved).toBe('dark');
		expect(rapidState.afterSecond.preference).toBe('system');
		expect(rapidState.afterSecond.current).toBe('system');
	});

	test('respects reduced motion while still changing theme and favicon state', async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.addInitScript(() => localStorage.setItem('theme', 'light'));
		await page.goto('/');

		await page.locator('#recruiter-hud-toggle').click();
		const themeToggle = page.locator('#recruiter-hud-panel [data-theme-toggle]');
		await themeToggle.click();

		const html = page.locator('html');
		await expect(html).toHaveClass(/dark/);
		await expect(html).not.toHaveClass(/theme-transition/);
		await expect(page.locator('link[data-theme-favicon-active]')).toHaveAttribute(
			'href',
			'/favicon.dark.svg'
		);
		await expect(themeToggle.locator('[data-theme-icon="dark"]')).toHaveAttribute(
			'data-theme-active',
			'true'
		);
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
