import { test, expect } from './fixtures';

async function expectLocalizedShell(
	page: import('@playwright/test').Page,
	isMobile: boolean,
	locale: 'en' | 'es'
) {
	const isEnglish = locale === 'en';
	await expect(page.locator('html')).toHaveAttribute('lang', locale);
	await expect(page.locator('a[href="#main-content"]')).toHaveText(
		isEnglish ? 'Skip to main content' : 'Saltar al contenido principal'
	);

	if (isMobile) {
		await expect(page.getByRole('navigation', { name: isEnglish ? 'Main navigation' : 'Navegación principal' })).toHaveCount(0);
		await expect(page.locator('#recruiter-hud-toggle')).toBeHidden();
		await page.locator('#mobile-menu-btn').click();
		const menu = page.locator('#mobile-menu');
		await expect(menu).toBeVisible();
		await expect(
			menu.getByRole('button', { name: isEnglish ? 'Choose theme' : 'Elegir tema' })
		).toBeAttached();
		await expect(
			menu.getByRole('group', { name: isEnglish ? 'Choose language' : 'Elegir idioma' })
		).toBeAttached();
		return;
	}

	await expect(
		page.getByRole('navigation', { name: isEnglish ? 'Main navigation' : 'Navegación principal' })
	).toBeAttached();
	const recruiterButton = page.getByRole('button', {
		name: isEnglish ? 'Recruiter links' : 'Enlaces para reclutadores',
	});
	await expect(recruiterButton).toBeVisible();
	await recruiterButton.click();
	await expect(
		page.getByRole('button', { name: isEnglish ? 'Choose theme' : 'Elegir tema' })
	).toBeAttached();
	await expect(
		page.getByRole('group', { name: isEnglish ? 'Choose language' : 'Elegir idioma' }).first()
	).toBeAttached();

	await page.keyboard.press('?');
	await expect(
		page.getByRole('dialog', {
			name: isEnglish ? 'Keyboard shortcuts' : 'Atajos de teclado',
		})
	).toBeVisible();
	await page.keyboard.press('Escape');

	await page.keyboard.press(':');
	await expect(
		page.getByRole('dialog', {
			name: isEnglish ? 'Portfolio CLI terminal' : 'Terminal CLI del portafolio',
		})
	).toBeVisible();
	await expect(
		page.getByRole('textbox', {
			name: isEnglish ? 'Terminal command input' : 'Entrada de comandos de la terminal',
		})
	).toHaveAttribute(
		'placeholder',
		isEnglish ? "type a command… (try 'help')" : "escribe un comando… (prueba 'help')"
	);
}

test.describe('Localized shared shell', () => {
	test('renders English navigation, controls and CLI labels', async ({ page }, testInfo) => {
		await page.goto('/');
		await expectLocalizedShell(page, Boolean(testInfo.project.use.isMobile), 'en');
	});

	test('renders Spanish navigation, controls and CLI labels', async ({ page }, testInfo) => {
		await page.goto('/es/');
		await expectLocalizedShell(page, Boolean(testInfo.project.use.isMobile), 'es');
	});
});
