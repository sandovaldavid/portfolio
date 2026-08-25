import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');
const shell = readSource('src/widgets/project-case-study/ui/ProjectCaseStudy.astro');
const section = readSource('src/widgets/project-case-study/ui/CaseStudySection.astro');
const components = readSource('src/widgets/project-case-study/ui/mdx-components.ts');
const mermaid = readSource('src/widgets/project-case-study/ui/MermaidDiagram.astro');
const diagramAdapter = readSource('src/widgets/project-case-study/model/diagram.ts');
const resources = readSource('src/widgets/project-case-study/ui/ProjectResources.astro');
const video = readSource('src/widgets/project-case-study/ui/ProjectVideo.astro');
const gallery = readSource('src/widgets/project-case-study/ui/ProjectGallery.astro');
const metadata = readSource('src/entities/project/model/metadata.ts');
const packageJson = readSource('package.json');
const config = readSource('src/content.config.ts');
const projectsSchema =
	config.match(/const projects = defineCollection\(\{([\s\S]*?)\n\}\);/)?.[1] ?? '';
const kiokuEn = readSource('src/content/projects/en/kioku.mdx');
const kiokuEs = readSource('src/content/projects/es/kioku.mdx');

describe('Project Case Study MDX contract', () => {
	it('keeps shared identity and status in project frontmatter while narrative lives in MDX', () => {
		expect(projectsSchema).toContain("pattern: '**/*.mdx'");
		expect(projectsSchema).toContain('kicker: nonEmptyString');
		expect(projectsSchema).toContain('status: projectStatus');
		expect(projectsSchema).not.toContain('problem: nonEmptyString');
		expect(projectsSchema).not.toContain('evidence:');
		expect(projectsSchema).not.toContain('presentation:');
	});

	it('renders one presentation-only shell with concise informational status badges and a shared action bar', () => {
		expect(shell).toContain('data-project-case-study="mdx"');
		expect(shell).toContain('data-case-study-hero-shell');
		expect(shell).toContain('<ProjectResources projectId={project.projectId} />');
		expect(shell).toContain('<slot />');
		expect(shell).toContain('project.caseStudy.kicker');
		expect(shell).toContain("tProjects('lifecycle.active')");
		expect(shell).toContain("tPage('sourcePublic')");
		expect(shell).toContain('project.version');
		expect(shell).not.toContain('status.demo');
		expect(shell).not.toContain('project.github');
		expect(shell).not.toContain('project.link');
		expect(shell).not.toContain('ProjectCaseStudyLegacy');
		expect(shell).not.toContain('ContentPanel');
		expect(shell).not.toContain('TechPill');
		expect(existsSync('src/widgets/project-case-study/ui/ProjectCaseStudyLegacy.astro')).toBe(
			false
		);
	});

	it('anchors reading-width sections to the same left grid instead of centering them independently', () => {
		expect(section).toContain('mx-auto w-full max-w-320');
		expect(section).toContain("width === 'reading' ? 'max-w-210' : 'w-full'");
		expect(section).toContain('data-case-study-section-content');
		expect(section).not.toContain("width === 'reading' ? 'max-w-210' : 'max-w-320'");
	});

	it('keeps project-specific composition in MDX while resources remain shell-owned', () => {
		for (const component of [
			'CaseStudyCard',
			'CaseStudyGrid',
			'CaseStudySection',
			'EvidenceBlock',
			'MermaidDiagram',
			'ProjectGallery',
			'ProjectVideo',
		]) {
			expect(components).toContain(component);
		}
		expect(components).not.toContain('ProjectResources');
		expect(kiokuEn).not.toContain('<ProjectResources');
		expect(kiokuEs).not.toContain('<ProjectResources');
		expect(video).toContain('data-project-video');
		expect(video).toContain('<video');
		expect(video).toContain('<iframe');
		expect(gallery).toContain('data-project-gallery');
		expect(gallery).toContain('data-gallery-dialog');
		expect(gallery).toContain('dialog.showModal()');
		expect(gallery).toContain('stage.dataset.zoomed');
		expect(gallery).toContain('object-contain');
		expect(gallery).not.toContain('object-cover');
	});

	it('delegates Mermaid parsing and layout while preserving the Portfolio presentation contract', () => {
		expect(packageJson).toContain('"mermaid": "11.16.1"');
		expect(mermaid).toContain("import('mermaid')");
		expect(mermaid).toContain("securityLevel: 'strict'");
		expect(mermaid).toContain("theme: 'base'");
		expect(mermaid).toContain('htmlLabels: false');
		expect(mermaid.indexOf('htmlLabels: false')).toBeLessThan(mermaid.indexOf('flowchart: {'));
		expect(mermaid).toContain('document.fonts.ready');
		expect(mermaid).toContain('IntersectionObserver');
		expect(mermaid).toContain("rootMargin: '600px 0px'");
		expect(mermaid).toContain('initializeMermaidHosts');
		expect(mermaid).toContain("'astro:page-load'");
		expect(mermaid).toContain('data-mermaid-state="pending"');
		expect(mermaid).toContain('data-mermaid-fallback');
		expect(mermaid).toContain('data-diagram-density="balanced"');
		expect(mermaid).toContain('data-diagram-svg');
		expect(mermaid).toContain('portfolio-tone-brand');
		expect(mermaid).toContain('portfolio-tone-success');
		expect(mermaid).toContain('var(--color-badge-brand-bg)');
		expect(mermaid).toContain('var(--color-status-success-bg)');
		expect(mermaid).toContain('diagram-scroll');
		expect(mermaid).toContain('scrollbar-width: none');
		expect(mermaid).toContain('touch-action: pan-x pan-y');
		expect(mermaid).not.toContain('cdn.jsdelivr.net');
		expect(mermaid).not.toContain('const nodeWidth');
		expect(mermaid).not.toContain('const nodeHeight');
		expect(mermaid).not.toContain('const backEdges');
		expect(mermaid).not.toContain('const edgePath');
		expect(mermaid).not.toContain('<svg');

		expect(diagramAdapter).toContain('normalizeMermaidAuthoring');
		expect(diagramAdapter).toContain('prepareMermaidChart');
		expect(diagramAdapter).toContain('accTitle:');
		expect(diagramAdapter).toContain('accDescr:');
		expect(diagramAdapter).toContain('portfolio-tone-${tone}');
		expect(diagramAdapter).not.toContain('nodeWidth');
		expect(diagramAdapter).not.toContain('backEdge');
		expect(kiokuEn).toContain("Client: 'brand'");
		expect(kiokuEn).toContain("Vault: 'success'");
		expect(kiokuEs).toContain("Client: 'brand'");
	});

	it('resolves zero-to-many repositories and optional resources from language-neutral metadata', () => {
		expect(metadata).toContain('repositories?: readonly ProjectRepository[]');
		expect(metadata).toContain('version?: string');
		expect(metadata).toContain("version: '3.1.2'");
		expect(metadata).toContain(
			"{ label: 'kioku', url: 'https://github.com/sandovaldavid/kioku' }"
		);
		expect(metadata).toContain(
			"{ label: 'kioku-obsidian', url: 'https://github.com/sandovaldavid/kioku-obsidian' }"
		);
		expect(resources).toContain('PROJECT_METADATA[projectId]');
		expect(resources).toContain("metadata.sourceAccess === 'private'");
		expect(resources).toContain('metadata.repositories?.length');
		expect(resources).toContain('metadata.resources?.docs');
		expect(resources).toContain('metadata.resources?.package');
		expect(resources).toContain('metadata.link');
		expect(resources).toContain('data-resource-tone="info"');
		expect(resources).toContain('data-resource-tone="brand"');
		expect(resources).toContain('data-resource-tone="success"');
		expect(resources).toContain('data-resource-tone="secondary"');
		expect(resources).toContain('data-project-share');
		expect(resources).toContain('swapShareText');
		expect(resources).toContain("data-share-motion='out'");
		expect(resources).toContain('navigator.share');
		expect(resources).toContain('navigator.clipboard.writeText');
	});
});
