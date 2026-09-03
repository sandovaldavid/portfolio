import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(path, 'utf8');

describe('Identity System shared iconography contract', () => {
	it('keeps promoted navigation primitives on the shared 24px geometry', () => {
		const icons = {
			arrowLeft: read('src/assets/icons/ArrowLeft.astro'),
			arrowRight: read('src/assets/icons/ArrowRight.astro'),
			arrowUpRight: read('src/assets/icons/ArrowUpRight.astro'),
			chevronRight: read('src/assets/icons/ChevronRight.astro'),
			home: read('src/assets/icons/Home.astro'),
			menu: read('src/assets/icons/MenuIcon.astro'),
			code: read('src/assets/icons/Code.astro'),
		};

		for (const icon of Object.values(icons)) {
			expect(icon).toContain('viewBox="0 0 24 24"');
			expect(icon).toContain('currentColor');
		}

		expect(icons.arrowLeft).toContain('M10 19l-7-7');
		expect(icons.arrowRight).toContain('M14 5l7 7');
		expect(icons.arrowUpRight).toContain('M7 17L17 7');
		expect(icons.chevronRight).toContain('M9 18l6-6-6-6');
		expect(icons.home).toContain('M3 12l2-2');
		expect(icons.menu).toContain('M4 6l16 0');
		expect(icons.code).toContain('M7 8l-4 4l4 4');
	});

	it('keeps Hub as an owned routing destination instead of a sub-brand', () => {
		const hub = read('src/assets/social-networks/LinkHub.astro');

		expect(hub).toContain('viewBox="0 0 24 24"');
		expect(hub).toContain('stroke="currentColor"');
		expect(hub).toContain('M9.16488 17.6505');
	});
});
