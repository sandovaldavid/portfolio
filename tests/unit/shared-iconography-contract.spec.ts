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
		expect(icons.chevronRight).toContain('M9 18L15 12L9 6');
		expect(icons.home).toContain('M3 12l2-2');
		expect(icons.menu).toContain('M4 6l16 0');
		expect(icons.code).toContain('M7 8l-4 4l4 4');
	});

	it('keeps recurring UI glyphs aligned with the shared cross-channel geometry', () => {
		const icons = {
			sun: read('src/assets/icons/Sun.astro'),
			moon: read('src/assets/icons/Moon.astro'),
			system: read('src/assets/icons/System.astro'),
			briefcase: read('src/assets/icons/Briefcase.astro'),
			email: read('src/assets/icons/Mail.astro'),
			link: read('src/assets/icons/Link.astro'),
			share: read('src/assets/icons/Share.astro'),
		};

		for (const icon of Object.values(icons)) {
			expect(icon).toContain('viewBox="0 0 24 24"');
			expect(icon).toContain('currentColor');
		}

		expect(icons.sun).toContain('M12 12m-4 0a4 4 0 1 0 8 0');
		expect(icons.moon).toContain('a7.5 7.5 0 0 0 7.92 12.446');
		expect(icons.system).toContain('M3 5a1 1 0 0 1 1 -1h16');
		expect(icons.briefcase).toContain('M3 13a20 20 0 0 0 18 0');
		expect(icons.email).toContain('M3 8L8.44992 11.6333');
		expect(icons.link).toContain('M10 13a5 5 0 0 0 7.54.54');
		expect(icons.share).toContain('m8.6 10.5 6.8-4');
	});

	it('keeps shared technology marks aligned with the cross-channel registry', () => {
		const csharp = read('src/assets/technologies/CSharp.astro');
		const astro = read('src/assets/technologies/AstroIcon.astro');
		const postgresql = read('src/assets/technologies/PostgreSQL.astro');

		expect(csharp).toContain('viewBox="0 0 72 72"');
		expect(csharp).toContain('stop-color="#927BE5"');
		expect(csharp).toContain('stop-color="#512BD4"');
		expect(astro).toContain('viewBox="0 0 256 366"');
		expect(astro).toContain('fill="#FF5D01"');
		expect(postgresql).toContain('viewBox="0 0 256 264"');
		expect(postgresql).toContain('fill="#336791"');
	});

	it('keeps Hub as an owned routing destination instead of a sub-brand', () => {
		const hub = read('src/assets/social-networks/LinkHub.astro');

		expect(hub).toContain('viewBox="0 0 24 24"');
		expect(hub).toContain('stroke="currentColor"');
		expect(hub).toContain('M9.16488 17.6505');
	});
});
