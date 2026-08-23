import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const experience = readFileSync('src/widgets/experience/ui/Experience.astro', 'utf8');
const tab = readFileSync('src/widgets/experience/ui/ExperienceTab.astro', 'utf8');

describe('Experience motion contract', () => {
	it('animates selection cues with CSS and honors reduced motion', () => {
		expect(tab).toContain('transition-[opacity,transform]');
		expect(tab).toContain('duration-300');
		expect(tab).toContain('motion-reduce:transition-none');
		expect(tab).toContain('scale-y-0');
		expect(tab).toContain('group-data-[active=true]:scale-y-100');
		expect(tab).toContain('opacity-0');
		expect(tab).toContain('group-data-[active=true]:opacity-100');
		expect(experience).toContain(".experience-panel[data-active='true']");
		expect(experience).toContain('transform 220ms');
		expect(experience).toContain('@media (prefers-reduced-motion: reduce)');
		expect(experience).not.toContain('panel.animate(');
	});

	it('stretches the desktop/tablet selection indicator across the full tab height', () => {
		expect(tab).toContain('-top-0.5 -bottom-0.5 -left-0.5');
		expect(tab).not.toContain('-top-0.5 bottom-1.5 -left-0.5');
	});

	it('reserves the tallest localized panel so tab changes do not shift page geometry', () => {
		expect(experience).toContain('experience-panels grid');
		expect(experience).toContain('col-start-1 row-start-1');
		expect(experience).toContain('visibility: hidden');
		expect(experience).toContain('panel.inert = !selected');
		expect(experience).not.toContain('panel.hidden =');
	});

	it('keeps tablet and desktop viewport-filling while mobile remains content-driven', () => {
		expect(experience).toContain('md:min-h-[calc(100svh-4.5rem)]');
		expect(experience).not.toContain('min-h-[calc(100svh-4.5rem)] md:min-h-0');
	});
});
