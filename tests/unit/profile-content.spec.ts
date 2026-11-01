import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');
const readJson = <T>(path: string): T => JSON.parse(readSource(path)) as T;

interface ProfileDocument {
	profileId: string;
	locale: 'en' | 'es';
	seo: { title: string; description: string };
	summary: string;
	biography: string[];
	focusAreas: string[];
	availabilityStatement: string;
	location: string;
	workMode: string;
	researchSummary: string;
	currentRoleSummary: string;
}

const profiles = {
	en: readJson<ProfileDocument>('src/content/portfolio-profile/en/profile.json'),
	es: readJson<ProfileDocument>('src/content/portfolio-profile/es/profile.json'),
};

const scalarFields = [
	'summary',
	'availabilityStatement',
	'location',
	'workMode',
	'researchSummary',
	'currentRoleSummary',
] as const;

describe('localized portfolio profile content', () => {
	it('registers a schema-validated Astro content collection', () => {
		const config = readSource('src/content.config.ts');
		expect(config).toContain('const portfolioProfile = defineCollection');
		expect(config).toContain("base: './src/content/portfolio-profile'");
		expect(config).toContain(
			'export const collections = { blog, devlog, portfolioProfile, experience, research, projects }'
		);
	});

	it('keeps stable identity and required structure in parity', () => {
		expect(profiles.en.profileId).toBe(profiles.es.profileId);
		expect(profiles.en.locale).toBe('en');
		expect(profiles.es.locale).toBe('es');
		expect(Object.keys(profiles.en).sort()).toEqual(Object.keys(profiles.es).sort());
		expect(Object.keys(profiles.en.seo).sort()).toEqual(Object.keys(profiles.es.seo).sort());
		expect(profiles.en.biography).toHaveLength(profiles.es.biography.length);
		expect(profiles.en.focusAreas).toHaveLength(profiles.es.focusAreas.length);
	});

	it('contains meaningful non-empty localized values', () => {
		for (const profile of Object.values(profiles)) {
			for (const field of scalarFields) {
				expect(profile[field].trim().length, field).toBeGreaterThan(0);
			}
			expect(profile.seo.title.trim().length).toBeGreaterThan(0);
			expect(profile.seo.description.trim().length).toBeGreaterThan(0);
			expect(profile.biography.every(value => value.trim().length > 0)).toBe(true);
			expect(profile.focusAreas.every(value => value.trim().length > 0)).toBe(true);
		}
	});

	it('loads structured content through the profile entity', () => {
		const query = readSource('src/entities/profile/model/queries.ts');
		expect(query).toContain("getEntry('portfolioProfile'");
		expect(query).toContain('PROFILE_ENTRY_ID');
		expect(query).toContain('profile.data.locale !== lang');
	});

	it('keeps long profile records out of UI catalogs and legacy dictionaries', () => {
		for (const locale of ['en', 'es']) {
			const catalog = readJson<Record<string, unknown>>(
				`src/shared/config/i18n/locales/${locale}/sections/about.json`
			);
			expect(catalog).not.toHaveProperty('profileSummary');
			expect(catalog).not.toHaveProperty('currentSummary');
			expect(existsSync(`src/shared/config/i18n/locales/${locale}.json`)).toBe(false);
		}
	});

	it('makes both About surfaces consume the authoritative profile source', () => {
		const preview = readSource('src/widgets/about-me/ui/AboutMe.astro');
		const detail = readSource('src/widgets/about-content/ui/AboutContent.astro');
		const englishPage = readSource('src/pages/about.astro');
		const spanishPage = readSource('src/pages/es/about.astro');

		expect(preview).toContain('getPortfolioProfile');
		expect(preview).toContain('profile.summary');
		expect(preview).toContain('profile.currentRoleSummary');
		expect(detail).toContain('profile.biography');
		expect(detail).toContain('profile.focusAreas');
		expect(detail).not.toContain('const copy =');
		expect(detail).not.toContain('isEnglish');
		expect(englishPage).toContain('profile.data.seo.title');
		expect(spanishPage).toContain('profile.data.seo.title');
	});
});
