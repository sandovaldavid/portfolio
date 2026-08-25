import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const DESKTOP = { width: 1440, height: 900 };
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const;
const DETAIL_A11Y_ROUTES = [
	{ path: '/experience', name: 'Experience archive EN' },
	{ path: '/experience/atena-software-engineer', name: 'Experience systems EN' },
	{ path: '/experience/chirasoft-fullstack-developer', name: 'Experience product EN' },
	{
		path: '/experience/municipality-piura-software-developer',
		name: 'Experience operations EN',
	},
	{ path: '/projects/kioku', name: 'Kioku project case study EN' },
	{ path: '/projects/yukidoke', name: 'Yukidoke project case study EN' },
	{ path: '/es/experience', name: 'Experience archive ES' },
	{ path: '/es/experience/atena-software-engineer', name: 'Experience systems ES' },
	{ path: '/es/projects/kioku', name: 'Kioku project case study ES' },
] as const;

async function useTheme(page: Page, theme: 'light' | 'dark') {
	await page.addInitScript(selectedTheme => {
		localStorage.setItem('theme', selectedTheme);
	}, theme);
}

async function disableMotion(page: Page) {
	await page.addStyleTag({
		content: `
			*, *::before, *::after {
				animation-delay: -1ms !important;
				animation-duration: 0s !important;
				animation-iteration-count: 1 !important;
				transition-duration: 0s !important;
				transition-delay: 0s !important;
			}
		`,
	});
}

async function expectNoBlockingAxeViolations(page: Page) {
	const results = await new AxeBuilder({ page }).withTags([...WCAG_TAGS]).analyze();
	const blockingViolations = results.violations.filter(
		violation => violation.impact === 'critical' || violation.impact === 'serious'
	);
	expect(blockingViolations).toEqual([]);
}

test.describe('Interaction semantics', () => {
	test('static Home surfaces stay stable while Experience tabs retain hover feedback', async ({
		page,
		isMobile,
	}) => {
		test.skip(isMobile, 'Hover feedback is a fine-pointer interaction contract.');
		await page.setViewportSize(DESKTOP);
		await page.goto('/');
		await page.evaluate(() => document.fonts.ready);

		const projectCard = page.locator('[data-project-card-variant="secondary"]').first();
		const researchPanel = page.locator('[data-research-home-panel]');
		const pipelineStep = page.locator('[data-research-pipeline-step]').first();
		const inactiveExperienceTab = page.locator('#experience-tablist [role="tab"]').nth(1);

		const projectShadow = await projectCard.evaluate(
			element => getComputedStyle(element).boxShadow
		);
		await projectCard.hover();
		expect(await projectCard.evaluate(element => getComputedStyle(element).transform)).toBe(
			'none'
		);
		expect(await projectCard.evaluate(element => getComputedStyle(element).boxShadow)).toBe(
			projectShadow
		);

		const researchShadow = await researchPanel.evaluate(
			element => getComputedStyle(element).boxShadow
		);
		await researchPanel.hover();
		expect(await researchPanel.evaluate(element => getComputedStyle(element).transform)).toBe(
			'none'
		);
		expect(await researchPanel.evaluate(element => getComputedStyle(element).boxShadow)).toBe(
			researchShadow
		);

		const pipelineStyle = await pipelineStep.evaluate(element => {
			const style = getComputedStyle(element);
			return { transform: style.transform, boxShadow: style.boxShadow };
		});
		await pipelineStep.hover();
		expect(
			await pipelineStep.evaluate(element => {
				const style = getComputedStyle(element);
				return { transform: style.transform, boxShadow: style.boxShadow };
			})
		).toEqual(pipelineStyle);

		await inactiveExperienceTab.evaluate(element => {
			(element as HTMLElement).style.setProperty('transition', 'none', 'important');
		});
		const tabBackground = await inactiveExperienceTab.evaluate(
			element => getComputedStyle(element).backgroundColor
		);
		await inactiveExperienceTab.hover();
		expect(
			await inactiveExperienceTab.evaluate(element => getComputedStyle(element).transform)
		).toBe('none');
		expect(
			await inactiveExperienceTab.evaluate(
				element => getComputedStyle(element).backgroundColor
			)
		).not.toBe(tabBackground);
	});

	test('Experience detail evidence remains static on hover', async ({ page, isMobile }) => {
		test.skip(isMobile, 'Hover stability is a fine-pointer interaction contract.');
		await page.setViewportSize(DESKTOP);
		await page.goto('/experience/atena-software-engineer');

		const contribution = page.locator('[data-experience-contributions] li').first();
		const narrativePanel = page.locator('[data-experience-panel]').first();

		for (const surface of [contribution, narrativePanel]) {
			const before = await surface.evaluate(element => {
				const style = getComputedStyle(element);
				return {
					transform: style.transform,
					boxShadow: style.boxShadow,
					borderColor: style.borderTopColor,
				};
			});
			await surface.hover();
			expect(
				await surface.evaluate(element => {
					const style = getComputedStyle(element);
					return {
						transform: style.transform,
						boxShadow: style.boxShadow,
						borderColor: style.borderTopColor,
					};
				})
			).toEqual(before);
		}
	});

	test('project resources keep control feedback without lift or brightness filters', async ({
		page,
		isMobile,
	}) => {
		test.skip(isMobile, 'Hover feedback is a fine-pointer interaction contract.');
		await page.setViewportSize(DESKTOP);
		await page.goto('/projects/kioku');

		const resource = page.locator('[data-project-resource]').first();
		await resource.evaluate(element => {
			(element as HTMLElement).style.setProperty('transition', 'none', 'important');
		});
		const beforeShadow = await resource.evaluate(
			element => getComputedStyle(element).boxShadow
		);
		await resource.hover();

		expect(await resource.evaluate(element => getComputedStyle(element).transform)).toBe(
			'none'
		);
		expect(await resource.evaluate(element => getComputedStyle(element).filter)).toBe('none');
		expect(await resource.evaluate(element => getComputedStyle(element).boxShadow)).not.toBe(
			beforeShadow
		);
	});

	test('Home keeps work evidence above biography in CTA hierarchy', async ({ page }) => {
		await page.goto('/');
		const readMore = page.locator('[data-about-profile] a').first();
		const viewWork = page.locator('[data-about-current-role] a').first();

		await expect(readMore).toHaveClass(/btn-secondary/);
		await expect(viewWork).toHaveClass(/btn-primary/);
	});
});

test.describe('Project case study reading ergonomics', () => {
	test('prose uses reading measure while technical compositions keep the wide shell', async ({
		page,
	}) => {
		await page.setViewportSize(DESKTOP);
		await page.goto('/projects/kioku');
		await page.evaluate(() => document.fonts.ready);

		const firstProseSection = page
			.locator('[data-case-study-section-content][data-case-study-width="auto"]')
			.first();
		const wideDiagramSection = page
			.locator(
				'[data-case-study-section]:has([data-mermaid-figure]) [data-case-study-section-content]'
			)
			.first();
		const usableWidth = await page.evaluate(() => document.documentElement.clientWidth);

		expect(Math.round((await firstProseSection.boundingBox())!.width)).toBe(840);
		expect(Math.round((await wideDiagramSection.boundingBox())!.width)).toBe(
			Math.min(1280, usableWidth - 160)
		);
	});
});

test.describe('Detail-page accessibility coverage', () => {
	for (const theme of ['light', 'dark'] as const) {
		for (const { path, name } of DETAIL_A11Y_ROUTES) {
			test(`${name} has no serious accessibility violations in ${theme} theme`, async ({
				page,
			}) => {
				await useTheme(page, theme);
				await page.goto(path);
				await page.waitForLoadState('networkidle');
				await disableMotion(page);
				await expectNoBlockingAxeViolations(page);
			});
	}
});
