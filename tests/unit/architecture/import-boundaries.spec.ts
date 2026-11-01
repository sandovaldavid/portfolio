import { describe, expect, it } from 'vitest';
import { extractImportSpecifiers, validateImport } from '@scripts/architecture-rules.mjs';

const validate = (importer: string, specifier: string): string[] =>
	validateImport({ importer, specifier, rootDir: process.cwd() });

describe('architecture import boundaries', () => {
	it('rejects upward imports', () => {
		expect(validate('src/entities/project/model/data.ts', '@features/theme-toggle')).toContain(
			'entities cannot import from the higher features layer.'
		);
	});

	it('rejects same-layer slice imports', () => {
		expect(validate('src/widgets/hero/ui/Hero.astro', '@widgets/footer')).toContain(
			'Same-layer widgets imports are forbidden; extract shared behavior to a lower layer.'
		);
	});

	it('rejects deep imports that bypass a slice public API', () => {
		expect(validate('src/pages/projects.astro', '@entities/project/model/data')).toContain(
			'Deep imports into entities are forbidden; import from @entities/<slice>.'
		);
	});

	it('rejects catch-all and retired aliases', () => {
		expect(validate('src/pages/index.astro', '@/widgets/hero')).toContain(
			'The catch-all @ alias is forbidden; use a semantic layer alias.'
		);
		expect(validate('src/pages/index.astro', '@components/Hero.astro')).toContain(
			'The @components alias is retired and must not be used.'
		);
	});

	it('rejects relative imports that cross layers or peer slices', () => {
		expect(validate('src/widgets/hero/ui/Hero.astro', '../../../shared/ui')).toContain(
			'Relative imports cannot cross architecture layers; use a semantic alias.'
		);
		expect(validate('src/entities/project/model/data.ts', '../../badge')).toContain(
			'Relative imports cannot cross entities slices; use a lower-layer abstraction.'
		);
	});

	it('allows the supported downward dependency flow', () => {
		expect(validate('src/pages/index.astro', '@app/layouts/Layout.astro')).toEqual([]);
		expect(validate('src/app/layouts/Layout.astro', '@widgets/header')).toEqual([]);
		expect(validate('src/widgets/header/ui/Header.astro', '@features/theme-toggle')).toEqual(
			[]
		);
		expect(validate('src/entities/project/model/data.ts', '@shared/config/technology')).toEqual(
			[]
		);
		expect(validate('src/entities/project/model/data.ts', './types')).toEqual([]);
	});

	it('extracts static, exported and dynamic imports from Astro frontmatter', () => {
		const source = `---
import { Hero } from '@widgets/hero';
export type { Project } from '@entities/project';
const modulePromise = import('@shared/lib/i18n');
---
<div />`;

		expect(extractImportSpecifiers(source, 'src/pages/index.astro')).toEqual([
			{ specifier: '@widgets/hero', line: 2 },
			{ specifier: '@entities/project', line: 3 },
			{ specifier: '@shared/lib/i18n', line: 4 },
		]);
	});
});
