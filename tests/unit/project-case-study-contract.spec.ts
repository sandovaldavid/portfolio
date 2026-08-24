import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');
const shell = readSource('src/widgets/project-case-study/ui/ProjectCaseStudy.astro');
const components = readSource('src/widgets/project-case-study/ui/mdx-components.ts');
const mermaid = readSource('src/widgets/project-case-study/ui/MermaidDiagram.astro');
const resources = readSource('src/widgets/project-case-study/ui/ProjectResources.astro');
const video = readSource('src/widgets/project-case-study/ui/ProjectVideo.astro');
const gallery = readSource('src/widgets/project-case-study/ui/ProjectGallery.astro');
const metadata = readSource('src/entities/project/model/metadata.ts');
const config = readSource('src/content.config.ts');

describe('Project Case Study MDX contract', () => {
	it('keeps shared identity and status in frontmatter while narrative lives in MDX', () => {
		expect(config).toContain("pattern: '**/*.mdx'");
		expect(config).toContain('kicker: nonEmptyString');
		expect(config).toContain('status: projectStatus');
		expect(config).not.toContain('problem: nonEmptyString');
		expect(config).not.toContain('evidence:');
		expect(config).not.toContain('presentation:');
	});

	it('renders one reusable shell with a shared project action bar', () => {
		expect(shell).toContain('data-project-case-study="mdx"');
		expect(shell).toContain('data-case-study-hero-shell');
		expect(shell).toContain('<ProjectResources projectId={project.projectId} />');
		expect(shell).toContain('<slot />');
		expect(shell).toContain('project.caseStudy.kicker');
		expect(shell).toContain("project.sourceAccess !== 'private'");
		expect(shell).not.toContain('ProjectCaseStudyLegacy');
		expect(shell).not.toContain('ContentPanel');
		expect(shell).not.toContain('TechPill');
		expect(existsSync('src/widgets/project-case-study/ui/ProjectCaseStudyLegacy.astro')).toBe(false);
	});

	it('exposes design-system-aware MDX media primitives without fixing project structure', () => {
		for (const component of [
			'CaseStudyCard',
			'CaseStudyGrid',
			'CaseStudySection',
			'EvidenceBlock',
			'MermaidDiagram',
			'ProjectGallery',
			'ProjectResources',
			'ProjectVideo',
		]) {
			expect(components).toContain(component);
		}
		expect(video).toContain('data-project-video');
		expect(video).toContain('<video');
		expect(video).toContain('<iframe');
		expect(gallery).toContain('data-project-gallery');
		expect(gallery).toContain('data-gallery-dialog');
		expect(gallery).toContain('dialog.showModal()');
		expect(gallery).toContain("stage.dataset.zoomed");
	});

	it('renders controlled Mermaid flow authoring as a real semantic-color SVG graph', () => {
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
		expect(mermaid).toContain('role="img"');
		expect(mermaid).not.toContain('<ol');
		expect(mermaid).not.toContain('cdn.jsdelivr.net');
		expect(mermaid).not.toContain('IntersectionObserver');
		expect(mermaid).not.toContain('<script');
		expect(mermaid).not.toContain('Mermaid source');
	});

	it('resolves zero-to-many repositories and optional resources from language-neutral metadata', () => {
		expect(metadata).toContain('repositories?: readonly ProjectRepository[]');
		expect(metadata).toContain("{ label: 'kioku', url: 'https://github.com/sandovaldavid/kioku' }");
		expect(metadata).toContain("{ label: 'kioku-obsidian', url: 'https://github.com/sandovaldavid/kioku-obsidian' }");
		expect(resources).toContain('PROJECT_METADATA[projectId]');
		expect(resources).toContain("metadata.sourceAccess === 'private'");
		expect(resources).toContain('metadata.repositories?.length');
		expect(resources).toContain('metadata.resources?.docs');
		expect(resources).toContain('metadata.resources?.package');
		expect(resources).toContain('metadata.link');
		expect(resources).toContain('data-project-share');
		expect(resources).toContain('navigator.share');
		expect(resources).toContain('navigator.clipboard.writeText');
	});
});
