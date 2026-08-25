import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');

describe('Research evidence composition contract', () => {
	it('keeps narrative reading measure while widening structured evidence', () => {
		const components = readSource('src/widgets/research-page/ui/mdx-components.ts');
		const layout = readSource('src/widgets/research-page/ui/ResearchEvidenceLayout.astro');
		const column = readSource('src/widgets/research-page/ui/ResearchEvidenceColumn.astro');
		const section = readSource('src/widgets/research-page/ui/ResearchSection.astro');

		expect(components).toContain('ResearchEvidenceLayout');
		expect(components).toContain('ResearchEvidenceColumn');
		expect(layout).toContain('data-research-evidence-layout');
		expect(layout).toContain('lg:grid-cols-2');
		expect(layout).not.toContain('md:grid-cols-2');
		expect(column).toContain('data-research-evidence-column');
		expect(column).toContain('flex min-w-0 flex-col');
		expect(section).toContain(
			'const sectionClasses = `research-section w-full ${variantClasses[variant]}`;'
		);
		expect(section).toContain(
			"const contentMeasure = variant === 'narrative' ? 'max-w-280' : 'max-w-210';"
		);
		expect(section).toContain("class:list={['mb-4 flex flex-col gap-2', contentMeasure]}");
		expect(section).toContain(
			"class:list={['research-prose text-body leading-relaxed text-content-default', contentMeasure]}"
		);
		expect(section).toContain('@media (min-width: 48rem)');
		expect(section).toContain('grid-template-columns: repeat(2, minmax(0, 1fr));');
		expect(section).not.toContain('@media (min-width: 64rem)');
		expect(section).not.toContain('research-section w-full max-w-210');
	});

	it('keeps Home and Research detail on the same semantic research color language', () => {
		const home = readSource('src/widgets/research/ui/Research.astro');
		const detail = readSource('src/widgets/research-page/ui/ResearchPage.astro');

		expect(home).toContain('<Badge variant="info" size="sm">');
		expect(detail).toContain('<Badge variant="info" size="md">');
		expect(detail).not.toContain('<Badge variant="success"');
		expect(home).toContain('text-editorial-label text-channel-accent-primary');
		expect(detail).toContain(
			'text-editorial-label-compact uppercase text-channel-accent-primary md:text-editorial-label'
		);
	});

	it('composes both localized research entries into evidence columns without changing their claims', () => {
		for (const locale of ['en', 'es'] as const) {
			const source = readSource(`src/content/research/${locale}/oss-abandonment-bilstm.mdx`);

			expect(source).toContain('<ResearchEvidenceLayout>');
			expect(source.match(/<ResearchEvidenceColumn>/g) ?? []).toHaveLength(2);
			expect(source).toContain('variant="feature-grid"');
			expect(source).toContain('variant="technical-list"');
			expect(source).toContain('variant="status"');
		}

		expect(readSource('src/content/research/en/oss-abandonment-bilstm.mdx')).toContain(
			'Results will be published upon thesis completion.'
		);
		expect(readSource('src/content/research/es/oss-abandonment-bilstm.mdx')).toContain(
			'Los resultados se publicarán al completar la tesis.'
		);
	});

	it('uses open technical rows and a full-width closing keyword band instead of returning to cards', () => {
		const section = readSource('src/widgets/research-page/ui/ResearchSection.astro');
		const shell = readSource('src/widgets/research-page/ui/ResearchPage.astro');

		expect(section).toContain('data-research-variant={variant}');
		expect(section).toContain('research-feature-grid');
		expect(section).toContain('research-technical-list');
		expect(section).toContain('border-l-4 border-channel-accent-primary');
		expect(section).not.toContain('bg-channel-surface-default');
		expect(section).not.toContain('shadow-retro');

		expect(shell).toContain('data-research-keywords-band');
		expect(shell).toContain('w-screen');
		expect(shell).toContain('bg-channel-surface-highlight');
	});
});
