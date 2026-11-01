import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');
const projectCard = readSource('src/entities/project/ui/ProjectCard.astro');
const projects = readSource('src/widgets/projects/ui/Projects.astro');
const layout = readSource('src/app/layouts/Layout.astro');
const notFound = readSource('src/pages/404.astro');

describe('Route performance scope contract', () => {
	it('keeps catalog images below the primary-card raster target and lazy-loads Home project cards', () => {
		expect(projectCard).toContain(
			'const mediaWidth = isPrimary ? 800 : isCatalog ? 640 : 600;'
		);
		expect(projectCard).toContain(
			'const mediaSourceHeight = isPrimary ? 500 : isCatalog ? 400 : 380;'
		);
		expect(projectCard).toContain('width={mediaWidth}');
		expect(projectCard).toContain('height={mediaSourceHeight}');
		expect(projectCard).toContain('decoding="async"');
		expect(projects).toContain('priority={isCatalog && i < 2}');
	});

	it('preloads only the primary JetBrains Mono 400 face instead of decorative pixel faces', () => {
		for (const source of [layout, notFound]) {
			expect(source).toContain(
				"<Font cssVariable=\"--font-mono\" preload={[{ weight: '400', style: 'normal' }]} />"
			);
			expect(source).not.toContain('<Font cssVariable="--font-pixel-clean" preload />');
		}
	});
});
