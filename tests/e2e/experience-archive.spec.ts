import { expect, test } from './fixtures';

test('English current role renders as a full career case study', async ({ page }) => {
	await page.goto('/experience/atena-software-engineer');

	const caseStudy = page.locator('[data-experience-case-study="atena-software-engineer"]');
	await expect(caseStudy).toBeVisible();
	await expect(caseStudy.locator('[data-experience-hero] h1')).toHaveText('Atena');
	await expect(caseStudy.locator('[data-experience-contributions] li')).toHaveCount(3);
	await expect(caseStudy.locator('[data-experience-narrative]')).toContainText('ROLE CONTEXT');
	await expect(caseStudy.locator('[data-experience-boundary]')).toContainText(
		'CONFIDENTIALITY BOUNDARY'
	);
	await expect(caseStudy.locator('[data-experience-focus]')).toContainText('.NET 8');
	await expect(caseStudy.locator('[data-experience-focus]')).toContainText('Clean Architecture');
	await expect(caseStudy.locator('[data-experience-focus]')).toContainText('Unit Testing');
});

test('Spanish current role renders the localized MDX narrative', async ({ page }) => {
	await page.goto('/es/experience/atena-software-engineer');

	const caseStudy = page.locator('[data-experience-case-study="atena-software-engineer"]');
	await expect(caseStudy).toBeVisible();
	await expect(caseStudy.locator('[data-experience-narrative]')).toContainText('CONTEXTO DEL ROL');
	await expect(caseStudy.locator('[data-experience-boundary]')).toContainText(
		'LÍMITE DE CONFIDENCIALIDAD'
	);
	await expect(caseStudy.locator('[data-experience-status]')).toContainText('ACTUAL');
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
