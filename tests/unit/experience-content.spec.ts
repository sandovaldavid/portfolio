import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
	EXPERIENCE_METADATA,
	EXPERIENCE_TECHNOLOGIES,
} from '../../src/entities/experience/model/metadata';

const readSource = (path: string): string => readFileSync(path, 'utf8');
const locales = ['en', 'es'] as const;
const expectedIds = Object.keys(EXPERIENCE_METADATA).sort();

interface ExperienceDocument {
	file: string;
	source: string;
	experienceId: string;
	locale: string;
	company: string;
	title: string;
	dateLabel: string;
	summary: string;
	achievements: string[];
}

function readFrontmatterField(source: string, field: string): string {
	return source.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'))?.[1]?.trim() ?? '';
}

function loadExperience(locale: (typeof locales)[number]): ExperienceDocument[] {
	const directory = `src/content/experience/${locale}`;
	return readdirSync(directory)
		.filter(file => file.endsWith('.mdx'))
		.map(file => {
			const source = readSource(`${directory}/${file}`);
			const frontmatter = source.match(/^---\n([\s\S]*?)\n---/m)?.[1] ?? '';
			return {
				file,
				source,
				experienceId: readFrontmatterField(frontmatter, 'experienceId'),
				locale: readFrontmatterField(frontmatter, 'locale'),
				company: readFrontmatterField(frontmatter, 'company'),
				title: readFrontmatterField(frontmatter, 'title'),
				dateLabel: readFrontmatterField(frontmatter, 'dateLabel'),
				summary: readFrontmatterField(frontmatter, 'summary'),
				achievements: frontmatter
					.split('\n')
					.filter(line => /^\s+-\s+/.test(line))
					.map(line => line.replace(/^\s+-\s+/, '').trim()),
			};
		});
}

const entries = {
	en: loadExperience('en'),
	es: loadExperience('es'),
};

describe('localized professional experience content', () => {
	it('registers a schema-validated MDX Astro collection', () => {
		const config = readSource('src/content.config.ts');
		expect(config).toContain('const experience = defineCollection');
		expect(config).toContain("pattern: '**/*.mdx', base: './src/content/experience'");
		expect(config).toContain('experienceId: stableContentId');
		expect(config).toContain('summary: nonEmptyString');
		expect(config).toContain('achievements: z.array(nonEmptyString).min(1)');
		expect(config).toContain(
			'export const collections = { blog, devlog, portfolioProfile, experience, research, projects }'
		);
	});

	it('stores one independent localized MDX file for every stable role', () => {
		for (const locale of locales) {
			const ids = entries[locale].map(entry => entry.experienceId).sort();
			expect(ids).toEqual(expectedIds);
			expect(new Set(ids).size).toBe(ids.length);
			expect(entries[locale].every(entry => entry.locale === locale)).toBe(true);
			expect(entries[locale].map(entry => entry.file).sort()).toEqual(
				expectedIds.map(id => `${id}.mdx`)
			);
		}
	});

	it('keeps English and Spanish records structurally paired', () => {
		for (const experienceId of expectedIds) {
			const english = entries.en.find(entry => entry.experienceId === experienceId);
			const spanish = entries.es.find(entry => entry.experienceId === experienceId);

			expect(english, experienceId).toBeDefined();
			expect(spanish, experienceId).toBeDefined();
			expect(english?.achievements).toHaveLength(spanish?.achievements.length ?? -1);
			expect(english?.summary.length ?? 0).toBeGreaterThan(0);
			expect(spanish?.summary.length ?? 0).toBeGreaterThan(0);
		}
	});

	it('contains meaningful localized values and narrative MDX', () => {
		for (const entry of [...entries.en, ...entries.es]) {
			expect(entry.company.length).toBeGreaterThan(0);
			expect(entry.title.length).toBeGreaterThan(0);
			expect(entry.dateLabel.length).toBeGreaterThan(0);
			expect(entry.summary.length).toBeGreaterThan(0);
			expect(entry.achievements.length).toBeGreaterThan(0);
			expect(entry.source).toContain('<ExperienceSection');
		}

		for (const locale of locales) {
			const atena = entries[locale].find(entry => entry.experienceId === 'atena-software-engineer');
			expect(atena?.source).toContain('<ExperienceBoundary');
		}
	});

	it('keeps ordering and semantic technology metadata language-neutral', () => {
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
				const technology = EXPERIENCE_TECHNOLOGIES[technologyId];
				expect(technology.label.trim().length).toBeGreaterThan(0);
				expect(['technology', 'architecture', 'practice', 'capability']).toContain(
					technology.kind
				);
			}
		}

		expect(EXPERIENCE_TECHNOLOGIES['dotnet-8']).toMatchObject({
			kind: 'technology',
			iconKey: 'dotnet',
		});
		expect(EXPERIENCE_TECHNOLOGIES['angular-19']).toMatchObject({
			kind: 'technology',
			iconKey: 'angular',
		});
		expect(EXPERIENCE_TECHNOLOGIES['clean-architecture']).toEqual({
			label: 'Clean Architecture',
			kind: 'architecture',
		});
		expect(EXPERIENCE_TECHNOLOGIES.cqrs).toEqual({ label: 'CQRS', kind: 'architecture' });
	});

	it('resolves both Home data and MDX detail entries through the canonical entity', () => {
		const query = readSource('src/entities/experience/model/queries.ts');
		const widget = readSource('src/widgets/experience/ui/Experience.astro');
		const englishRoute = readSource('src/pages/experience/[slug].astro');
		const spanishRoute = readSource('src/pages/es/experience/[slug].astro');

		expect(query).toContain("getCollection('experience'");
		expect(query).toContain('getExperienceDetailBySlug');
		expect(query).toContain('EXPERIENCE_METADATA');
		expect(query).toContain('Missing experience content for locale');
		expect(widget).toContain('await getExperienceData(lang)');
		expect(englishRoute).toContain('await render(entry)');
		expect(spanishRoute).toContain('await render(entry)');
		expect(englishRoute).toContain('experienceCaseStudyComponents');
		expect(spanishRoute).toContain('experienceCaseStudyComponents');
	});

	it('uses a reusable career shell instead of an Atena-specific page implementation', () => {
		const shell = readSource('src/widgets/experience-case-study/ui/ExperienceCaseStudy.astro');
		const detail = readSource('src/widgets/experience/ui/ExperienceDetail.astro');
		const about = readSource('src/widgets/about-me/ui/AboutMe.astro');

		expect(shell).toContain('data-experience-case-study');
		expect(shell).toContain('data-experience-contributions');
		expect(shell).toContain('data-experience-focus');
		expect(shell).toContain('data-experience-career-navigation');
		expect(shell).toContain("technology.kind === group.kind");
		expect(detail).toContain('`experience/${experienceId}`');
		expect(about).toContain("'experience/atena-software-engineer'");
		expect(existsSync('src/widgets/atena-details/ui/AtenaDetails.astro')).toBe(false);
	});

	it('uses stable IDs for the ARIA tab and panel relationship', () => {
		const widget = readSource('src/widgets/experience/ui/Experience.astro');
		expect(widget).toContain('exp-tab-${exp.experienceId}');
		expect(widget).toContain('exp-panel-${exp.experienceId}');
		expect(widget).toContain('data-experience-id={exp.experienceId}');
	});
});
