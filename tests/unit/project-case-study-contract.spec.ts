import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');
const shell = readSource('src/widgets/project-case-study/ui/ProjectCaseStudy.astro');
const section = readSource('src/widgets/project-case-study/ui/CaseStudySection.astro');
const components = readSource('src/widgets/project-case-study/ui/mdx-components.ts');
const mermaid = readSource('src/widgets/project-case-study/ui/MermaidDiagram.astro');
const resources = readSource('src/widgets/project-case-study/ui/ProjectResources.astro');
const video = readSource('src/widgets/project-case-study/ui/ProjectVideo.astro');
const gallery = readSource('src/widgets/project-case-study/ui/ProjectGallery.astro');
const metadata = readSource('src/entities/project/model/metadata.ts');
const config = readSource('src/content.config.ts');
const kiokuEn = readSource('src/content/projects/en/kioku.mdx');
const kiokuEs = readSource('src/content/projects/es/kioku.mdx');

describe('Project Case Study MDX contract', () => {
	it('keeps shared identity and status in frontmatter while narrative lives in MDX', () => {
		expect(config).toContain("pattern: '**/*.mdx'");
		expect(config).toContain('kicker: nonEmptyString');
		expect(config).toContain('status: projectStatus');
		expect(config).not.toContain('problem: nonEmptyString');
		expect(config).not.toContain('evidence:');
		expect(config).not.toContain('presentation:');
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
		expect(existsSync('src/widgets/project-case-study/ui/ProjectCaseStudyLegacy.astro')).toBe(false);
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
		expect(gallery).toContain("stage.dataset.zoomed");
		expect(gallery).toContain('object-contain');
		expect(gallery).not.toContain('object-cover');
	});

	it('renders controlled Mermaid authoring as a routed semantic-color SVG graph', () => {
		expect(mermaid).toContain('flowchart\\s+(LR|TD)');
		expect(mermaid).toContain('data-mermaid-state="rendered"');
		expect(mermaid).toContain('data-diagram-svg');
		expect(mermaid).toContain('data-diagram-node');
		expect(mermaid).toContain('data-diagram-edge');
		expect(mermaid).toContain('marker-end');
		expect(mermaid).toContain('data-node-tone');
		expect(mermaid).toContain("'brand', 'info', 'success', 'secondary', 'warning', 'danger'");
		expect(mermaid).toContain('var(--color-badge-brand-bg)');
		expect(mermaid).toContain('var(--color-status-success-bg)');
		expect(mermaid).toContain('const backEdges = edges.filter');
		expect(mermaid).toContain('to.level <= from.level');
		expect(mermaid).toContain('targetLevels.length > 0');
		expect(mermaid).toContain('class="mx-auto block max-w-none"');
		expect(mermaid).toContain('stroke-width="4"');
		expect(mermaid).toContain('role="img"');
		expect(mermaid).not.toContain('<ol');
		expect(mermaid).not.toContain('cdn.jsdelivr.net');
		expect(mermaid).not.toContain('IntersectionObserver');
		expect(mermaid).not.toContain('<script');
		expect(mermaid).not.toContain('Mermaid source');
		expect(kiokuEn).toContain("Client: 'brand'");
		expect(kiokuEn).toContain("Vault: 'success'");
		expect(kiokuEs).toContain("Client: 'brand'");
	});

	it('resolves zero-to-many repositories and optional resources from language-neutral metadata', () => {
		expect(metadata).toContain('repositories?: readonly ProjectRepository[]');
		expect(metadata).toContain('version?: string');
		expect(metadata).toContain("version: '3.1.2'");
		expect(metadata).toContain("{ label: 'kioku', url: 'https://github.com/sandovaldavid/kioku' }");
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
