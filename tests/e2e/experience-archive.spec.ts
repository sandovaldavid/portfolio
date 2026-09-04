import { expect, test } from './fixtures';

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

test('English current role renders as a systems-oriented career case study', async ({ page }) => {
	await page.goto('/experience/atena-software-engineer');

	const caseStudy = page.locator('[data-experience-case-study="atena-software-engineer"]');
	await expect(caseStudy).toBeVisible();
	await expect(caseStudy).toHaveAttribute('data-experience-presentation', 'systems');
	await expect(caseStudy.locator('[data-experience-hero] h1')).toHaveText('Atena');
	await expect(caseStudy.locator('[data-experience-contributions] li')).toHaveCount(4);
	await expect(caseStudy.locator('[data-experience-narrative]')).toContainText(
		'WORKING ON EXISTING SYSTEMS'
	);
	await expect(caseStudy.locator('[data-experience-narrative]')).toContainText('VALIDATION');
	await expect(caseStudy.locator('[data-experience-section-layout="split"]')).toBeVisible();
	await expect(caseStudy.locator('[data-experience-focus]')).toContainText(
		'Entity Framework Core'
	);
	await expect(caseStudy.locator('[data-experience-focus]')).toContainText('SQL Server');
	await expect(caseStudy.locator('[data-experience-focus]')).toContainText('Unit Testing');
});

test('Spanish current role renders the localized systems narrative', async ({ page }) => {
	await page.goto('/es/experience/atena-software-engineer');

	const caseStudy = page.locator('[data-experience-case-study="atena-software-engineer"]');
	await expect(caseStudy).toBeVisible();
	await expect(caseStudy.locator('[data-experience-narrative]')).toContainText(
		'TRABAJO SOBRE SISTEMAS EXISTENTES'
	);
	await expect(caseStudy.locator('[data-experience-narrative]')).toContainText('VALIDACIÓN');
	await expect(caseStudy.locator('[data-experience-status]')).toContainText('ACTUAL');
});

test('highlighted prose narrative uses the full career shell width on desktop', async ({ page }) => {
	await page.setViewportSize(DESKTOP);
	await page.goto('/es/experience/atena-software-engineer');

	const section = page.locator(
		'[data-experience-section-surface="highlight"][data-experience-section-layout="prose"]'
	);
	const shell = section.locator(':scope > div');
	const heading = shell.locator(':scope > div').nth(0);
	const content = shell.locator(':scope > div').nth(1);

	await expect(section).toBeVisible();
	const shellBox = (await shell.boundingBox())!;
	const headingBox = (await heading.boundingBox())!;
	const contentBox = (await content.boundingBox())!;

	expect(Math.abs(shellBox.width - headingBox.width)).toBeLessThanOrEqual(2);
	expect(Math.abs(shellBox.width - contentBox.width)).toBeLessThanOrEqual(2);
});

test('Chirasoft uses a product-oriented hierarchy with a lead contribution', async ({ page }) => {
	await page.goto('/experience/chirasoft-fullstack-developer');

	const caseStudy = page.locator('[data-experience-case-study="chirasoft-fullstack-developer"]');
	await expect(caseStudy).toHaveAttribute('data-experience-presentation', 'product');
	await expect(caseStudy.locator('[data-experience-section-layout="lead"]')).toBeVisible();
	await expect(caseStudy.locator('[data-experience-panel]')).toHaveCount(2);
	await expect(caseStudy.locator('[data-experience-narrative]')).toContainText(
		'WordPress to Angular 19'
	);
	await expect(caseStudy.locator('[data-experience-narrative]')).toContainText(
		'Frontend and backend product flow'
	);
});

test('Municipality uses an operations-oriented triad', async ({ page }) => {
	await page.goto('/experience/municipality-piura-software-developer');

	const caseStudy = page.locator(
		'[data-experience-case-study="municipality-piura-software-developer"]'
	);
	await expect(caseStudy).toHaveAttribute('data-experience-presentation', 'operations');
	await expect(caseStudy.locator('[data-experience-section-layout="triad"]')).toBeVisible();
	await expect(caseStudy.locator('[data-experience-panel]')).toHaveCount(3);
	await expect(caseStudy.locator('[data-experience-narrative]')).toContainText(
		'Modernization assessment'
	);
	await expect(caseStudy.locator('[data-experience-focus]')).toContainText('VLAN / Subnetting');
	await expect(caseStudy.locator('[data-experience-focus]')).toContainText('Backup & Recovery');
});

test('career archive index exposes every documented role', async ({ page }) => {
	await page.goto('/experience');

	const archive = page.locator('[data-experience-archive]');
	await expect(archive).toBeVisible();
	await expect(archive.locator('ol > li')).toHaveCount(3);
	await expect(archive).toContainText('Atena');
	await expect(archive).toContainText('Chirasoft');
	await expect(archive).toContainText('Provincial Municipality of Piura');
});

test('career shell exposes verified optional organization links', async ({ page }) => {
	for (const scenario of [
		{
			route: '/experience/atena-software-engineer',
			url: 'https://atena.la',
			label: /Official website/,
		},
		{
			route: '/experience/chirasoft-fullstack-developer',
			url: 'https://chirasoft.pe',
			label: /Official website/,
		},
		{
			route: '/experience/municipality-piura-software-developer',
			url: 'https://www.gob.pe/munipiura',
			label: /Official website/,
		},
		{
			route: '/es/experience/municipality-piura-software-developer',
			url: 'https://www.gob.pe/munipiura',
			label: /Sitio oficial/,
		},
	] as const) {
		await page.goto(scenario.route);
		const link = page.locator('[data-experience-organization-link]');
		await expect(link).toBeVisible();
		await expect(link).toHaveAttribute('href', scenario.url);
		await expect(link).toHaveAttribute('target', '_blank');
		await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
		await expect(link).toHaveAccessibleName(scenario.label);
	}
});

test('career navigation aligns available history controls without empty placeholders', async ({
	page,
}) => {
	await page.setViewportSize(DESKTOP);

	for (const scenario of [
		{ route: '/experience/municipality-piura-software-developer', linkCount: 1 },
		{ route: '/experience/chirasoft-fullstack-developer', linkCount: 2 },
		{ route: '/experience/atena-software-engineer', linkCount: 1 },
	] as const) {
		await page.goto(scenario.route);
		const navigation = page.locator('[data-experience-career-navigation]');
		const label = navigation.locator('[data-experience-career-label]');
		const links = navigation.locator('[data-experience-career-links]');
		const shell = navigation.locator(':scope > div');

		await expect(navigation).toBeVisible();
		await expect(links.getByRole('link')).toHaveCount(scenario.linkCount);
		await expect(links.locator(':scope > span')).toHaveCount(0);

		const labelBox = (await label.boundingBox())!;
		const linksBox = (await links.boundingBox())!;
		const shellBox = (await shell.boundingBox())!;
		const labelCenter = labelBox.y + labelBox.height / 2;
		const linksCenter = linksBox.y + linksBox.height / 2;

		expect(Math.abs(labelCenter - linksCenter)).toBeLessThanOrEqual(2);
		expect(
			Math.abs(linksBox.x + linksBox.width - (shellBox.x + shellBox.width))
		).toBeLessThanOrEqual(2);
	}

	await page.setViewportSize(MOBILE);
	await page.goto('/experience/municipality-piura-software-developer');
	const navigation = page.locator('[data-experience-career-navigation]');
	const labelBox = (await navigation.locator('[data-experience-career-label]').boundingBox())!;
	const linksBox = (await navigation.locator('[data-experience-career-links]').boundingBox())!;
	expect(linksBox.y).toBeGreaterThan(labelBox.y + labelBox.height);
});

test('middle career role links backward and forward through history', async ({ page }) => {
	await page.goto('/experience/chirasoft-fullstack-developer');

	const navigation = page.locator('[data-experience-career-navigation]');
	await expect(navigation).toBeVisible();
	await expect(navigation.getByRole('link', { name: /Previous role/i })).toHaveAttribute(
		'href',
		'/experience/municipality-piura-software-developer/'
	);
	await expect(navigation.getByRole('link', { name: /Next role/i })).toHaveAttribute(
		'href',
		'/experience/atena-software-engineer/'
	);
});

test('legacy Atena route resolves to the canonical current-role URL', async ({ page }) => {
	await page.goto('/atena');
	await expect(page).toHaveURL(/\/experience\/atena-software-engineer\/?$/);
	await expect(
		page.locator('[data-experience-case-study="atena-software-engineer"]')
	).toBeVisible();
});
