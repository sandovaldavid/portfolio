import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(path, 'utf8');

describe('shared platform icon contract', () => {
	it('uses the same filled GitHub and LinkedIn marks as the Identity System registry', () => {
		const github = read('src/assets/technologies/GitHub.astro');
		const linkedin = read('src/assets/social-networks/LinkedIn.astro');

		expect(github).toContain('viewBox="0 0 16 16"');
		expect(github).toContain('fill="currentColor"');
		expect(github).toContain('M8 0C3.58 0 0 3.58 0 8');
		expect(github).not.toContain('stroke="currentColor"');

		expect(linkedin).toContain('viewBox="0 0 256 256"');
		expect(linkedin).toContain('fill="currentColor"');
		expect(linkedin).toContain('M218.123 218.127h-37.931');
		expect(linkedin).not.toContain('stroke="currentColor"');
	});
});
