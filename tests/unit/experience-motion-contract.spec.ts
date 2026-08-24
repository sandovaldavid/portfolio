import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const experience = readFileSync('src/widgets/experience/ui/Experience.astro', 'utf8');
const detail = readFileSync('src/widgets/experience/ui/ExperienceDetail.astro', 'utf8');
const tab = readFileSync('src/widgets/experience/ui/ExperienceTab.astro', 'utf8');

describe('Experience motion contract', () => {
	it('animates selection cues with CSS and honors reduced motion', () => {
		expect(tab).toContain('transition-[opacity,transform]');
		expect(tab).toContain('duration-300');
		expect(tab).toContain('motion-reduce:transition-none');
		expect(tab).toContain('group-hover:translate-x-1');
		expect(tab).toContain('group-data-[active=true]:translate-x-1');
		expect(experience).toContain(".experience-panel[data-active='true']");
		expect(experience).toContain("data-motion='enter-forward'");
		expect(experience).toContain("data-motion='exit-forward'");
		expect(experience).toContain('transform 240ms');
		expect(experience).toContain('@keyframes experience-detail-enter');
		expect(experience).toContain('[data-experience-achievement]:nth-child(4)');
		expect(experience).toContain('@media (prefers-reduced-motion: reduce)');
		expect(experience).not.toContain('panel.animate(');
	});

	it('stretches the desktop/tablet selection indicator across the full tab height', () => {
		expect(tab).toContain('-top-0.5 -bottom-0.5 -left-0.5');
		expect(tab).not.toContain('-top-0.5 bottom-1.5 -left-0.5');
		expect(experience).toContain(".experience-tablist > [role='tab']");
		expect(experience).toContain('flex: 1 1 0%');
	});

	it('reserves the tallest localized panel so tab changes do not shift page geometry', () => {
		expect(experience).toContain('experience-panels grid');
		expect(experience).toContain('col-start-1 row-start-1');
		expect(experience).toContain('visibility: hidden');
		expect(experience).toContain('panel.inert = !selected');
		expect(experience).not.toContain('panel.hidden =');
		expect(detail).toContain('md:min-h-104');
		expect(detail).toContain('lg:min-h-110');
	});

	it('uses the detail surface more efficiently without inventing additional experience claims', () => {
		expect(detail).toContain('visibleAchievements = description.slice(0, 4)');
		expect(detail).toContain('lg:grid-cols-2');
		expect(detail).toContain("isLastOdd && 'lg:col-span-2'");
		expect(detail).toContain('data-experience-detail-footer');
		expect(detail).toContain('visibleTechnologies = technologies.slice(0, 4)');
		expect(tab).toContain('date: string');
		expect(tab).toContain('isCurrent: boolean');
	});

	it('keeps tablet and desktop viewport-filling while mobile remains content-driven', () => {
		expect(experience).toContain('md:min-h-[calc(100svh-4.5rem)]');
		expect(experience).not.toContain('min-h-[calc(100svh-4.5rem)] md:min-h-0');
	});
});
