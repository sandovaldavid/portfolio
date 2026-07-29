import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (filePath: string): string => readFileSync(filePath, 'utf8');
const readJson = <T>(filePath: string): T => JSON.parse(readSource(filePath)) as T;

interface ResearchDocument {
	researchId: string;
	locale: 'en' | 'es';
	label: string;
	title: string;
	problem: string;
	hypothesis: string;
	approach: string;
	dataset: string;
	status: string;
	institution: string;
	keywords: string[];
	metrics: Record<'accuracy' | 'f1' | 'auc' | 'loss', string>;
	pipelineSteps: string[];
	architecture: Array<{ label: string; value: string }>;
	engineeredFeatures: string[];
	currentStatus: string;
}

const research = {
	en: readJson<ResearchDocument>('src/content/research/en/oss-abandonment-bilstm.json'),
	es: readJson<ResearchDocument>('src/content/research/es/oss-abandonment-bilstm.json'),
};

describe('localized research content', () => {
	it('registers research as a schema-validated collection', () => {
		const config = readSource('src/content.config.ts');
		expect(config).toContain('const research = defineCollection');
		expect(config).toContain("base: './src/content/research'");
		expect(config).toContain('researchId: stableContentId');
		expect(config).toContain('portfolioProfile, experience, research, projects');
	});

	it('keeps stable identity and structure in locale parity', () => {
		expect(research.en.researchId).toBe(research.es.researchId);
		expect(research.en.locale).toBe('en');
		expect(research.es.locale).toBe('es');
		expect(Object.keys(research.en).sort()).toEqual(Object.keys(research.es).sort());
		expect(Object.keys(research.en.metrics).sort()).toEqual(
			Object.keys(research.es.metrics).sort()
		);
		expect(research.en.pipelineSteps).toHaveLength(research.es.pipelineSteps.length);
		expect(research.en.architecture).toHaveLength(research.es.architecture.length);
		expect(research.en.engineeredFeatures).toHaveLength(research.es.engineeredFeatures.length);
	});

	it('contains meaningful localized records', () => {
		for (const entry of Object.values(research)) {
			for (const field of [
				'label',
				'title',
				'problem',
				'hypothesis',
				'approach',
				'dataset',
				'status',
				'institution',
				'currentStatus',
			] as const) {
				expect(entry[field].trim().length, field).toBeGreaterThan(0);
			}
			expect(entry.keywords.every(value => value.trim().length > 0)).toBe(true);
			expect(entry.pipelineSteps.every(value => value.trim().length > 0)).toBe(true);
			expect(entry.engineeredFeatures.every(value => value.trim().length > 0)).toBe(true);
			expect(
				entry.architecture.every(
					item => item.label.trim().length > 0 && item.value.trim().length > 0
				)
			).toBe(true);
		}
	});

	it('loads research through the entity and granular page catalog', () => {
		const query = readSource('src/entities/research/model/queries.ts');
		const widget = readSource('src/widgets/research-content/ui/ResearchContent.astro');
		const englishRoute = readSource('src/pages/research.astro');
		const spanishRoute = readSource('src/pages/es/research.astro');

		expect(query).toContain("getEntry('research'");
		expect(query).toContain('RESEARCH_ENTRY_ID');
		expect(query).toContain('research.data.locale !== lang');
		expect(widget).toContain('getResearchContent');
		expect(widget).toContain("createScopedUiTranslator(lang, 'pages.research')");
		expect(widget).not.toContain('useTranslations');
		expect(englishRoute).toContain("'pages.research'");
		expect(spanishRoute).toContain("'pages.research'");
	});
});
