import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (filePath: string): string => readFileSync(filePath, 'utf8');
const readJson = <T>(filePath: string): T => JSON.parse(readSource(filePath)) as T;
const locales = ['en', 'es'] as const;
const researchId = 'oss-abandonment-bilstm';

function researchSource(locale: (typeof locales)[number]): string {
	return readSource(`src/content/research/${locale}/${researchId}.mdx`);
}

function frontmatterScalar(source: string, key: string): string | undefined {
	const block = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
	const match = block.match(new RegExp(`^${key}:\\s*["']?([^"'\\n]+)["']?\\s*$`, 'm'));
	return match?.[1]?.trim();
}

describe('localized research MDX content', () => {
	it('registers research as an MDX-only collection with stable identity and preview metadata', () => {
		const config = readSource('src/content.config.ts');
		const schema =
			config.match(/const research = defineCollection\(\{([\s\S]*?)\n\}\);/)?.[1] ?? '';

		expect(schema).toContain("pattern: '**/*.mdx'");
		expect(schema).toContain('researchId: stableContentId');
		expect(schema).toContain("status: z.enum(['in-progress'])");
		expect(schema).toContain('institution: nonEmptyString');
		expect(schema).toContain('featuredSignals: z.array(nonEmptyString).min(1)');
		expect(schema).toContain('keywords: z.array(nonEmptyString).min(1)');
		for (const rigidNarrativeField of [
			'problem:',
			'hypothesis:',
			'approach:',
			'dataset:',
			'metrics:',
			'pipelineSteps:',
			'architecture:',
			'engineeredFeatures:',
			'currentStatus:',
		]) {
			expect(schema).not.toContain(rigidNarrativeField);
		}
	});

	it('keeps exactly one localized MDX source and no legacy research JSON', () => {
		for (const locale of locales) {
			const files = readdirSync(`src/content/research/${locale}`).sort();
			expect(files.filter(file => file.endsWith('.mdx'))).toEqual([`${researchId}.mdx`]);
			expect(files.filter(file => file.endsWith('.json'))).toEqual([]);

			const source = researchSource(locale);
			expect(frontmatterScalar(source, 'researchId')).toBe(researchId);
			expect(frontmatterScalar(source, 'locale')).toBe(locale);
			expect(frontmatterScalar(source, 'title')).toBeTruthy();
			expect(frontmatterScalar(source, 'label')).toBeTruthy();
			expect(frontmatterScalar(source, 'institution')).toBeTruthy();
			expect(frontmatterScalar(source, 'status')).toBe('in-progress');
			expect(source).toContain('featuredSignals:');
			expect(source).toContain('keywords:');
		}
	});

	it('keeps scientific narrative flexible while preserving current published claims in both locales', () => {
		const english = researchSource('en');
		const spanish = researchSource('es');

		for (const source of [english, spanish]) {
			expect(source).toContain('<ResearchSection');
			expect(source).toContain('<MermaidDiagram');
			expect(source).toContain('<EvaluationCriteria');
			expect(source).not.toContain('<ResearchMetrics');
			expect(source).not.toContain('<ExperimentBlock');
			expect(source).not.toContain('<ResultTable');
		}
		expect(english).toContain('Results will be published upon thesis completion.');
		expect(spanish).toContain('Los resultados se publicarán al completar la tesis.');
		expect(english).toContain(
			'Classification accuracy vs. Logistic Regression & Random Forest baselines'
		);
		expect(spanish).toContain(
			'Accuracy de clasificación vs. baselines Logistic Regression y Random Forest'
		);
		expect(english).toContain('title="Evaluation criteria"');
		expect(spanish).toContain('title="Criterios de evaluación"');
	});

	it('loads validated entries for MDX routes while Home can keep reading frontmatter data', () => {
		const query = readSource('src/entities/research/model/queries.ts');
		const englishRoute = readSource('src/pages/research.astro');
		const spanishRoute = readSource('src/pages/es/research.astro');
		const components = readSource('src/widgets/research-page/ui/mdx-components.ts');
		const shell = readSource('src/widgets/research-page/ui/ResearchPage.astro');

		expect(query).toContain('export async function getResearchEntry');
		expect(query).toContain("getEntry('research'");
		expect(query).toContain('return (await getResearchEntry(lang)).data');
		for (const route of [englishRoute, spanishRoute]) {
			expect(route).toContain("import { render } from 'astro:content'");
			expect(route).toContain('getResearchEntry');
			expect(route).toContain('const { Content } = await render(entry)');
			expect(route).toContain('<ResearchPage {research}>');
			expect(route).toContain('<Content components={researchMdxComponents} />');
		}
		expect(components).toContain("from '@shared/ui/rich-content'");
		expect(components).toContain('EvaluationCriteria');
		expect(components).toContain('ResearchSection');
		expect(shell).toContain('data-research-page="mdx"');
		expect(shell).toContain('<slot />');
		expect(existsSync('src/widgets/research-content/ui/ResearchContent.astro')).toBe(false);
	});

	it('keeps Research editorial instead of promoting narrative blocks into cards', () => {
		const shell = readSource('src/widgets/research-page/ui/ResearchPage.astro');
		const section = readSource('src/widgets/research-page/ui/ResearchSection.astro');
		const criteria = readSource('src/widgets/research-page/ui/EvaluationCriteria.astro');

		expect(shell).toContain(
			'class="max-w-280 text-page-title-mobile text-content-strong md:text-page-title"'
		);
		expect(shell).not.toContain('lg:text-hero-display');

		expect(section).toContain('border-b border-edge-subtle');
		expect(section).not.toContain('border-2 border-edge-strong');
		expect(section).not.toContain('bg-channel-surface-default');
		expect(section).not.toContain('shadow-retro');
		expect(section).not.toContain('background: var(--color-badge-brand-bg)');

		expect(criteria).toContain('divide-y divide-edge-subtle border-y border-edge-subtle');
		expect(criteria).not.toContain('sm:grid-cols-2');
		expect(criteria).not.toContain('bg-channel-surface-default');
		expect(criteria).not.toContain('shadow-retro-sm');
	});

	it('uses frontmatter preview signals without changing the established Home composition', () => {
		const homeResearch = readSource('src/widgets/research/ui/Research.astro');
		const englishSection = readJson<Record<string, unknown>>(
			'src/shared/config/i18n/locales/en/sections/research.json'
		);
		const spanishSection = readJson<Record<string, unknown>>(
			'src/shared/config/i18n/locales/es/sections/research.json'
		);

		expect(homeResearch).toContain('getResearchContent');
		expect(homeResearch).toContain('const modeledSignals = research.featuredSignals;');
		expect(homeResearch).not.toContain('research.engineeredFeatures');
		expect(homeResearch).toContain('lg:grid-cols-[minmax(0,672px)_minmax(0,544px)]');
		expect(homeResearch).toContain('data-research-home-main');
		expect(homeResearch).toContain('data-research-home-panel');
		expect(homeResearch).toContain('data-research-pipeline-step');
		expect(homeResearch).toContain('data-research-signal');
		expect(homeResearch).toContain('data-research-home-footer');
		expect(homeResearch).toContain('md:grid-cols-[minmax(0,1fr)_minmax(280px,420px)]');
		expect(homeResearch.indexOf('data-research-home-footer')).toBeGreaterThan(
			homeResearch.indexOf('</aside>')
		);
		expect(homeResearch).toContain('data-research-summary');
		expect(homeResearch).toContain('data-research-pipeline-label');
		expect(homeResearch).toContain('data-research-signal-label');
		expect(homeResearch).toContain('data-research-tech-stack');
		expect(homeResearch).toContain('data-research-methodology');
		expect(homeResearch).toContain('border-t border-edge-subtle pt-4');
		expect(homeResearch).not.toContain('border-t-2 border-edge-strong pt-5');
		expect(homeResearch).toContain('size="md" variant="stack"');
		expect(homeResearch).toContain(
			"import PythonIcon from '@assets/technologies/Python.astro'"
		);
		expect(homeResearch).toContain(
			"import GitHubIcon from '@assets/technologies/GitHub.astro'"
		);
		expect(homeResearch).toContain('icon={tag.icon}');
		expect(homeResearch).not.toContain('hover:-translate-y-0.5');
		expect(homeResearch).not.toContain('hover:shadow-retro-3xl');
		expect(englishSection.signalsLabel).toBe('SIGNALS MODELED');
		expect(spanishSection.signalsLabel).toBe('SEÑALES MODELADAS');
		expect(Object.keys(englishSection).sort()).toEqual(Object.keys(spanishSection).sort());
	});
});
