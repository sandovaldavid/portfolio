import { expect, test } from './fixtures';

type CatalogViewport = {
	name: 'desktop' | 'tablet' | 'mobile';
	width: number;
	height: number;
	introShellWidth: number;
	gridShellWidth: number;
	introShellY: number;
	cardWidth: number;
	cardHeight: number;
	rowGap: number;
	titleSize: string;
	titleLineHeight: string;
};

const VIEWPORTS: CatalogViewport[] = [
	{
		name: 'desktop',
		width: 1440,
		height: 900,
		introShellWidth: 1280,
		gridShellWidth: 1280,
		introShellY: 120,
		cardWidth: 520,
		cardHeight: 374,
		rowGap: 32,
		titleSize: '48px',
		titleLineHeight: '56px',
	},
	{
		name: 'tablet',
		width: 834,
		height: 1100,
		introShellWidth: 770,
		gridShellWidth: 770,
		introShellY: 112,
		cardWidth: 369,
		cardHeight: 478,
		rowGap: 24,
		titleSize: '48px',
		titleLineHeight: '56px',
	},
	{
		name: 'mobile',
		width: 390,
		height: 844,
		introShellWidth: 350,
		gridShellWidth: 340,
		introShellY: 104,
		cardWidth: 340,
		cardHeight: 466,
		rowGap: 24,
		titleSize: '40px',
		titleLineHeight: '48px',
	},
];

for (const viewport of VIEWPORTS) {
	test(`Projects Catalog matches the ${viewport.name} responsive composition`, async ({ page }) => {
		await page.setViewportSize({ width: viewport.width, height: viewport.height });
		await page.goto('/projects');
		await page.evaluate(() => document.fonts.ready);

		const introShell = page.locator('[data-projects-catalog-intro-shell]');
		const gridShell = page.locator('[data-projects-catalog-grid-shell]');
		const projectGrid = page.locator('[data-projects-layout="catalog"]');
		const cards = projectGrid.locator('article > div');
		const title = page.getByRole('heading', {
			level: 1,
			name: 'Projects built with evidence, scope and trade-offs.',
		});

		await expect(introShell).toBeVisible();
		await expect(gridShell).toBeVisible();
		await expect(cards).toHaveCount(6);
		const introBox = await introShell.boundingBox();
		expect(Math.round(introBox!.width)).toBe(viewport.introShellWidth);
		expect(Math.round(introBox!.y)).toBe(viewport.introShellY);
		expect(Math.round((await gridShell.boundingBox())!.width)).toBe(viewport.gridShellWidth);

		const titleStyle = await title.evaluate(element => {
			const style = getComputedStyle(element);
			return { fontSize: style.fontSize, lineHeight: style.lineHeight };
		});
		expect(titleStyle).toEqual({
			fontSize: viewport.titleSize,
			lineHeight: viewport.titleLineHeight,
		});

		const firstBox = await cards.nth(0).boundingBox();
		const secondBox = await cards.nth(1).boundingBox();
		expect(Math.round(firstBox!.width)).toBe(viewport.cardWidth);
		expect(Math.round(firstBox!.height)).toBe(viewport.cardHeight);

		if (viewport.name === 'mobile') {
			expect(Math.round(secondBox!.y - (firstBox!.y + firstBox!.height))).toBe(
				viewport.rowGap
			);
		} else {
			expect(Math.round(secondBox!.x - (firstBox!.x + firstBox!.width))).toBe(32);
			const thirdBox = await cards.nth(2).boundingBox();
			expect(Math.round(thirdBox!.y - (firstBox!.y + firstBox!.height))).toBe(
				viewport.rowGap
			);
		}

		const overflow = await page.evaluate(() => ({
			clientWidth: document.documentElement.clientWidth,
			scrollWidth: document.documentElement.scrollWidth,
		}));
		expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
	});
}

test('Projects Catalog keeps EN and ES intro copy localized without duplicating layout markup', async ({
	page,
}) => {
	await page.goto('/projects');
	await expect(page.getByText('PROJECT CATALOG', { exact: true })).toBeVisible();
	await expect(
		page.getByRole('heading', {
			level: 1,
			name: 'Projects built with evidence, scope and trade-offs.',
		})
	).toBeVisible();

	await page.goto('/es/projects');
	await expect(page.getByText('CATÁLOGO DE PROYECTOS', { exact: true })).toBeVisible();
	await expect(
		page.getByRole('heading', {
			level: 1,
			name: 'Proyectos construidos con evidencia, alcance y trade-offs.',
		})
	).toBeVisible();
	await expect(page.getByRole('heading', { level: 1, name: /Projects built/i })).toHaveCount(0);
});
