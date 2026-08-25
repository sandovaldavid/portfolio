import { expect, test } from './fixtures';

type ResearchViewport = {
	name: 'desktop' | 'tablet' | 'mobile';
	width: number;
	height: number;
	titleSize: string;
	titleLineHeight: string;
	evidenceColumns: 1 | 2;
	featureColumns: 1 | 2;
};

const VIEWPORTS: ResearchViewport[] = [
	{
		name: 'desktop',
		width: 1440,
		height: 1000,
		titleSize: '48px',
		titleLineHeight: '56px',
		evidenceColumns: 2,
		featureColumns: 2,
	},
	{
		name: 'tablet',
		width: 834,
		height: 1112,
		titleSize: '48px',
		titleLineHeight: '56px',
		evidenceColumns: 1,
		featureColumns: 2,
	},
	{
		name: 'mobile',
		width: 390,
		height: 844,
		titleSize: '40px',
		titleLineHeight: '48px',
		evidenceColumns: 1,
		featureColumns: 1,
	},
];

const ROUTES = [
	{
		route: '/research',
		title: 'Predicting the Abandonment State of OSS Repositories using BiLSTM Neural Networks',
	},
	{
		route: '/es/research',
		title: 'Predicción del Estado de Abandono de Repositorios OSS usando Redes Neuronales BiLSTM',
	},
] as const;

for (const scenario of ROUTES) {
	for (const viewport of VIEWPORTS) {
		test(`${scenario.route} preserves the ${viewport.name} research layout`, async ({ page }) => {
			await page.setViewportSize({ width: viewport.width, height: viewport.height });
			await page.goto(scenario.route);
			await page.evaluate(() => document.fonts.ready);

			const researchPage = page.locator('[data-research-page="mdx"]');
			const title = page.getByRole('heading', { level: 1, name: scenario.title });
			const evidence = page.locator('[data-research-evidence-layout]');
			const evidenceColumns = evidence.locator(':scope > [data-research-evidence-column]');
			const featureList = page.locator(
				'[data-research-variant="feature-grid"] .research-prose > ul'
			);
			const mermaidHost = page.locator('[data-mermaid-host]').first();
			const keywordList = page.locator('[data-research-keywords-band] ul');

			await expect(researchPage).toBeVisible();
			await expect(title).toBeVisible();
			await expect(evidenceColumns).toHaveCount(2);

			const titleStyle = await title.evaluate(element => {
				const style = getComputedStyle(element);
				return { fontSize: style.fontSize, lineHeight: style.lineHeight };
			});
			expect(titleStyle).toEqual({
				fontSize: viewport.titleSize,
				lineHeight: viewport.titleLineHeight,
			});

			const firstColumnBox = await evidenceColumns.nth(0).boundingBox();
			const secondColumnBox = await evidenceColumns.nth(1).boundingBox();
			expect(firstColumnBox).not.toBeNull();
			expect(secondColumnBox).not.toBeNull();

			if (viewport.evidenceColumns === 2) {
				expect(Math.abs(firstColumnBox!.y - secondColumnBox!.y)).toBeLessThanOrEqual(1);
				expect(secondColumnBox!.x).toBeGreaterThan(firstColumnBox!.x);
			} else {
				expect(secondColumnBox!.y).toBeGreaterThan(firstColumnBox!.y);
				expect(Math.abs(firstColumnBox!.x - secondColumnBox!.x)).toBeLessThanOrEqual(1);
			}

			const featureColumnCount = await featureList.evaluate(element => {
				const columns = getComputedStyle(element).gridTemplateColumns.trim();
				return columns.length === 0 ? 0 : columns.split(/\s+/).length;
			});
			expect(featureColumnCount).toBe(viewport.featureColumns);

			await mermaidHost.scrollIntoViewIfNeeded();
			await expect(mermaidHost).toHaveAttribute('data-mermaid-state', 'rendered', {
				timeout: 15_000,
			});
			await expect(mermaidHost.locator('svg[data-diagram-svg]')).toBeVisible();
			expect(
				await mermaidHost.evaluate(element => getComputedStyle(element).overflowX)
			).toBe('auto');

			const keywordOverflow = await keywordList.evaluate(element => ({
				clientWidth: element.clientWidth,
				scrollWidth: element.scrollWidth,
			}));
			expect(keywordOverflow.scrollWidth).toBeLessThanOrEqual(keywordOverflow.clientWidth);

			const documentOverflow = await page.evaluate(() => ({
				clientWidth: document.documentElement.clientWidth,
				scrollWidth: document.documentElement.scrollWidth,
			}));
			expect(documentOverflow.scrollWidth).toBeLessThanOrEqual(documentOverflow.clientWidth);
		});
	}
}
