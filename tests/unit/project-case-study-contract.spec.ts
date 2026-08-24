import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');
const shell = readSource('src/widgets/project-case-study/ui/ProjectCaseStudy.astro');
const components = readSource('src/widgets/project-case-study/ui/mdx-components.ts');
const mermaid = readSource('src/widgets/project-case-study/ui/MermaidDiagram.astro');
const resources = readSource('src/widgets/project-case-study/ui/ProjectResources.astro');
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

	it('renders one reusable shell without project-specific narrative assumptions', () => {
		expect(shell).toContain('data-project-case-study="mdx"');
		expect(shell).toContain('data-case-study-hero-shell');
		expect(shell).toContain('<slot />');
		expect(shell).toContain('project.caseStudy.kicker');
		expect(shell).toContain("project.sourceAccess !== 'private'");
		expect(shell).not.toContain('ProjectCaseStudyLegacy');
		expect(shell).not.toContain('ContentPanel');
		expect(shell).not.toContain('TechPill');
		expect(existsSync('src/widgets/project-case-study/ui/ProjectCaseStudyLegacy.astro')).toBe(false);
	});

	it('exposes only approved design-system-aware MDX components', () => {
		for (const component of [
			'CaseStudyCard',
			'CaseStudyGrid',
			'CaseStudySection',
			'EvidenceBlock',
			'MermaidDiagram',
			'ProjectResources',
		]) {
			expect(components).toContain(component);
		}
	});

	it('renders a controlled Mermaid flow subset at build time without external runtime code', () => {
		expect(mermaid).toContain('flowchart\\s+(LR|TD)');
		expect(mermaid).toContain('data-mermaid-state="rendered"');
		expect(mermaid).toContain('data-diagram-nodes');
		expect(mermaid).toContain('data-diagram-edges');
		expect(mermaid).toContain('role="img"');
		expect(mermaid).toContain('Mermaid source');
		expect(mermaid).not.toContain('cdn.jsdelivr.net');
		expect(mermaid).not.toContain('IntersectionObserver');
		expect(mermaid).not.toContain('<script');
	});

	it('resolves external resources from language-neutral metadata', () => {
		expect(resources).toContain('PROJECT_METADATA[projectId]');
		expect(resources).toContain("metadata.sourceAccess !== 'private'");
		expect(resources).toContain('metadata.resources?.docs');
		expect(resources).toContain('metadata.resources?.package');
		expect(resources).toContain('metadata.resources?.related');
		expect(resources).toContain('metadata.link');
	});
});
