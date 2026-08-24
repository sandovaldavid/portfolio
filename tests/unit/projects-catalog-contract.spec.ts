import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');
const layout = readSource('src/app/layouts/Layout.astro');
const catalog = readSource('src/widgets/projects/ui/ProjectsCatalog.astro');
const projects = readSource('src/widgets/projects/ui/Projects.astro');
const card = readSource('src/entities/project/ui/ProjectCard.astro');
const englishRoute = readSource('src/pages/projects.astro');
const spanishRoute = readSource('src/pages/es/projects.astro');

describe('Projects Catalog composition contract', () => {
	it('lets the catalog own its responsive page spacing without changing the default page frame', () => {
		expect(layout).toContain("type ContentLayout = 'default' | 'flush'");
		expect(layout).toContain("contentLayout = 'default'");
		expect(layout).toContain("contentLayout === 'flush'");
		expect(layout).toContain("'pt-28 pb-16 w-full flex flex-col items-center'");
		expect(englishRoute).toContain('contentLayout="flush"');
		expect(spanishRoute).toContain('contentLayout="flush"');
		expect(catalog).toContain('<div class="w-full pt-18">');
	});

	it('uses open editorial intro content followed by a data-derived engineering index', () => {
		expect(catalog).not.toContain('ContentPanel');
		expect(catalog).toContain('data-projects-catalog-intro-shell');
		expect(catalog).toContain('data-projects-catalog-snapshot');
		expect(catalog).toContain('data-projects-top-technologies');
		expect(catalog).toContain('PROJECT_METADATA[project.projectId].developmentOnly');
		expect(catalog).toContain("project.sourceAccess !== 'private'");
		expect(catalog).toContain("project.lifecycle === 'active'");
		expect(catalog).toContain('technologyCounts');
		expect(catalog).toContain('max-w-320');
		expect(catalog).toContain('text-page-title-mobile text-content-strong md:text-page-title');
		expect(catalog).toContain('<div class="lg:pt-10">');
		expect(catalog).toContain('text-body text-content-default');
	});

	it('anchors desktop catalog cards to opposite shell edges while preserving smaller layouts', () => {
		expect(projects).toContain("layout?: 'home' | 'catalog'");
		expect(projects).toContain("layout = 'home'");
		expect(projects).toContain("const isCatalog = layout === 'catalog'");
		expect(projects).toContain('data-projects-layout={layout}');
		expect(projects).toContain('md:grid-cols-[repeat(2,minmax(0,369px))]');
		expect(projects).toContain('lg:grid-cols-[repeat(2,minmax(0,592px))]');
		expect(projects).toContain('lg:justify-between');
		expect(projects).toContain('lg:gap-x-0');
		expect(projects).toContain('lg:grid-cols-[repeat(2,minmax(0,520px))]');
		expect(projects).toContain("variant={isCatalog ? 'catalog' : 'secondary'}");
		expect(projects).toContain('lg:max-w-148');
		expect(projects).toContain('gap-y-6');
		expect(projects).toContain('md:gap-x-8');
		expect(projects).toContain('lg:gap-y-8');
		expect(projects).toContain('lg:gap-20');
		expect(projects).not.toContain('centered?: boolean');
		expect(catalog).toContain('max-w-85 md:max-w-192.5 lg:max-w-320');
		expect(catalog).toContain('<Projects showAll={true} layout="catalog" />');
	});

	it('gives catalog cards a distinct desktop composition and balanced footer actions', () => {
		expect(card).toContain("variant?: 'primary' | 'secondary' | 'catalog'");
		expect(card).toContain("const isCatalog = variant === 'catalog'");
		expect(card).toContain('tags.slice(0, isCatalog ? 4 : 3)');
		expect(card).toContain("github?.replace(/\\/$/, '').split('/').filter(Boolean).at(-1)");
		expect(card).toContain("isCatalog ? 'lg:max-w-148' : 'lg:max-w-130'");
		expect(card).toContain('items-end justify-between gap-2');
		expect(card).toContain('data-project-card-repository');
		expect(card).toContain('<GitHubIcon');
		expect(card).toContain('{repositoryName}');
	});

	it('keeps catalog styles semantic and free of inline presentation', () => {
		const rawPaletteUtility =
			/\b(?:bg|text|border|ring|from|via|to)-(?:white|black|primary-\d+|neutral-\d+|success-\d+|warning-\d+|error-\d+)\b/g;
		for (const source of [catalog, projects, card]) {
			expect(source.match(rawPaletteUtility) ?? []).toEqual([]);
			expect(source).not.toMatch(/\sstyle\s*=/i);
		}
	});
});
