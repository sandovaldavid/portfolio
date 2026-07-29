import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');
const readJson = <T>(path: string): T => JSON.parse(readSource(path)) as T;

interface EvidenceSourceDocument {
	sourceId: string;
	label: string;
	access: string;
}

interface ProjectEvidenceDocument {
	statusLabel: string;
	status: string;
	statusDetail: string;
	implementedLabel: string;
	implemented: string[];
	plannedLabel: string;
	planned: string[];
	architectureLabel: string;
	architecture: Record<string, string>;
	securityLabel: string;
	security: string[];
	testingLabel: string;
	testing: string[];
	deploymentLabel: string;
	deployment: string[];
	limitationsLabel: string;
	limitations: string[];
	sourcesLabel: string;
	sources: EvidenceSourceDocument[];
}

interface ProjectDocument {
	projectId: string;
	locale: 'en' | 'es';
	title: string;
	description: string;
	category: string;
	imageAlt: string;
	caseStudy: {
		problem: string;
		approach: string;
		tradeoffs: string;
		outcome: string;
		learnings: string[];
		timeline: string;
		role: string;
		evidence?: ProjectEvidenceDocument;
	};
}

const locales = ['en', 'es'] as const;
const expectedIds = ['auctions', 'campus-map', 'fluentreads', 'mad-ai', 'yukidoke'] as const;

function loadProjects(locale: (typeof locales)[number]) {
	const directory = `src/content/projects/${locale}`;
	return readdirSync(directory)
		.filter(file => file.endsWith('.json'))
		.map(file => readJson<ProjectDocument>(`${directory}/${file}`));
}

const entries = {
	en: loadProjects('en'),
	es: loadProjects('es'),
};

function nonEmpty(value: string): boolean {
	return value.trim().length > 0;
}

describe('localized project and case-study content', () => {
	it('registers the schema-validated Astro projects collection', () => {
		const config = readSource('src/content.config.ts');
		expect(config).toContain('const projects = defineCollection');
		expect(config).toContain("base: './src/content/projects'");
		expect(config).toContain('projectId: stableContentId');
		expect(config).toContain('imageAlt: nonEmptyString');
		expect(config).toContain('evidence: projectEvidence.optional()');
		expect(config).toContain(
			'export const collections = { blog, devlog, portfolioProfile, experience, research, projects }'
		);
	});

	it('stores one independent localized entry for every stable project', () => {
		for (const locale of locales) {
			const ids = entries[locale].map(entry => entry.projectId).sort();
			expect(ids).toEqual([...expectedIds]);
			expect(new Set(ids).size).toBe(ids.length);
			expect(entries[locale].every(entry => entry.locale === locale)).toBe(true);
		}
	});

	it('keeps English and Spanish project structures paired', () => {
		for (const projectId of expectedIds) {
			const english = entries.en.find(entry => entry.projectId === projectId);
			const spanish = entries.es.find(entry => entry.projectId === projectId);

			expect(english, projectId).toBeDefined();
			expect(spanish, projectId).toBeDefined();
			expect(Object.keys(english ?? {}).sort()).toEqual(Object.keys(spanish ?? {}).sort());
			expect(Object.keys(english?.caseStudy ?? {}).sort()).toEqual(
				Object.keys(spanish?.caseStudy ?? {}).sort()
			);
			expect(english?.caseStudy.learnings).toHaveLength(
				spanish?.caseStudy.learnings.length ?? -1
			);
			expect(Boolean(english?.caseStudy.evidence)).toBe(Boolean(spanish?.caseStudy.evidence));

			if (english?.caseStudy.evidence && spanish?.caseStudy.evidence) {
				expect(Object.keys(english.caseStudy.evidence).sort()).toEqual(
					Object.keys(spanish.caseStudy.evidence).sort()
				);
				expect(english.caseStudy.evidence.sources.map(source => source.sourceId)).toEqual(
					spanish.caseStudy.evidence.sources.map(source => source.sourceId)
				);
			}
		}
	});

	it('contains meaningful localized project and case-study values', () => {
		for (const entry of [...entries.en, ...entries.es]) {
			expect(nonEmpty(entry.title)).toBe(true);
			expect(nonEmpty(entry.description)).toBe(true);
			expect(nonEmpty(entry.category)).toBe(true);
			expect(nonEmpty(entry.imageAlt)).toBe(true);
			expect(nonEmpty(entry.caseStudy.problem)).toBe(true);
			expect(nonEmpty(entry.caseStudy.approach)).toBe(true);
			expect(nonEmpty(entry.caseStudy.tradeoffs)).toBe(true);
			expect(nonEmpty(entry.caseStudy.outcome)).toBe(true);
			expect(nonEmpty(entry.caseStudy.timeline)).toBe(true);
			expect(nonEmpty(entry.caseStudy.role)).toBe(true);
			expect(entry.caseStudy.learnings.every(nonEmpty)).toBe(true);
		}
	});

	it('keeps URLs, images, technology IDs, ordering and feature state language-neutral', () => {
		const metadata = readSource('src/entities/project/model/metadata.ts');
		const slugs = [...metadata.matchAll(/slug: '([^']+)'/g)].map(match => match[1]);
		const orders = [...metadata.matchAll(/order: (\d+)/g)].map(match => Number(match[1]));

		expect(slugs.sort()).toEqual([...expectedIds]);
		expect(new Set(slugs).size).toBe(expectedIds.length);
		expect(orders.sort((left, right) => right - left)).toEqual([50, 40, 30, 20, 10]);
		expect(metadata).toContain('technologyIds:');
		expect(metadata).toContain('evidenceSourceUrls:');
		expect(metadata).toContain(
			"'yukidoke-web': 'https://github.com/sandovaldavid/yukidoke-web'"
		);

		for (const entry of [...entries.en, ...entries.es]) {
			expect(JSON.stringify(entry)).not.toContain('https://');
		}
	});

	it('loads localized entries through the project entity and rejects incomplete content', () => {
		const query = readSource('src/entities/project/model/queries.ts');
		expect(query).toContain("getCollection('projects'");
		expect(query).toContain('PROJECT_METADATA');
		expect(query).toContain('Duplicate project ID');
		expect(query).toContain('Missing project content for locale');
		expect(query).toContain('Missing language-neutral URL for evidence source');
	});

	it('removes dictionary-backed project records and obsolete data owners', () => {
		for (const locale of locales) {
			expect(existsSync(`src/shared/config/i18n/locales/${locale}.json`)).toBe(false);
		}

		expect(existsSync('src/shared/config/i18n/dictionaries/index.ts')).toBe(false);
		expect(existsSync('src/entities/project/model/data.ts')).toBe(false);
		expect(existsSync('src/shared/config/i18n/locales/projects/yukidoke.en.json')).toBe(false);
		expect(existsSync('src/shared/config/i18n/locales/projects/yukidoke.es.json')).toBe(false);
	});

	it('makes project lists and detail routes consume the canonical entity API', () => {
		const widget = readSource('src/widgets/projects/ui/Projects.astro');
		const englishRoute = readSource('src/pages/projects/[slug].astro');
		const spanishRoute = readSource('src/pages/es/projects/[slug].astro');

		expect(widget).toContain('await getProjectsData(lang)');
		expect(widget).toContain("createScopedUiTranslator(lang, 'sections.projects')");
		expect(widget).not.toContain('useTranslations');
		for (const route of [englishRoute, spanishRoute]) {
			expect(route).toContain('const lang = getLanguageFromLocale(Astro.currentLocale)');
			expect(route).toContain('await getProjectBySlug(lang, slug)');
			expect(route).toContain("getRelativeLocaleUrl(lang, 'projects')");
		}
	});

	it('contains no known hardcoded English project presentation on Spanish surfaces', () => {
		const card = readSource('src/entities/project/ui/ProjectCard.astro');
		const caseStudy = readSource('src/widgets/project-case-study/ui/ProjectCaseStudy.astro');
		const metadata = readSource('src/entities/project/model/metadata.ts');

		expect(card).toContain('alt={imageAlt}');
		expect(card).toContain('{cardTypeText}');
		expect(card).not.toContain("'Feature'");
		expect(card).not.toContain("'Project'");
		expect(caseStudy).toContain('{caseStudyLabel}');
		expect(caseStudy).toContain('alt={project.imageAlt}');
		expect(caseStudy).not.toContain('BOSS FIGHT // CASE STUDY');
		expect(metadata).not.toContain("timeline: '3 months'");
		expect(metadata).not.toContain("role: 'Solo Developer'");
	});
});
