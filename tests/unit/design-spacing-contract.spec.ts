import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const MIGRATED_STYLE_SURFACES = [
	'src/shared/ui/badge/Badge.astro',
	'src/shared/ui/content-panel/ContentPanel.astro',
	'src/shared/ui/editorial-card/EditorialCard.astro',
	'src/shared/ui/link-inline/LinkInline.astro',
	'src/shared/ui/section-container/SectionContainer.astro',
	'src/shared/ui/tech-pill/TechPill.astro',
	'src/features/theme-toggle/ui/ThemeToggle.astro',
	'src/widgets/header/ui/Header.astro',
	'src/widgets/header/ui/DesktopNav.astro',
	'src/widgets/footer/ui/Footer.astro',
	'src/widgets/hero/ui/Hero.astro',
	'src/widgets/hero/ui/HeroProfileRecord.astro',
] as const;

const arbitraryPixelSpacing =
	/\b(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)-\[[^\]]*px\]/g;
const arbitraryPixelRadius = /\brounded(?:-[trbl]{1,2})?-\[[^\]]*px\]/g;

describe('Portfolio v2 spacing contract', () => {
	it('keeps migrated surfaces on semantic or Tailwind numeric spacing utilities', () => {
		const offenders = MIGRATED_STYLE_SURFACES.flatMap(path => {
			const source = readFileSync(path, 'utf8');
			const matches = [
				...(source.match(arbitraryPixelSpacing) ?? []),
				...(source.match(arbitraryPixelRadius) ?? []),
			];
			return matches.map(match => `${path}: ${match}`);
		});

		expect(offenders).toEqual([]);
	});

	it('preserves arbitrary values only for non-spacing geometry or expressions', () => {
		const profileRecord = readFileSync(
			'src/widgets/hero/ui/HeroProfileRecord.astro',
			'utf8'
		);
		const hero = readFileSync('src/widgets/hero/ui/Hero.astro', 'utf8');

		// Complex grid/calc expressions are legitimate arbitrary values; plain
		// spacing values must use Tailwind's numeric scale instead.
		expect(profileRecord).toContain('md:grid-cols-[220px_minmax(0,1fr)]');
		expect(hero).toContain('lg:min-h-[calc(100svh-4.5rem)]');
		expect(profileRecord).toContain('p-0.5');
		expect(profileRecord).toContain('gap-3.5');
		expect(profileRecord).toContain('p-4.5');
	});
});
