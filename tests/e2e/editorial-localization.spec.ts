import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

const pairedRoutes = [
	{
		source: '/blog/building-this-portfolio-with-astro-and-fsd',
		targetLabel: 'Español',
		target: '/es/blog/building-this-portfolio-with-astro-and-fsd',
	},
	{
		source: '/es/blog/predicting-oss-abandonment-with-bilstm',
		targetLabel: 'English',
		target: '/blog/predicting-oss-abandonment-with-bilstm',
	},
	{
		source: '/devlog/phase-3-complete',
		targetLabel: 'Español',
		target: '/es/devlog/phase-3-complete',
	},
	{
		source: '/es/devlog/v1-3-0-beta',
		targetLabel: 'English',
		target: '/devlog/v1-3-0-beta',
	},
] as const;

test.describe('editorial translation switching', () => {
	for (const scenario of pairedRoutes) {
		test(`${scenario.source} exposes only the verified counterpart route`, async ({ page }) => {
			await page.goto(scenario.source);
			await page.locator('#recruiter-hud-toggle').click();

			const panel = page.locator('#recruiter-hud-panel');
			await expect(panel).toBeVisible();
			await expect(panel.getByRole('link', { name: scenario.targetLabel })).toHaveAttribute(
				'href',
				scenario.target
			);
			await expect(panel.locator('button:disabled')).toHaveCount(0);
		});
	}

	test('paired blog detail remains free of serious accessibility violations', async ({
		page,
	}) => {
		await page.goto('/blog/building-this-portfolio-with-astro-and-fsd');
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		const blockingViolations = results.violations.filter(violation =>
			['serious', 'critical'].includes(violation.impact ?? '')
		);

		expect(blockingViolations).toEqual([]);
	});
});
