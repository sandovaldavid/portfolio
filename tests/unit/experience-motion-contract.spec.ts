import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const experience = readFileSync('src/widgets/experience/ui/Experience.astro', 'utf8');
const tab = readFileSync('src/widgets/experience/ui/ExperienceTab.astro', 'utf8');

describe('Experience motion contract', () => {
	it('animates only selection cues and honors reduced motion', () => {
		expect(tab).toContain('transition-[opacity,transform]');
		expect(tab).toContain('duration-300');
		expect(tab).toContain('motion-reduce:transition-none');
		expect(experience).toContain("window.matchMedia('(prefers-reduced-motion: reduce)').matches");
		expect(experience).toContain('panel.animate(');
		expect(experience).toContain('duration: 220');
	});

	it('keeps tablet and desktop viewport-filling while mobile remains content-driven', () => {
		expect(experience).toContain('md:min-h-[calc(100svh-4.5rem)]');
		expect(experience).not.toContain('min-h-[calc(100svh-4.5rem)] md:min-h-0');
	});
});
