import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');

describe('shared shell localization migration', () => {
	it('uses granular catalogs in every migrated shared surface', () => {
		const migratedFiles = [
			'src/widgets/header/ui/Header.astro',
			'src/widgets/footer/ui/Footer.astro',
			'src/widgets/contact-sidebar/ui/ContactSidebar.astro',
			'src/widgets/recruiter-hud/ui/RecruiterHUD.astro',
			'src/features/language-picker/ui/LanguagePicker.astro',
			'src/features/theme-toggle/ui/ThemeToggle.astro',
			'src/pages/404.astro',
		];

		for (const file of migratedFiles) {
			const source = readSource(file);
			expect(source, file).toContain('createScopedUiTranslator');
			expect(source, file).not.toContain('const copy =');
			expect(source, file).not.toContain('useTranslations(');
		}
	});

	it('localizes shared accessibility labels instead of hardcoding English', () => {
		const layout = readSource('src/app/layouts/Layout.astro');
		const experience = readSource('src/widgets/experience/ui/Experience.astro');

		expect(layout).toContain("tAccessibility('skipToContent')");
		expect(layout).toContain("tBreadcrumbs('home')");
		expect(layout).not.toContain('>\n\t\t\tSkip to main content\n\t\t</a>');
		expect(experience).toContain("tAccessibility('experienceTabs')");
	});
});
