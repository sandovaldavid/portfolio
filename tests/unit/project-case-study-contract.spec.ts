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
		expect(shell).toContain('project.sourceAccess === \'public\'');
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

	it('keeps Mermaid lazy, strict and theme-aware with accessible fallback', () => {
		expect(mermaid).toContain("securityLevel: 'strict'");
		expect(mermaid).toContain('IntersectionObserver');
		expect(mermaid).toContain('data-mermaid-source');
		expect(mermaid).toContain('role="img"');
		expect(mermaid).toContain('var(--channel-surface-highlight)');
		expect(mermaid).toContain('var(--channel-accent-primary)');
	});

	it('resolves external resources from language-neutral metadata', () => {
		expect(resources).toContain('PROJECT_METADATA[projectId]');
		expect(resources).toContain("metadata.sourceAccess === 'public'");
		expect(resources).toContain('metadata.resources?.docs');
		expect(resources).toContain('metadata.resources?.package');
		expect(resources).toContain('metadata.resources?.related');
		expect(resources).toContain('metadata.link');
	});
});
