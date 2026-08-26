import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

/*
 * Focused visual-contract regression for the shared content components.
 * Geometry is asserted at the canonical Portfolio v2 viewports while colors
 * are resolved through semantic custom properties rather than raw palette
 * values.
 */

type Viewport = { width: number; height: number; label: string };

const DESKTOP: Viewport = { width: 1440, height: 900, label: 'desktop' };
const TABLET: Viewport = { width: 834, height: 1100, label: 'tablet' };
const MOBILE: Viewport = { width: 390, height: 844, label: 'mobile' };

async function setTheme(page: Page, theme: 'light' | 'dark') {
	await page.evaluate(selected => {
		localStorage.setItem('theme', selected);
		document.documentElement.classList.toggle('dark', selected === 'dark');
	}, theme);
	await page.reload();
	await page.waitForLoadState('domcontentloaded');
}

async function probeStyle(
	page: Page,
	declaration: string
): Promise<{ backgroundColor: string; borderTopColor: string; boxShadow: string }> {
	return page.evaluate(decl => {
		const el = document.createElement('div');
		el.style.cssText = decl;
		document.body.appendChild(el);
		const styles = getComputedStyle(el);
		const result = {
			backgroundColor: styles.backgroundColor,
			borderTopColor: styles.borderTopColor,
			boxShadow: styles.boxShadow,
		};
		el.remove();
		return result;
	}, declaration);
}

const probeBackground = (page: Page, name: string) =>
	probeStyle(page, `background-color: var(${name});`).then(style => style.backgroundColor);

test.describe('Hero Profile Record contract', () => {
	test('tablet portrait panel is 220px wide with a 192px avatar', async ({ page }) => {
		await page.setViewportSize({ width: TABLET.width, height: TABLET.height });
		await page.goto('/');

		const record = page.locator('#hero').getByRole('figure');
		await expect(record).toBeVisible();
		expect((await record.boundingBox())?.width).toBe(220);

		const avatar = record.getByRole('img');
		const avatarSize = await avatar.evaluate(
			el => `${getComputedStyle(el).width}|${getComputedStyle(el).height}`
		);
		expect(avatarSize).toBe('192px|192px');
	});

	for (const viewport of [DESKTOP, MOBILE]) {
		test(`portrait panel, avatar and name band match the ${viewport.label} contract`, async ({
			page,
		}) => {
			await page.setViewportSize({ width: viewport.width, height: viewport.height });
			await page.goto('/');
			await setTheme(page, 'light');

			const record = page.locator('#hero').getByRole('figure');
			await expect(record).toBeVisible();

			const figureBox = await record.boundingBox();
			const band = record.locator('.hero-profile-name-band');
			const bandBox = await band.boundingBox();
			const avatar = record.getByRole('img');
			const avatarSize = await avatar.evaluate(
				el => `${getComputedStyle(el).width}|${getComputedStyle(el).height}`
			);

			if (viewport.label === 'desktop') {
				expect(figureBox?.width).toBe(256);
				expect(bandBox?.height).toBe(32);
				expect(Math.round(bandBox!.x - figureBox!.x)).toBe(18);
				expect(Math.round(bandBox!.y - figureBox!.y)).toBe(270);
				expect(avatarSize).toBe('192px|192px');
			} else {
				expect(figureBox?.height).toBe(226);
				expect(bandBox?.height).toBe(28);
				expect(bandBox?.width).toBe(280);
				expect(Math.round(bandBox!.y - figureBox!.y)).toBe(168);
				expect(avatarSize).toBe('148px|148px');
			}

			expect(await band.evaluate(el => getComputedStyle(el).backgroundColor)).toBe(
				await probeBackground(page, '--channel-accent-primary')
			);
		});
	}

	test('mobile exposes only the four high-value recruiter facts', async ({ page }) => {
		await page.setViewportSize({ width: MOBILE.width, height: MOBILE.height });
		await page.goto('/');

		for (const fact of ['stack', 'location', 'current', 'domain']) {
			await expect(page.locator(`[data-profile-fact="${fact}"]`)).toBeVisible();
		}
		for (const fact of ['role', 'work-mode']) {
			await expect(page.locator(`[data-profile-fact="${fact}"]`)).toBeHidden();
		}
	});
});

test.describe('Tablet geometry contract', () => {
	test('project card terminal slot, content panel and editorial card hit tablet targets', async ({
		page,
	}) => {
		await page.setViewportSize({ width: TABLET.width, height: TABLET.height });
		await page.goto('/es/projects');
		const card = page.locator('article').first();
		await card.scrollIntoViewIfNeeded();
		expect(
			await card
				.locator('figure > div')
				.last()
				.evaluate(el => getComputedStyle(el).height)
		).toBe('130px');

		await page.goto('/components');
		const compact = page.locator('.showcase-panel-default');
		await expect(compact).toBeVisible();
		const compactBox = await compact.boundingBox();
		expect(compactBox?.height).toBeGreaterThanOrEqual(200);
		expect(compactBox?.width).toBeLessThanOrEqual(373);
	});
});

test.describe('Experience Tab contract', () => {
	for (const [viewport, expectedWidth] of [
		[DESKTOP, 400],
		[TABLET, 300],
		[MOBILE, 250],
	] as const) {
		test(`${viewport.label} tab matches the responsive Figma geometry`, async ({ page }) => {
			await page.setViewportSize({ width: viewport.width, height: viewport.height });
			await page.goto('/');
			await setTheme(page, 'light');

			const activeTab = page.getByRole('tab', { selected: true }).first();
			await expect(activeTab).toBeVisible();
			const box = await activeTab.boundingBox();
			expect(box?.width).toBe(expectedWidth);
			expect(box?.height).toBe(76);
			expect(await activeTab.evaluate(el => getComputedStyle(el).backgroundColor)).toBe(
				await probeBackground(page, '--color-badge-brand-bg')
			);
			expect(await activeTab.evaluate(el => getComputedStyle(el).borderTopWidth)).toBe('2px');

			const indicator = activeTab.locator('span').nth(viewport.label === 'mobile' ? 1 : 0);
			expect(await indicator.evaluate(el => getComputedStyle(el).position)).toBe('absolute');
			if (viewport.label === 'mobile') {
				expect(await indicator.evaluate(el => getComputedStyle(el).height)).toBe('4px');
			} else {
				expect(await indicator.evaluate(el => getComputedStyle(el).width)).toBe('4px');
			}
		});
	}

	test('company and role use navigation and caption typography instead of legacy fonts', async ({
		page,
	}) => {
		await page.setViewportSize({ width: DESKTOP.width, height: DESKTOP.height });
		await page.goto('/');
		const tab = page.getByRole('tab', { selected: true }).first();
		const text = tab.locator('span').filter({ hasText: /Atena/i }).last();
		expect(await text.evaluate(el => getComputedStyle(el).fontFamily)).toMatch(
			/JetBrains Mono/i
		);
		expect(await text.evaluate(el => getComputedStyle(el).fontSize)).toBe('14px');
	});
});

test.describe('Experience Detail contract', () => {
	for (const [viewport, expectedWidth] of [
		[DESKTOP, 840],
		[TABLET, 446],
		[MOBILE, 360],
	] as const) {
		test(`${viewport.label} detail is an open editorial block at ${expectedWidth}px`, async ({
			page,
		}) => {
			await page.setViewportSize({ width: viewport.width, height: viewport.height });
			await page.goto('/');

			const panel = page.locator('[role="tabpanel"][data-active="true"]');
			const detail = panel.locator('> div').first();
			await expect(detail).toBeVisible();
			expect((await detail.boundingBox())?.width).toBe(expectedWidth);
			expect(await detail.evaluate(el => getComputedStyle(el).boxShadow)).toBe('none');

			const role = detail.getByRole('heading', { level: 3 });
			expect(await role.evaluate(el => getComputedStyle(el).fontSize)).toBe('24px');
			expect(await role.evaluate(el => getComputedStyle(el).fontFamily)).toMatch(
				/JetBrains Mono/i
			);
			expect(await role.evaluate(el => getComputedStyle(el).fontWeight)).toBe('500');

			const achievements = detail.locator('ul').first();
			expect(await achievements.evaluate(el => getComputedStyle(el).display)).toBe('grid');
		});
	}

	test('the current-role CTA exists only for the Atena experience', async ({ page }) => {
		await page.setViewportSize({ width: DESKTOP.width, height: DESKTOP.height });
		await page.goto('/');

		await expect(page.getByRole('link', { name: /View current role/i })).toBeVisible();
		const tabs = page.getByRole('tab');
		await tabs.nth(1).click();
		await expect(page.getByRole('link', { name: /View current role/i })).toHaveCount(0);
	});
});

test.describe('Project Card contract', () => {
	test('terminal slot heights and hover shadow respect the secondary variant contract', async ({
		page,
	}) => {
		await page.setViewportSize({ width: DESKTOP.width, height: DESKTOP.height });
		await page.goto('/projects');
		await setTheme(page, 'light');

		const card = page
			.locator('article')
			.filter({ has: page.locator('[data-project-card-repository]') })
			.first();
		await card.scrollIntoViewIfNeeded();

		const terminalBody = card.locator('figure > div').last();
		expect(await terminalBody.evaluate(el => getComputedStyle(el).height)).toBe('120px');
		expect(await terminalBody.evaluate(el => getComputedStyle(el).backgroundColor)).toBe(
			await probeBackground(page, '--color-terminal-surface')
		);

		const frame = card.locator('> div');
		const before = await frame.boundingBox();
		const shadowBefore = await frame.evaluate(el => getComputedStyle(el).boxShadow);
		await card.hover();
		const shadowAfter = await frame.evaluate(el => getComputedStyle(el).boxShadow);
		const after = await frame.boundingBox();
		expect(shadowBefore).not.toBe(shadowAfter);
		expect(after?.width).toBe(before?.width);
		expect(after?.height).toBe(before?.height);

		const sourceButton = card.locator('[data-project-card-repository] a').first();
		await expect(sourceButton).toBeVisible();

		await page.setViewportSize({ width: MOBILE.width, height: MOBILE.height });
		await expect(sourceButton).toBeHidden();
	});

	test('mobile terminal slot meets the 130px secondary height', async ({ page }) => {
		await page.setViewportSize({ width: MOBILE.width, height: MOBILE.height });
		await page.goto('/es/projects');
		const card = page.locator('article').first();
		await card.scrollIntoViewIfNeeded();
		const terminalBody = card.locator('figure > div').last();
		expect(await terminalBody.evaluate(el => getComputedStyle(el).height)).toBe('130px');
	});
});

test.describe('Content Panel contract', () => {
	test('variants resolve their border roles, min-heights and vertical growth', async ({
		page,
	}) => {
		await page.setViewportSize({ width: DESKTOP.width, height: DESKTOP.height });
		await page.goto('/components');
		await setTheme(page, 'light');

		const compact = page.locator('.showcase-panel-default');
		await expect(compact).toBeVisible();
		expect((await compact.boundingBox())?.height).toBeGreaterThanOrEqual(180);
		expect(
			(await page.locator('.showcase-panel-success').boundingBox())?.height
		).toBeGreaterThanOrEqual(240);

		const highlight = page.locator('.showcase-panel-highlight');
		expect(await highlight.evaluate(el => getComputedStyle(el).borderTopColor)).toBe(
			await probeStyle(page, 'border-top-color: var(--channel-accent-primary);').then(
				style => style.borderTopColor
			)
		);
		const success = page.locator('.showcase-panel-success');
		expect(await success.evaluate(el => getComputedStyle(el).borderTopColor)).toBe(
			await probeStyle(page, 'border-top-color: var(--color-status-success-border);').then(
				style => style.borderTopColor
			)
		);

		const grew = await compact.evaluate(el => {
			const before = el.getBoundingClientRect().height;
			const body = el.querySelector('div:last-child') as HTMLElement | null;
			if (!body) return false;
			body.textContent = 'Crecimiento del contenido traducido. '.repeat(40);
			return el.getBoundingClientRect().height > before;
		});
		expect(grew).toBe(true);
	});
});

test.describe('Editorial Card contract', () => {
	test('header height, CTA anchoring and dimension-stable hover shadow match desktop', async ({
		page,
	}) => {
		await page.setViewportSize({ width: DESKTOP.width, height: DESKTOP.height });
		await page.goto('/blog');

		const card = page.locator('article').first();
		await card.scrollIntoViewIfNeeded();
		expect(await card.locator('header').evaluate(el => getComputedStyle(el).height)).toBe(
			'44px'
		);

		const title = card.getByRole('heading', { level: 2 });
		const cta = card.locator('a').last();
		const titleBox = await title.boundingBox();
		const ctaBox = await cta.boundingBox();
		expect(ctaBox!.y).toBeGreaterThan(titleBox!.y + titleBox!.height);

		const shadowBefore = await card.evaluate(el => getComputedStyle(el).boxShadow);
		await card.hover();
		const shadowAfter = await card.evaluate(el => getComputedStyle(el).boxShadow);
		expect(shadowBefore).not.toBe(shadowAfter);
		expect((await card.boundingBox())?.width).toBeLessThanOrEqual(520);
	});

	test('cards resolve the brand badge surface in dark mode', async ({ page }) => {
		await page.setViewportSize({ width: MOBILE.width, height: MOBILE.height });
		await page.goto('/devlog');
		await setTheme(page, 'dark');

		const header = page.locator('article').first().locator('header');
		await expect(header).toBeVisible();
		expect(await header.evaluate(el => getComputedStyle(el).backgroundColor)).toBe(
			await probeBackground(page, '--color-badge-brand-bg')
		);
	});
});
