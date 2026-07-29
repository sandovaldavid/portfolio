import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');

describe('home section localization migration', () => {
	it('uses focused granular catalogs in home widgets', () => {
		const migratedFiles = [
			'src/widgets/hero/ui/Hero.astro',
			'src/widgets/about-me/ui/AboutMe.astro',
			'src/widgets/research/ui/Research.astro',
			'src/widgets/vision/ui/Vision.astro',
			'src/widgets/tech-stack/ui/TechStack.astro',
			'src/widgets/badges/ui/Badges.astro',
		];

		for (const file of migratedFiles) {
			const source = readSource(file);
			expect(source, file).toContain('createScopedUiTranslator');
			expect(source, file).not.toContain('const copy =');
			expect(source, file).not.toContain('useTranslations(');
		}
	});

	it('registers mirrored focused section modules', () => {
		for (const locale of ['en', 'es']) {
			for (const module of [
				'hero',
				'about',
				'badges',
				'experience',
				'projects',
				'research',
				'vision',
				'tech-stack',
			]) {
				expect(
					existsSync(`src/shared/config/i18n/locales/${locale}/sections/${module}.json`)
				).toBe(true);
			}
		}

		const catalog = readSource('src/shared/config/i18n/catalog.ts');
		expect(catalog).toContain("'sections.badges'");
		expect(catalog).toContain("'sections.experience'");
		expect(catalog).toContain("'sections.projects'");
	});

	it('deletes the monolithic compatibility dictionaries', () => {
		for (const locale of ['en', 'es']) {
			expect(existsSync(`src/shared/config/i18n/locales/${locale}.json`)).toBe(false);
		}
	});

	it('keeps technical navigation identities separate from localized labels', () => {
		const layout = readSource('src/app/layouts/Layout.astro');
		expect(layout).toContain("tExperience('sectionTitle')");
		expect(layout).toContain("tResearchSection('sectionTitle')");
		expect(layout).toContain("tProjects('sectionTitle')");
		expect(layout).toContain("tAbout('sectionTitle')");
		expect(layout).toContain("tTechStack('sectionTitle')");
		expect(layout).not.toContain("t('title.");
	});
});
