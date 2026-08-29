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
		titleSize: '48px',
		titleLineHeight: '56px',
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
		const firstSectionContent = firstSection.locator('[data-case-study-section-content]');
		const title = page.getByRole('heading', { level: 1, name: 'Kioku' });
		const sectionTitle = page.getByRole('heading', {
			name: 'Stable 3.1.2 release with active development continuing',
		});

		await expect(caseStudy).toBeVisible();
		expect(Math.round((await heroShell.boundingBox())!.width)).toBe(viewport.shellWidth);
		expect(Math.round((await firstSectionInner.boundingBox())!.width)).toBe(
			viewport.shellWidth
		);
		expect(Math.round((await firstSectionContent.boundingBox())!.width)).toBe(
			viewport.shellWidth
		);
		await expect(firstSectionContent).toHaveAttribute('data-case-study-width', 'wide');
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

for (const viewport of [
	{ name: 'desktop', width: 1440, height: 1000 },
	{ name: 'laptop', width: 1366, height: 768 },
	{ name: 'compact', width: 1024, height: 768 },
	{ name: 'tablet', width: 834, height: 1112 },
	{ name: 'mobile', width: 390, height: 844 },
] as const) {
	test(`Kioku ${viewport.name} text, grid and Mermaid sections share the page shell`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: viewport.width, height: viewport.height });
		await page.goto('/projects/kioku');

		const heroShell = page.locator('[data-case-study-hero-shell]');
		const textContent = page
			.locator('[data-case-study-section]')
			.first()
			.locator('[data-case-study-section-content]');
		const gridContent = page
			.locator('[data-case-study-section]:has([data-case-study-grid])')
			.first()
			.locator('[data-case-study-section-content]');
		const mermaidContent = page
			.locator('[data-case-study-section]:has([data-mermaid-figure])')
			.first()
			.locator('[data-case-study-section-content]');

		for (const content of [textContent, gridContent, mermaidContent]) {
			await expect(content).toBeVisible();
			await expect(content).toHaveAttribute('data-case-study-width', 'wide');
		}

		const heroBox = (await heroShell.boundingBox())!;
		for (const content of [textContent, gridContent, mermaidContent]) {
			const box = (await content.boundingBox())!;
			expect(Math.round(box.x)).toBe(Math.round(heroBox.x));
			expect(Math.round(box.width)).toBe(Math.round(heroBox.width));
		}

		const overflow = await page.evaluate(() => ({
			clientWidth: document.documentElement.clientWidth,
			scrollWidth: document.documentElement.scrollWidth,
		}));
		expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
	});
}

test('Kioku lazy-renders an accessible Mermaid SVG with semantic actor tones', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto('/projects/kioku');

	const figure = page.locator('[data-mermaid-figure]').first();
	const host = figure.locator('[data-mermaid-host]');
	await figure.scrollIntoViewIfNeeded();
	await expect(host).toHaveAttribute('data-mermaid-state', 'rendered', { timeout: 15_000 });

	const svg = host.locator('svg[data-diagram-svg]');
	await expect(svg).toBeVisible();
	await expect(svg.locator('title')).toHaveText('Kioku runtime boundary');
	await expect(svg.locator('desc')).toContainText('MCP clients reach a .NET 10 Kioku server');
	await expect(host.locator('[data-mermaid-fallback]')).toHaveCount(0);
	expect(await host.locator('g.portfolio-tone-brand').count()).toBeGreaterThanOrEqual(1);
	expect(await host.locator('g.portfolio-tone-success').count()).toBeGreaterThanOrEqual(1);
});

test('Mermaid initializes again after ClientRouter navigation', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto('/projects/kioku');

	const initialHost = page.locator('[data-mermaid-host]').first();
	await initialHost.scrollIntoViewIfNeeded();
	await expect(initialHost).toHaveAttribute('data-mermaid-state', 'rendered', {
		timeout: 15_000,
	});

	await page.getByRole('link', { name: 'David Sandoval — Home' }).click();
	await expect(page).toHaveURL(/\/$/);

	const kiokuCard = page.getByRole('article').filter({
		has: page.getByRole('heading', { level: 3, name: 'Kioku' }),
	});
	const kiokuLink = kiokuCard.getByRole('link', { name: 'Case Study', exact: true });
	await expect(kiokuLink).toBeVisible();
	await kiokuLink.click();
	await expect(page).toHaveURL(/\/projects\/kioku\/?$/);

	const newHost = page.locator('[data-mermaid-host]').first();
	await newHost.scrollIntoViewIfNeeded();
	await expect(newHost).toHaveAttribute('data-mermaid-state', 'rendered', {
		timeout: 15_000,
	});
	await expect(newHost.locator('svg[data-diagram-svg]')).toBeVisible();
});

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
	test(`${route} renders a complete MDX case study without document overflow`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto(route);

		await expect(page.locator('[data-project-case-study="mdx"]')).toBeVisible();
		await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
		expect(await page.locator('[data-case-study-section]').count()).toBeGreaterThanOrEqual(5);

		const defaultSections = page.locator('[data-case-study-section-content]');
		for (let index = 0; index < (await defaultSections.count()); index += 1) {
			await expect(defaultSections.nth(index)).toHaveAttribute(
				'data-case-study-width',
				'wide'
			);
		}

		const diagrams = page.locator('[data-mermaid-host]');
		expect(await diagrams.count()).toBeGreaterThanOrEqual(1);
		for (let index = 0; index < (await diagrams.count()); index += 1) {
			const diagram = diagrams.nth(index);
			await diagram.scrollIntoViewIfNeeded();
			await expect(diagram).toHaveAttribute('data-mermaid-state', 'rendered', {
				timeout: 15_000,
			});
			await expect(diagram.locator('svg[data-diagram-svg]')).toBeVisible();
		}

		const overflow = await page.evaluate(() => ({
			clientWidth: document.documentElement.clientWidth,
			scrollWidth: document.documentElement.scrollWidth,
		}));
		expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
	});
}
