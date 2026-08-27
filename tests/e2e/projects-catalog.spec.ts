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
		cardWidth: 592,
		cardHeight: 440,
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
	test(`Projects Catalog matches the ${viewport.name} responsive composition`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: viewport.width, height: viewport.height });
		await page.goto('/projects');
		await page.evaluate(() => document.fonts.ready);

		const introShell = page.locator('[data-projects-catalog-intro-shell]');
		const snapshot = page.locator('[data-projects-catalog-snapshot]');
		const gridShell = page.locator('[data-projects-catalog-grid-shell]');
		const projectGrid = page.locator('[data-projects-layout="catalog"]');
		const cards = projectGrid.locator('article > div');
		const title = page.getByRole('heading', {
			level: 1,
			name: 'Engineering work shaped by real constraints.',
		});

		await expect(introShell).toBeVisible();
		await expect(snapshot).toBeVisible();
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
			const expectedColumnSpace = viewport.name === 'desktop' ? 96 : 32;
			expect(Math.round(secondBox!.x - (firstBox!.x + firstBox!.width))).toBe(
				expectedColumnSpace
			);
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

test('Projects Catalog surfaces a project index and repository-aware actions', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto('/projects');

	const snapshot = page.locator('[data-projects-catalog-snapshot]');
	await expect(snapshot.getByText('Published projects', { exact: true })).toBeVisible();
	await expect(snapshot.getByText('Source available', { exact: true })).toBeVisible();
	await expect(snapshot.getByText('Active builds', { exact: true })).toBeVisible();
	await expect(snapshot.getByText('Most used technologies', { exact: true })).toBeVisible();
	await expect(snapshot.getByText('06', { exact: true })).toBeVisible();
	await expect(snapshot.getByText('05', { exact: true })).toBeVisible();
	await expect(snapshot.getByText('02', { exact: true })).toBeVisible();

	const kiokuCard = page.locator('article', {
		has: page.getByRole('heading', { name: 'Kioku', exact: true }),
	});
	const caseStudyAction = kiokuCard.getByRole('link', { name: 'Case Study', exact: true });
	const repositoryAction = kiokuCard.locator('[data-project-card-repository] a');
	await expect(caseStudyAction).toBeVisible();
	await expect(repositoryAction).toBeVisible();
	await expect(repositoryAction).toContainText('kioku');
	await expect(repositoryAction).toHaveAttribute(
		'href',
		'https://github.com/sandovaldavid/kioku'
	);

	const cardBox = (await kiokuCard.boundingBox())!;
	const caseStudyBox = (await caseStudyAction.boundingBox())!;
	const repositoryBox = (await repositoryAction.boundingBox())!;
	expect(caseStudyBox.x - cardBox.x).toBeLessThanOrEqual(24);
	expect(cardBox.x + cardBox.width - (repositoryBox.x + repositoryBox.width)).toBeLessThanOrEqual(
		24
	);
});

test('Projects Catalog keeps EN and ES intro and index copy localized without duplicating layout markup', async ({
	page,
}) => {
	await page.goto('/projects');
	await expect(page.getByText('PROJECT CATALOG', { exact: true })).toBeVisible();
	await expect(
		page.getByRole('heading', {
			level: 1,
			name: 'Engineering work shaped by real constraints.',
		})
	).toBeVisible();
	await expect(page.getByText('Published projects', { exact: true })).toBeVisible();

	await page.goto('/es/projects');
	await expect(page.getByText('CATÁLOGO DE PROYECTOS', { exact: true })).toBeVisible();
	await expect(
		page.getByRole('heading', {
			level: 1,
			name: 'Proyectos donde las decisiones técnicas importan.',
		})
	).toBeVisible();
	await expect(page.getByText('Proyectos publicados', { exact: true })).toBeVisible();
	await expect(
		page.getByRole('heading', { level: 1, name: /Engineering work shaped/i })
	).toHaveCount(0);
});
