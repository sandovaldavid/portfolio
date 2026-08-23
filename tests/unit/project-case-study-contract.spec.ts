import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');
const caseStudy = readSource('src/widgets/project-case-study/ui/ProjectCaseStudy.astro');
const legacy = readSource('src/widgets/project-case-study/ui/ProjectCaseStudyLegacy.astro');
const types = readSource('src/entities/project/model/types.ts');
const queries = readSource('src/entities/project/model/queries.ts');
const config = readSource('src/content.config.ts');
const englishKioku = readSource('src/content/projects/en/kioku.json');
const spanishKioku = readSource('src/content/projects/es/kioku.json');
const englishRoute = readSource('src/pages/projects/[slug].astro');
const spanishRoute = readSource('src/pages/es/projects/[slug].astro');

describe('Project Case Study v2 contract', () => {
	it('keeps concise presentation separate from detailed evidence', () => {
		expect(types).toContain('export interface CaseStudyPresentation');
		expect(types).toContain('presentation?: CaseStudyPresentation');
		expect(types).toContain('evidence?: CaseStudyEvidence');
		expect(config).toContain('presentation: projectPresentation.optional()');
		expect(queries).toContain('function toPresentation');
		expect(queries).toContain('...(presentation ? { presentation } : {})');
	});

	it('uses Figma-owned localized Kioku presentation copy without deleting detailed content', () => {
		expect(englishKioku).toContain('"kicker": "PROJECT CASE STUDY · BACKEND ENGINEERING"');
		expect(spanishKioku).toContain('"kicker": "CASO DE ESTUDIO · INGENIERÍA BACKEND"');
		expect(englishKioku).toContain('"title": "SESSION CONTEXT IS NOT DURABLE"');
		expect(spanishKioku).toContain('"title": "EL CONTEXTO DE SESIÓN NO ES DURABLE"');
		expect(englishKioku).toContain('"evidence": {');
		expect(spanishKioku).toContain('"evidence": {');
		expect(englishKioku).toContain('"implemented": [');
		expect(spanishKioku).toContain('"implemented": [');
	});

	it('renders the clean Figma hierarchy and keeps source evidence directly reachable', () => {
		expect(caseStudy).toContain('data-project-case-study="v2"');
		expect(caseStudy).toContain('data-case-study-hero-shell');
		expect(caseStudy).toContain('data-case-study-narrative-shell');
		expect(caseStudy).toContain('data-case-study-evidence-shell');
		expect(caseStudy).toContain('data-case-study-learnings-shell');
		expect(caseStudy).toContain('lg:grid-cols-[minmax(0,640px)_minmax(0,560px)]');
		expect(caseStudy).toContain('lg:grid-cols-2 lg:gap-16');
		expect(caseStudy).toContain('bg-channel-surface-highlight');
		expect(caseStudy).toContain("project.sourceAccess === 'public'");
		expect(caseStudy).toContain('href={project.github}');
		expect(caseStudy).not.toContain("from 'astro:assets'");
		expect(caseStudy).not.toContain('TechPill');
		expect(caseStudy).not.toContain('ContentPanel');
		expect(caseStudy).not.toContain('LinkButton');
	});

	it('keeps unreviewed case studies on an explicit temporary migration fallback', () => {
		expect(caseStudy).toContain("import ProjectCaseStudyLegacy from './ProjectCaseStudyLegacy.astro'");
		expect(caseStudy).toContain('<ProjectCaseStudyLegacy {project} {backLink} {lang} />');
		expect(legacy).toContain('Transitional renderer for case studies');
		expect(legacy).toContain('Delete this file once every project');
		for (const route of [englishRoute, spanishRoute]) {
			expect(route).toContain("project.caseStudy.presentation ? 'flush' : 'default'");
		}
	});
});