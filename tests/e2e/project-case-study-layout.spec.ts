import { expect, test } from './fixtures';

type CaseStudyViewport = {
	name: 'desktop' | 'tablet' | 'mobile';
	width: number;
	height: number;
	shellWidth: number;
	heroShellY: number;
	titleSize: string;
	titleLineHeight: string;
	sectionTitleSize: string;
	sectionTitleLineHeight: string;
};

const VIEWPORTS: CaseStudyViewport[] = [
	{
		name: 'desktop',
		width: 1440,
		height: 1000,
		shellWidth: 1280,
		heroShellY: 120,
		titleSize: '72px',
		titleLineHeight: '80px',
		sectionTitleSize: '36px',
		sectionTitleLineHeight: '40px',
	},
	{
		name: 'tablet',
		width: 834,
		height: 1112,
		shellWidth: 770,
		heroShellY: 112,
		titleSize: '48px',
		titleLineHeight: '56px',
		sectionTitleSize: '36px',
		sectionTitleLineHeight: '40px',
	},
	{
		name: 'mobile',
		width: 390,
		height: 844,
		shellWidth: 350,
		heroShellY: 104,
		titleSize: '40px',
		titleLineHeight: '48px',
		sectionTitleSize: '28px',
		sectionTitleLineHeight: '36px',
	},
];

for (const viewport of VIEWPORTS) {
	test(`Kioku v2 case study matches the ${viewport.name} composition`, async ({ page }) => {
		await page.setViewportSize({ width: viewport.width, height: viewport.height });
		await page.goto('/projects/kioku');
		await page.evaluate(() => document.fonts.ready);

		const caseStudy = page.locator('[data-project-case-study="v2"]');
		const heroShell = page.locator('[data-case-study-hero-shell]');
		const narrativeShell = page.locator('[data-case-study-narrative-shell]');
		const evidence = page.locator('[data-case-study-evidence]');
		const evidenceShell = page.locator('[data-case-study-evidence-shell]');
		const learningsShell = page.locator('[data-case-study-learnings-shell]');
		const title = page.getByRole('heading', { level: 1, name: 'Kioku' });
		const evidenceTitle = page.getByRole('heading', { name: 'Evidence and limitations' });

		await expect(caseStudy).toBeVisible();
		for (const shell of [heroShell, narrativeShell, evidenceShell, learningsShell]) {
			expect(Math.round((await shell.boundingBox())!.width)).toBe(viewport.shellWidth);
		}
		const heroBox = await heroShell.boundingBox();
		expect(Math.round(heroBox!.y)).toBe(viewport.heroShellY);
		expect(Math.round((await evidence.boundingBox())!.width)).toBe(viewport.width);

		const titleStyle = await title.evaluate(element => {
			const style = getComputedStyle(element);
			return { fontSize: style.fontSize, lineHeight: style.lineHeight };
		});
		expect(titleStyle).toEqual({
			fontSize: viewport.titleSize,
			lineHeight: viewport.titleLineHeight,
		});

		const sectionTitleStyle = await evidenceTitle.evaluate(element => {
			const style = getComputedStyle(element);
			return { fontSize: style.fontSize, lineHeight: style.lineHeight };
		});
		expect(sectionTitleStyle).toEqual({
			fontSize: viewport.sectionTitleSize,
			lineHeight: viewport.sectionTitleLineHeight,
		});

		const narrativeColumns = narrativeShell.locator(':scope > div');
		await expect(narrativeColumns).toHaveCount(2);
		const firstColumn = await narrativeColumns.nth(0).boundingBox();
		const secondColumn = await narrativeColumns.nth(1).boundingBox();
		if (viewport.name === 'desktop') {
			expect(secondColumn!.x).toBeGreaterThan(firstColumn!.x + firstColumn!.width);
		} else {
			expect(secondColumn!.y).toBeGreaterThan(firstColumn!.y);
		}

		await expect(page.locator('[data-case-study-learnings-shell] h3')).toHaveCount(3);

		const overflow = await page.evaluate(() => ({
			clientWidth: document.documentElement.clientWidth,
			scrollWidth: document.documentElement.scrollWidth,
		}));
		expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
	});
}

test('unreviewed project details remain on the migration fallback', async ({ page }) => {
	await page.goto('/projects/yukidoke');
	await expect(page.locator('[data-project-case-study="v2"]')).toHaveCount(0);
	await expect(page.getByRole('link', { name: 'Back to projects' })).toBeVisible();
	await expect(
		page.getByRole('heading', { name: 'IMPLEMENTED // VERIFIED IN REPOSITORY DOCUMENTATION' })
	).toBeVisible();
});
