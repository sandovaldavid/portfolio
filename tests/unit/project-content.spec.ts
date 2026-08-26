import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');
const locales = ['en', 'es'] as const;
const productionIds = [
	'auctions',
	'campus-map',
	'fluentreads',
	'kioku',
	'mad-ai',
	'yukidoke',
] as const;
const developmentOnlyIds = [
	'project-detail-fixture',
	'fullstack-project-fixture',
	'frontend-project-fixture',
	'ml-ai-project-fixture',
] as const;
const allIds = [...productionIds, ...developmentOnlyIds] as const;

function projectFiles(locale: (typeof locales)[number]) {
	return readdirSync(`src/content/projects/${locale}`)
		.filter(file => file.endsWith('.mdx'))
		.sort();
}

function frontmatterScalar(source: string, key: string): string | undefined {
	const block = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
	const match = block.match(new RegExp(`^${key}:\\s*["']?([^"'\\n]+)["']?\\s*$`, 'm'));
	return match?.[1]?.trim();
}

function projectSource(locale: (typeof locales)[number], projectId: string): string {
	return readSource(`src/content/projects/${locale}/${projectId}.mdx`);
}

function metadataBlock(metadata: string, projectId: string): string {
	return metadata.match(new RegExp(`\\t'${projectId}': \\{([\\s\\S]*?)\\n\\t\\},`))?.[1] ?? '';
}

describe('localized project MDX content', () => {
	it('registers projects as an MDX-only schema-validated Astro collection', () => {
		const config = readSource('src/content.config.ts');
		expect(config).toContain("glob({ pattern: '**/*.mdx', base: './src/content/projects' })");
		expect(config).toContain('projectId: stableContentId');
		expect(config).toContain('imageAlt: nonEmptyString');
		expect(config).toContain('kicker: nonEmptyString');
		expect(config).toContain('status: projectStatus');
		expect(config).not.toContain('projectEvidence');
		expect(config).not.toContain('projectPresentation');
	});

	it('keeps exactly one MDX source per project or development fixture and locale', () => {
		for (const locale of locales) {
			const files = projectFiles(locale);
			expect(files).toEqual(allIds.map(id => `${id}.mdx`).sort());
			expect(
				readdirSync(`src/content/projects/${locale}`).filter(file => file.endsWith('.json'))
			).toEqual([]);

			for (const projectId of allIds) {
				const source = projectSource(locale, projectId);
				expect(frontmatterScalar(source, 'projectId')).toBe(projectId);
				expect(frontmatterScalar(source, 'locale')).toBe(locale);
				expect(frontmatterScalar(source, 'title')).toBeTruthy();
				expect(frontmatterScalar(source, 'description')).toBeTruthy();
				expect(frontmatterScalar(source, 'category')).toBeTruthy();
				expect(frontmatterScalar(source, 'imageAlt')).toBeTruthy();
				expect(source).toContain('kicker:');
				expect(source).toContain('lifecycle:');
				expect(source).toContain('source:');
				expect(source).toContain('demo:');
			}
		}
	});

	it('keeps English and Spanish project identities paired while allowing unique narratives', () => {
		for (const projectId of allIds) {
			const english = projectSource('en', projectId);
			const spanish = projectSource('es', projectId);
			expect(frontmatterScalar(english, 'projectId')).toBe(
				frontmatterScalar(spanish, 'projectId')
			);
			expect(english).toContain('<CaseStudySection');
			expect(spanish).toContain('<CaseStudySection');
			expect(english).toContain('<MermaidDiagram');
			expect(spanish).toContain('<MermaidDiagram');
			expect(english).not.toBe(spanish);
		}
	});

	it('keeps language-neutral URLs, repository sets, assets, ordering and technology IDs in metadata', () => {
		const metadata = readSource('src/entities/project/model/metadata.ts');
		const slugs = [...metadata.matchAll(/slug: '([^']+)'/g)].map(match => match[1]);
		const orders = [...metadata.matchAll(/order: (\d+)/g)].map(match => Number(match[1]));

		expect(slugs.sort()).toEqual([...allIds].sort());
		expect(new Set(slugs).size).toBe(allIds.length);
		expect(orders.sort((left, right) => right - left)).toEqual([
			50, 45, 40, 30, 20, 10, 4, 3, 2, 1,
		]);
		expect(metadata).toContain("docs: 'https://kioku.sandovaldavid.com'");
		expect(metadata).toContain("package: 'https://www.nuget.org/packages/kioku-mcp-server'");
		expect(metadata).toContain(
			"{ label: 'kioku', url: 'https://github.com/sandovaldavid/kioku' }"
		);
		expect(metadata).toContain(
			"{ label: 'kioku-obsidian', url: 'https://github.com/sandovaldavid/kioku-obsidian' }"
		);
		expect(metadata).toContain("link: 'https://fluentreads.vercel.app'");

		for (const locale of locales) {
			for (const projectId of productionIds) {
				expect(projectSource(locale, projectId)).not.toContain('https://');
			}
		}
	});

	it('keeps four representative Project Detail fixtures development-only', () => {
		const metadata = readSource('src/entities/project/model/metadata.ts');
		const queries = readSource('src/entities/project/model/queries.ts');

		expect(metadata).toContain('developmentOnly?: boolean');
		expect(metadata).toContain(
			'export function isProjectVisible(projectId: ProjectId, development = import.meta.env.DEV)'
		);
		expect(queries).toContain('if (!isProjectVisible(entry.data.projectId)) continue;');
		expect(queries).toContain('isProjectVisible(projectId)');

		for (const projectId of developmentOnlyIds) {
			const block = metadataBlock(metadata, projectId);
			expect(block, projectId).toContain('developmentOnly: true');
			expect(block, projectId).toContain("version: '0.0.0-dev'");
			for (const locale of locales) {
				const fixture = projectSource(locale, projectId);
				expect(fixture, `${locale}/${projectId}`).toContain('<MermaidDiagram');
			}
		}

		for (const locale of locales) {
			const mcp = projectSource(locale, 'project-detail-fixture');
			const frontend = projectSource(locale, 'frontend-project-fixture');
			const fullstack = projectSource(locale, 'fullstack-project-fixture');
			const mlAi = projectSource(locale, 'ml-ai-project-fixture');
			expect(mcp).toContain('<ProjectVideo');
			expect(mcp).toContain('<ProjectGallery');
			expect(frontend).toContain('<ProjectGallery');
			expect(fullstack.match(/<MermaidDiagram/g)?.length).toBeGreaterThanOrEqual(2);
			expect(mlAi).toContain('<ProjectGallery');
			expect(mlAi).toContain('EvidenceBlock');
		}
	});

	it('aligns MAD AI technology metadata with its public frontend repository', () => {
		const metadata = readSource('src/entities/project/model/metadata.ts');
		const madAiBlock =
			metadata.match(/'mad-ai': \{([\s\S]*?)\n\t\},\n\tfluentreads:/)?.[1] ?? '';
		expect(madAiBlock).toContain(
			"technologyIds: ['angular', 'tailwind', 'typescript', 'rxjs']"
		);
		expect(madAiBlock).not.toContain('django');
		expect(madAiBlock).not.toContain('python');
		expect(madAiBlock).not.toContain('postgresql');
	});

	it('loads list and detail data through one project entity API', () => {
		const queries = readSource('src/entities/project/model/queries.ts');
		const englishRoute = readSource('src/pages/projects/[slug].astro');
		const spanishRoute = readSource('src/pages/es/projects/[slug].astro');

		expect(queries).toContain("getCollection('projects'");
		expect(queries).toContain('getProjectDetailBySlug');
		expect(queries).toContain('Duplicate project ID');
		expect(queries).toContain('Missing project content for locale');
		for (const route of [englishRoute, spanishRoute]) {
			expect(route).toContain("import { render } from 'astro:content'");
			expect(route).toContain('await getProjectDetailBySlug(lang, slug)');
			expect(route).toContain('const { Content } = await render(entry)');
			expect(route).toContain('<Content components={projectCaseStudyComponents} />');
			expect(route).toContain('contentLayout="flush"');
			expect(route).toContain('getProjectsData');
		}
	});

	it('removes obsolete project data owners and the legacy renderer', () => {
		expect(existsSync('src/widgets/project-case-study/ui/ProjectCaseStudyLegacy.astro')).toBe(
			false
		);
		expect(existsSync('src/entities/project/model/data.ts')).toBe(false);
		expect(existsSync('src/shared/config/i18n/dictionaries/index.ts')).toBe(false);
		for (const locale of locales) {
			expect(existsSync(`src/shared/config/i18n/locales/${locale}.json`)).toBe(false);
		}
	});
});
