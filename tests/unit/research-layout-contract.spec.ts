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
		expect(layout).toContain('md:grid-cols-2');
		expect(column).toContain('data-research-evidence-column');
		expect(column).toContain('flex min-w-0 flex-col');
		expect(section).toContain(
			'const sectionClasses = `research-section w-full ${variantClasses[variant]}`;'
		);
		expect(section).toContain('<header class="mb-4 flex max-w-210 flex-col gap-2">');
		expect(section).toContain(
			'class="research-prose max-w-210 text-body leading-relaxed text-content-default"'
		);
		expect(section).not.toContain('research-section w-full max-w-210');
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
