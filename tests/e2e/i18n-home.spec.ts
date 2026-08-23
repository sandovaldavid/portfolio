import { test, expect } from './fixtures';

test.describe('Localized home sections', () => {
	test('renders complete English home copy', async ({ page }) => {
		await page.goto('/');

		await expect(
			page.getByText('[ AVAILABLE FOR SOFTWARE ENGINEERING OPPORTUNITIES ]')
		).toBeVisible();
		await expect(page.getByText('Professional profile').first()).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Experience' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Research' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Selected Projects' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'About me' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Core Stack' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'View biography' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'View full research' })).toBeVisible();
	});

	test('renders complete Spanish home copy without English section labels', async ({ page }) => {
		await page.goto('/es/');

		await expect(
			page.getByText('[ DISPONIBLE PARA OPORTUNIDADES EN INGENIERÍA DE SOFTWARE ]')
		).toBeVisible();
		await expect(page.getByText('Perfil profesional').first()).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Experiencia' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Investigación' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Proyectos destacados' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Sobre mí' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Stack principal' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Ver biografía' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Ver investigación completa' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Experience' })).toHaveCount(0);
	});
});
