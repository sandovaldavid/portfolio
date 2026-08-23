import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');
const layout = readSource('src/app/layouts/Layout.astro');
const catalog = readSource('src/widgets/projects/ui/ProjectsCatalog.astro');
const projects = readSource('src/widgets/projects/ui/Projects.astro');
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

	it('uses the current Figma intro as open editorial content instead of a legacy panel', () => {
		expect(catalog).not.toContain('ContentPanel');
		expect(catalog).toContain('data-projects-catalog-intro-shell');
		expect(catalog).toContain('max-w-320');
		expect(catalog).toContain('px-5 py-8 md:px-8 md:py-10 lg:px-20 lg:py-12');
		expect(catalog).toContain('text-page-title-mobile text-content-strong md:text-page-title');
		expect(catalog).toContain('text-body text-content-default');
	});

	it('gives the catalog an explicit two-column grid while preserving the Home layout', () => {
		expect(projects).toContain("layout?: 'home' | 'catalog'");
		expect(projects).toContain("layout = 'home'");
		expect(projects).toContain("const isCatalog = layout === 'catalog'");
		expect(projects).toContain('data-projects-layout={layout}');
		expect(projects).toContain('md:grid-cols-[repeat(2,minmax(0,369px))]');
		expect(projects).toContain('lg:grid-cols-[repeat(2,minmax(0,520px))]');
		expect(projects).toContain('gap-y-6');
		expect(projects).toContain('md:gap-x-8');
		expect(projects).toContain('lg:gap-20');
		expect(projects).not.toContain('centered?: boolean');
		expect(catalog).toContain('<Projects showAll={true} layout="catalog" />');
	});
});
