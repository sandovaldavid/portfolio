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
	test(`Kioku MDX case study preserves the ${viewport.name} shell contract`, async ({ page }) => {
		await page.setViewportSize({ width: viewport.width, height: viewport.height });
		await page.goto('/projects/kioku');
		await page.evaluate(() => document.fonts.ready);

		const caseStudy = page.locator('[data-project-case-study="mdx"]');
		const heroShell = page.locator('[data-case-study-hero-shell]');
		const firstSection = page.locator('[data-case-study-section]').first();
		const firstSectionInner = firstSection.locator(':scope > div');
		const title = page.getByRole('heading', { level: 1, name: 'Kioku' });
		const sectionTitle = page.getByRole('heading', {
			name: 'Inspect the project beyond this portfolio',
		});

		await expect(caseStudy).toBeVisible();
		expect(Math.round((await heroShell.boundingBox())!.width)).toBe(viewport.shellWidth);
		expect(Math.round((await firstSectionInner.boundingBox())!.width)).toBeLessThanOrEqual(
			viewport.shellWidth
		);
		expect(Math.round((await heroShell.boundingBox())!.y)).toBe(viewport.heroShellY);
		expect(Math.round((await firstSection.boundingBox())!.width)).toBe(viewport.width);

		const titleStyle = await title.evaluate(element => {
			const style = getComputedStyle(element);
			return { fontSize: style.fontSize, lineHeight: style.lineHeight };
		});
		expect(titleStyle).toEqual({
			fontSize: viewport.titleSize,
			lineHeight: viewport.titleLineHeight,
		});

		const sectionTitleStyle = await sectionTitle.evaluate(element => {
			const style = getComputedStyle(element);
			return { fontSize: style.fontSize, lineHeight: style.lineHeight };
		});
		expect(sectionTitleStyle).toEqual({
			fontSize: viewport.sectionTitleSize,
			lineHeight: viewport.sectionTitleLineHeight,
		});

		const overflow = await page.evaluate(() => ({
			clientWidth: document.documentElement.clientWidth,
			scrollWidth: document.documentElement.scrollWidth,
		}));
		expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
	});
}

const PROJECT_ROUTES = [
	['/projects/yukidoke', 'Yukidoke'],
	['/projects/kioku', 'Kioku'],
	['/projects/campus-map', 'UNP Campus Map'],
	['/projects/mad-ai', 'MAD AI'],
	['/projects/fluentreads', 'FluentReads'],
	['/projects/auctions', 'Auctions'],
	['/es/projects/yukidoke', 'Yukidoke'],
	['/es/projects/kioku', 'Kioku'],
	['/es/projects/campus-map', 'UNP Campus Map'],
	['/es/projects/mad-ai', 'MAD AI'],
	['/es/projects/fluentreads', 'FluentReads'],
	['/es/projects/auctions', 'Auctions'],
] as const;

for (const [route, title] of PROJECT_ROUTES) {
	test(`${route} renders a complete MDX case study without document overflow`, async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto(route);

		await expect(page.locator('[data-project-case-study="mdx"]')).toBeVisible();
		await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
		expect(await page.locator('[data-case-study-section]').count()).toBeGreaterThanOrEqual(5);
		expect(await page.locator('[data-mermaid-figure]').count()).toBeGreaterThanOrEqual(1);

		const overflow = await page.evaluate(() => ({
			clientWidth: document.documentElement.clientWidth,
			scrollWidth: document.documentElement.scrollWidth,
		}));
		expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
	});
}
