import { expect, test } from './fixtures';

test('English current role renders as a systems-oriented career case study', async ({ page }) => {
	await page.goto('/experience/atena-software-engineer');

	const caseStudy = page.locator('[data-experience-case-study="atena-software-engineer"]');
	await expect(caseStudy).toBeVisible();
	await expect(caseStudy).toHaveAttribute('data-experience-presentation', 'systems');
	await expect(caseStudy.locator('[data-experience-hero] h1')).toHaveText('Atena');
	await expect(caseStudy.locator('[data-experience-contributions] li')).toHaveCount(4);
	await expect(caseStudy.locator('[data-experience-narrative]')).toContainText('ROLE CONTEXT');
	await expect(caseStudy.locator('[data-experience-narrative]')).toContainText(
		'DELIVERY DISCIPLINE'
	);
	await expect(caseStudy.locator('[data-experience-section-layout="split"]')).toBeVisible();
	await expect(caseStudy.locator('[data-experience-focus]')).toContainText('Entity Framework Core');
	await expect(caseStudy.locator('[data-experience-focus]')).toContainText('SQL Server');
	await expect(caseStudy.locator('[data-experience-focus]')).toContainText('Unit Testing');
});

test('Spanish current role renders the localized systems narrative', async ({ page }) => {
	await page.goto('/es/experience/atena-software-engineer');

	const caseStudy = page.locator('[data-experience-case-study="atena-software-engineer"]');
	await expect(caseStudy).toBeVisible();
	await expect(caseStudy.locator('[data-experience-narrative]')).toContainText('CONTEXTO DEL ROL');
	await expect(caseStudy.locator('[data-experience-narrative]')).toContainText(
		'DISCIPLINA DE ENTREGA'
	);
	await expect(caseStudy.locator('[data-experience-status]')).toContainText('ACTUAL');
});

test('Chirasoft uses a product-oriented hierarchy with a lead contribution', async ({ page }) => {
	await page.goto('/experience/chirasoft-fullstack-developer');

	const caseStudy = page.locator('[data-experience-case-study="chirasoft-fullstack-developer"]');
	await expect(caseStudy).toHaveAttribute('data-experience-presentation', 'product');
	await expect(caseStudy.locator('[data-experience-section-layout="lead"]')).toBeVisible();
	await expect(caseStudy.locator('[data-experience-panel]')).toHaveCount(2);
	await expect(caseStudy.locator('[data-experience-narrative]')).toContainText('WordPress to Angular 19');
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

test('middle career role links backward and forward through history', async ({ page }) => {
	await page.goto('/experience/chirasoft-fullstack-developer');

	const navigation = page.locator('[data-experience-career-navigation]');
	await expect(navigation).toBeVisible();
	await expect(navigation.getByRole('link', { name: /Previous role/i })).toHaveAttribute(
		'href',
		'/experience/municipality-piura-software-developer'
	);
	await expect(navigation.getByRole('link', { name: /Next role/i })).toHaveAttribute(
		'href',
		'/experience/atena-software-engineer'
	);
});

test('legacy Atena route resolves to the canonical current-role URL', async ({ page }) => {
	await page.goto('/atena');
	await expect(page).toHaveURL(/\/experience\/atena-software-engineer\/?$/);
	await expect(page.locator('[data-experience-case-study="atena-software-engineer"]')).toBeVisible();
});
