import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const HEADER_HEIGHT = 72;
const DESKTOP = { width: 1440, height: 900 };
const SHORT_DESKTOP = { width: 1366, height: 768 };
const SHORTER_DESKTOP = { width: 1280, height: 720 };
const COMPACT_LANDSCAPE = { width: 1024, height: 768 };
const TABLET = { width: 834, height: 1100 };

async function getSectionTargetY(page: Page, id: string) {
	return page.locator(`#${id}`).evaluate((element, headerHeight) => {
		const section = element as HTMLElement;
		const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
		return Math.min(maxScrollY, Math.max(0, section.offsetTop - headerHeight));
	}, HEADER_HEIGHT);
}

async function getSectionTraversalMetrics(page: Page, id: string) {
	return page.locator(`#${id}`).evaluate((element, headerHeight) => {
		const section = element as HTMLElement;
		const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
		const startY = Math.min(maxScrollY, Math.max(0, section.offsetTop - headerHeight));
		const endY = Math.min(
			maxScrollY,
			Math.max(startY, section.offsetTop + section.offsetHeight - window.innerHeight)
		);
		return {
			startY,
			endY,
			height: section.offsetHeight,
			usableHeight: Math.max(0, window.innerHeight - headerHeight),
		};
	}, HEADER_HEIGHT);
}

async function waitForFonts(page: Page) {
	await page.evaluate(() => document.fonts.ready);
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

async function getSettledScrollY(page: Page) {
	return page.evaluate(
		() =>
			new Promise<number>((resolve, reject) => {
				let previousY = window.scrollY;
				let stableFrames = 0;
				const timeout = window.setTimeout(
					() => reject(new Error('Scroll did not settle within 3000ms')),
					3000
				);

				const check = () => {
					const currentY = window.scrollY;
					stableFrames = Math.abs(currentY - previousY) <= 1 ? stableFrames + 1 : 0;
					previousY = currentY;

					if (stableFrames === 3) {
						window.clearTimeout(timeout);
						resolve(currentY);
						return;
					}

					window.requestAnimationFrame(check);
				};

				window.requestAnimationFrame(check);
			})
	);
}

async function expectWheelToRemainNative(page: Page, deltaY: number, requireCancelable = true) {
	await page.evaluate(() => {
		const root = document.documentElement;
		root.removeAttribute('data-test-wheel-cancelable');
		root.removeAttribute('data-test-wheel-default-prevented');
		window.addEventListener(
			'wheel',
			event => {
				root.dataset.testWheelCancelable = String(event.cancelable);
				root.dataset.testWheelDefaultPrevented = String(event.defaultPrevented);
			},
			{ once: true }
		);
	});

	await page.mouse.wheel(0, deltaY);
	const root = page.locator('html');
	if (requireCancelable) {
		await expect(root).toHaveAttribute('data-test-wheel-cancelable', 'true');
	}
	await expect(root).toHaveAttribute('data-test-wheel-default-prevented', 'false');
}

async function expectCancelableWheelToRemainNative(page: Page, deltaY: number) {
	const defaultPrevented = await page.evaluate(delta => {
		const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: delta });
		window.dispatchEvent(event);
		return event.defaultPrevented;
	}, deltaY);

	expect(defaultPrevented).toBe(false);
}

async function expectWithinViewport(page: Page, selector: string) {
	const box = await page.locator(selector).boundingBox();
	expect(box).not.toBeNull();
	const viewportHeight = await page.evaluate(() => document.documentElement.clientHeight);
	expect(box!.y).toBeGreaterThanOrEqual(HEADER_HEIGHT - 1);
	expect(box!.y + box!.height).toBeLessThanOrEqual(viewportHeight + 1);
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

for (const { label, route, reducedMotion } of [
	{ label: 'English Home', route: '/', reducedMotion: false },
	{ label: 'Spanish Home', route: '/es/', reducedMotion: false },
	{ label: 'reduced-motion Home', route: '/', reducedMotion: true },
] as const) {
	test(`1366x768 ${label} traverses tall Experience before its directional boundary`, async ({
		page,
		isMobile,
	}) => {
		test.skip(isMobile, 'Mouse-wheel section navigation is a desktop pointer contract.');
		await page.setViewportSize(SHORT_DESKTOP);
		if (reducedMotion) await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto(route);
		await waitForFonts(page);

		const experience = await getSectionTraversalMetrics(page, 'experience');
		const projectsTarget = await getSectionTargetY(page, 'projects');
		const traversalRange = experience.endY - experience.startY;
		expect(experience.height).toBeGreaterThan(experience.usableHeight + 8);
		expect(traversalRange).toBeGreaterThan(16);
		const traversalWheelDelta = Math.max(16, Math.min(64, Math.floor(traversalRange / 2)));

		await scrollInstantlyTo(page, experience.startY);
		await page.mouse.move(SHORT_DESKTOP.width / 2, SHORT_DESKTOP.height / 2);
		await expectWheelToRemainNative(page, traversalWheelDelta, !reducedMotion);

		const traversedY = await getSettledScrollY(page);
		expect(traversedY).toBeGreaterThan(experience.startY + 3);
		expect(traversedY).toBeLessThan(projectsTarget - 8);

		if (reducedMotion) {
			await scrollInstantlyTo(page, experience.endY);
			await expectCancelableWheelToRemainNative(page, traversalWheelDelta);
			await page.mouse.wheel(0, traversalWheelDelta);
			const boundaryY = await getSettledScrollY(page);
			expect(boundaryY).toBeGreaterThan(experience.endY + 3);
			expect(boundaryY).toBeLessThan(projectsTarget - 8);
			return;
		}

		await scrollInstantlyTo(page, experience.endY);
		await expectWithinViewport(
			page,
			'#experience [role="tabpanel"][aria-hidden="false"] [data-experience-detail-footer]'
		);
		await page.mouse.wheel(0, 700);
		await expectScrollNear(page, projectsTarget);

		await page.waitForTimeout(160);
		await page.mouse.wheel(0, -700);
		await expectScrollNear(page, experience.endY);
		const settledExperienceEndY = await getSettledScrollY(page);
		expect(Math.abs(settledExperienceEndY - experience.endY)).toBeLessThanOrEqual(3);

		await expectWheelToRemainNative(page, -traversalWheelDelta);
		const reverseTraversalY = await getSettledScrollY(page);
		expect(reverseTraversalY).toBeLessThan(experience.endY - 3);
		expect(reverseTraversalY).toBeGreaterThan(experience.startY);
	});
}

for (const { label, route } of [
	{ label: 'English Home', route: '/' },
	{ label: 'Spanish Home', route: '/es/' },
] as const) {
	test(`1366x768 ${label} traverses tall Research footer before advancing to About`, async ({
		page,
		isMobile,
	}) => {
		test.skip(isMobile, 'Mouse-wheel section navigation is a desktop pointer contract.');
		await page.setViewportSize(SHORT_DESKTOP);
		await page.goto(route);
		await waitForFonts(page);

		const research = await getSectionTraversalMetrics(page, 'research');
		const aboutTarget = await getSectionTargetY(page, 'about-me');
		expect(research.height).toBeGreaterThan(research.usableHeight + 8);
		expect(research.endY).toBeGreaterThan(research.startY + 8);

		await scrollInstantlyTo(page, research.startY);
		await page.mouse.move(SHORT_DESKTOP.width / 2, SHORT_DESKTOP.height / 2);
		await expectWheelToRemainNative(page, 160);

		const traversedY = await getSettledScrollY(page);
		expect(traversedY).toBeGreaterThan(research.startY + 3);
		expect(traversedY).toBeLessThan(aboutTarget - 8);

		await scrollInstantlyTo(page, research.endY);
		await expectWithinViewport(page, '#research [data-research-home-footer]');
		await page.mouse.wheel(0, 700);
		await expectScrollNear(page, aboutTarget);
	});
}

for (const [label, viewport] of [
	['1280x720', SHORTER_DESKTOP],
	['1024x768', COMPACT_LANDSCAPE],
] as const) {
	test(`${label} keeps tall Home sections content-driven and horizontally contained`, async ({
		page,
		isMobile,
	}) => {
		test.skip(isMobile, 'Mouse-wheel section navigation is a desktop pointer contract.');
		await page.setViewportSize(viewport);
		await page.goto('/');
		await waitForFonts(page);

		const overflow = await page.evaluate(() => ({
			clientWidth: document.documentElement.clientWidth,
			scrollWidth: document.documentElement.scrollWidth,
		}));
		expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);

		for (const [id, nextId] of [
			['hero', 'experience'],
			['experience', 'projects'],
			['projects', 'research'],
			['research', 'about-me'],
			['about-me', 'contact'],
		] as const) {
			const metrics = await getSectionTraversalMetrics(page, id);
			if (metrics.endY <= metrics.startY + 8) continue;

			const nextTarget = await getSectionTargetY(page, nextId);
			await scrollInstantlyTo(page, metrics.startY);
			await page.mouse.move(viewport.width / 2, viewport.height / 2);
			await expectWheelToRemainNative(page, 120);

			const traversedY = await getSettledScrollY(page);
			expect(traversedY).toBeGreaterThan(metrics.startY + 3);
			expect(traversedY).toBeLessThan(nextTarget - 8);

			await scrollInstantlyTo(page, metrics.endY);
			await page.mouse.wheel(0, 700);
			await expectScrollNear(page, nextTarget);
		}
	});
}

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
