import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const HEADER_HEIGHT = 72;
const DESKTOP = { width: 1440, height: 900 };
const TABLET = { width: 834, height: 1100 };

async function getSectionTargetY(page: Page, id: string) {
	return page.locator(`#${id}`).evaluate((element, headerHeight) => {
		const section = element as HTMLElement;
		const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
		return Math.min(maxScrollY, Math.max(0, section.offsetTop - headerHeight));
	}, HEADER_HEIGHT);
}

async function scrollInstantlyTo(page: Page, targetY: number) {
	const actualY = await page.evaluate(y => {
		const root = document.documentElement;
		const previousBehavior = root.style.scrollBehavior;
		root.style.scrollBehavior = 'auto';
		window.scrollTo(0, y);
		const result = window.scrollY;
		root.style.scrollBehavior = previousBehavior;
		return result;
	}, targetY);
	expect(Math.abs(actualY - targetY)).toBeLessThanOrEqual(3);
}

async function expectScrollNear(page: Page, targetY: number) {
	await expect
		.poll(async () => Math.abs((await page.evaluate(() => window.scrollY)) - targetY), {
			timeout: 3000,
		})
		.toBeLessThanOrEqual(3);
}

for (const [label, viewport] of [
	['desktop', DESKTOP],
	['tablet', TABLET],
] as const) {
	test(`${label} substantial Home sections fill the usable viewport without horizontal overflow`, async ({
		page,
	}) => {
		await page.setViewportSize(viewport);
		await page.goto('/');

		const horizontalMetrics = await page.evaluate(() => ({
			scrollWidth: document.documentElement.scrollWidth,
			clientWidth: document.documentElement.clientWidth,
		}));
		expect(horizontalMetrics.scrollWidth).toBeLessThanOrEqual(horizontalMetrics.clientWidth);

		for (const id of ['hero', 'experience', 'projects', 'research', 'about-me']) {
			const section = page.locator(`#${id}`);
			await expect(section).toBeVisible();
			const box = await section.boundingBox();
			expect(box).not.toBeNull();
			expect(box!.width).toBeLessThanOrEqual(viewport.width);
			expect(box!.height).toBeGreaterThanOrEqual(viewport.height - HEADER_HEIGHT);
		}

		const technologies = page.locator('#technologies');
		await expect(technologies).toBeVisible();
		const technologiesBox = await technologies.boundingBox();
		expect(technologiesBox).not.toBeNull();
		expect(technologiesBox!.width).toBeLessThanOrEqual(viewport.width);
		expect(technologiesBox!.height).toBeLessThan(viewport.height - HEADER_HEIGHT);
		await expect(technologies.locator('[data-home-compact-shell="true"]')).toBeVisible();
	});
}

test('Experience keeps the next section anchored when a longer role is selected', async ({
	page,
}) => {
	await page.setViewportSize(DESKTOP);
	await page.goto('/');

	const projects = page.locator('#projects');
	const experience = page.locator('#experience');
	const projectsBefore = await projects.evaluate(element => {
		const rect = element.getBoundingClientRect();
		return { documentY: rect.top + window.scrollY, height: rect.height };
	});
	const experienceBefore = await experience.evaluate(element => {
		const rect = element.getBoundingClientRect();
		return { documentY: rect.top + window.scrollY, height: rect.height };
	});

	const tabs = page.getByRole('tab');
	await tabs.nth(2).click();
	await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');

	const projectsAfter = await projects.evaluate(element => {
		const rect = element.getBoundingClientRect();
		return { documentY: rect.top + window.scrollY, height: rect.height };
	});
	const experienceAfter = await experience.evaluate(element => {
		const rect = element.getBoundingClientRect();
		return { documentY: rect.top + window.scrollY, height: rect.height };
	});

	expect(Math.abs(projectsAfter.documentY - projectsBefore.documentY)).toBeLessThanOrEqual(1);
	expect(Math.abs(experienceAfter.documentY - experienceBefore.documentY)).toBeLessThanOrEqual(1);
	expect(Math.abs(experienceAfter.height - experienceBefore.height)).toBeLessThanOrEqual(1);
});

test('desktop vertical wheel over the horizontal Experience tab rail still advances to Projects', async ({
	page,
	isMobile,
}) => {
	test.skip(isMobile, 'Mouse-wheel section navigation is a desktop pointer contract.');
	await page.setViewportSize(DESKTOP);
	await page.goto('/');

	const experienceTarget = await getSectionTargetY(page, 'experience');
	const projectsTarget = await getSectionTargetY(page, 'projects');
	await scrollInstantlyTo(page, experienceTarget);

	const tablist = page.locator('#experience-tablist');
	await expect(tablist).toBeVisible();
	const tablistBox = (await tablist.boundingBox())!;
	await page.mouse.move(
		tablistBox.x + tablistBox.width / 2,
		tablistBox.y + tablistBox.height / 2
	);
	await page.mouse.wheel(0, 700);

	await expectScrollNear(page, projectsTarget);
});

test('desktop closing flow moves Research to About Me to Footer and reverses in order', async ({
	page,
	isMobile,
}) => {
	test.skip(isMobile, 'Mouse-wheel section navigation is a desktop pointer contract.');
	await page.setViewportSize(DESKTOP);
	await page.goto('/');

	const researchTarget = await getSectionTargetY(page, 'research');
	const aboutTarget = await getSectionTargetY(page, 'about-me');
	const contactTarget = await getSectionTargetY(page, 'contact');
	await scrollInstantlyTo(page, researchTarget);

	await page.mouse.move(DESKTOP.width / 2, DESKTOP.height / 2);
	await page.mouse.wheel(0, 700);
	await expectScrollNear(page, aboutTarget);

	await page.waitForTimeout(160);
	await page.mouse.wheel(0, 700);
	await expectScrollNear(page, contactTarget);

	await page.waitForTimeout(160);
	await page.mouse.wheel(0, -700);
	await expectScrollNear(page, aboutTarget);

	await page.waitForTimeout(160);
	await page.mouse.wheel(0, -700);
	await expectScrollNear(page, researchTarget);
});

test('Mobile remains content-driven and horizontally contained', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');

	const horizontalMetrics = await page.evaluate(() => ({
		scrollWidth: document.documentElement.scrollWidth,
		clientWidth: document.documentElement.clientWidth,
	}));
	expect(horizontalMetrics.scrollWidth).toBeLessThanOrEqual(horizontalMetrics.clientWidth);

	const experience = page.locator('#experience');
	const tablist = experience.getByRole('tablist');
	expect(await tablist.evaluate(el => getComputedStyle(el).overflowX)).toBe('auto');
});
