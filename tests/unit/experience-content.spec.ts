import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
	EXPERIENCE_METADATA,
	EXPERIENCE_TECHNOLOGIES,
} from '../../src/entities/experience/model/metadata';

const readSource = (path: string): string => readFileSync(path, 'utf8');
const readJson = <T>(path: string): T => JSON.parse(readSource(path)) as T;

interface ExperienceDocument {
	experienceId: string;
	locale: 'en' | 'es';
	company: string;
	title: string;
	dateLabel: string;
	achievements: string[];
}

const locales = ['en', 'es'] as const;
const expectedIds = Object.keys(EXPERIENCE_METADATA).sort();

function loadExperience(locale: (typeof locales)[number]) {
	const directory = `src/content/experience/${locale}`;
	return readdirSync(directory)
		.filter(file => file.endsWith('.json'))
		.map(file => readJson<ExperienceDocument>(`${directory}/${file}`));
}

const entries = {
	en: loadExperience('en'),
	es: loadExperience('es'),
};

describe('localized professional experience content', () => {
	it('registers a schema-validated Astro collection', () => {
		const config = readSource('src/content.config.ts');
		expect(config).toContain('const experience = defineCollection');
		expect(config).toContain("base: './src/content/experience'");
		expect(config).toContain('experienceId: stableContentId');
		expect(config).toContain('achievements: z.array(nonEmptyString).min(1)');
		expect(config).toContain(
			'export const collections = { blog, devlog, portfolioProfile, experience, research, projects }'
		);
	});

	it('stores one independent localized file for every stable role', () => {
		for (const locale of locales) {
			const ids = entries[locale].map(entry => entry.experienceId).sort();
			expect(ids).toEqual(expectedIds);
			expect(new Set(ids).size).toBe(ids.length);
			expect(entries[locale].every(entry => entry.locale === locale)).toBe(true);
		}
	});

	it('keeps English and Spanish records structurally paired', () => {
		for (const experienceId of expectedIds) {
			const english = entries.en.find(entry => entry.experienceId === experienceId);
			const spanish = entries.es.find(entry => entry.experienceId === experienceId);

			expect(english, experienceId).toBeDefined();
			expect(spanish, experienceId).toBeDefined();
			expect(Object.keys(english ?? {}).sort()).toEqual(Object.keys(spanish ?? {}).sort());
			expect(english?.achievements).toHaveLength(spanish?.achievements.length ?? -1);
		}
	});

	it('contains meaningful localized values', () => {
		for (const entry of [...entries.en, ...entries.es]) {
			expect(entry.company.trim().length).toBeGreaterThan(0);
			expect(entry.title.trim().length).toBeGreaterThan(0);
			expect(entry.dateLabel.trim().length).toBeGreaterThan(0);
			expect(entry.achievements.length).toBeGreaterThan(0);
			expect(entry.achievements.every(value => value.trim().length > 0)).toBe(true);
		}
	});

	it('keeps ordering and technology metadata language-neutral', () => {
		const orderedIds = Object.entries(EXPERIENCE_METADATA)
			.sort(([, left], [, right]) => right.order - left.order)
			.map(([experienceId]) => experienceId);

		expect(orderedIds).toEqual([
			'atena-software-engineer',
			'chirasoft-fullstack-developer',
			'municipality-piura-software-developer',
		]);

		for (const metadata of Object.values(EXPERIENCE_METADATA)) {
			expect(metadata.technologyIds.length).toBeGreaterThan(0);
			for (const technologyId of metadata.technologyIds) {
				expect(EXPERIENCE_TECHNOLOGIES[technologyId].trim().length).toBeGreaterThan(0);
			}
		}
	});

	it('loads experience and research through canonical entities only', () => {
		const query = readSource('src/entities/experience/model/queries.ts');
		const widget = readSource('src/widgets/experience/ui/Experience.astro');
		const research = readSource('src/widgets/research-content/ui/ResearchContent.astro');

		expect(query).toContain("getCollection('experience'");
		expect(query).toContain('EXPERIENCE_METADATA');
		expect(query).toContain('Missing experience content for locale');
		expect(widget).toContain('await getExperienceData(lang)');
		expect(widget).not.toContain('useTranslationsList');
		expect(widget).not.toMatch(/\bconst\s+tList\b/);
		expect(research).toContain('getResearchContent');
		expect(research).not.toContain('useTranslationsList');
		expect(existsSync('src/shared/lib/i18n/translations.ts')).toBe(false);
		for (const locale of locales) {
			expect(existsSync(`src/shared/config/i18n/locales/${locale}.json`)).toBe(false);
		}
	});

	it('uses stable IDs for the ARIA tab and panel relationship', () => {
		const widget = readSource('src/widgets/experience/ui/Experience.astro');
		expect(widget).toContain('exp-tab-${exp.experienceId}');
		expect(widget).toContain('exp-panel-${exp.experienceId}');
		expect(widget).toContain('data-experience-id={exp.experienceId}');
	});
});
