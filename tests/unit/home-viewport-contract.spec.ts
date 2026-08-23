import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const globalStyles = readFileSync('src/app/styles/global.css', 'utf8');
const sectionContainer = readFileSync(
	'src/shared/ui/section-container/SectionContainer.astro',
	'utf8'
);
const hero = readFileSync('src/widgets/hero/ui/Hero.astro', 'utf8');
const experience = readFileSync('src/widgets/experience/ui/Experience.astro', 'utf8');
const experienceTab = readFileSync('src/widgets/experience/ui/ExperienceTab.astro', 'utf8');
const projectCard = readFileSync('src/entities/project/ui/ProjectCard.astro', 'utf8');
const projects = readFileSync('src/widgets/projects/ui/Projects.astro', 'utf8');
const aboutMe = readFileSync('src/widgets/about-me/ui/AboutMe.astro', 'utf8');
const sectionScroll = readFileSync(
	'src/features/section-scroll/ui/SectionScrollController.astro',
	'utf8'
);

describe('Home viewport section contract', () => {
	it('uses a full-width Home wrapper without viewport-width overflow hacks', () => {
		expect(globalStyles).toContain('#main-content > div:has(> #hero)');
		expect(globalStyles).toContain('width: 100%');
		expect(experience).not.toContain('w-dvw');
		expect(experience).not.toContain('100dvw');
		expect(experience).not.toContain('-translate-x-1/2');
	});

	it('keeps only substantial Home sections viewport-oriented', () => {
		for (const id of ['projects', 'research', 'about-me']) {
			expect(sectionContainer).toContain(`'${id}'`);
		}
		expect(sectionContainer).toContain("HOME_COMPACT_SECTIONS = new Set(['technologies'])");
		expect(sectionContainer).toContain('md:min-h-[calc(100svh-4.5rem)]');
		expect(sectionContainer).toContain('data-home-compact-shell');
		expect(hero).toContain('md:min-h-[calc(100svh-4.5rem)]');
		expect(experience).toContain('md:min-h-[calc(100svh-4.5rem)]');
	});

	it('keeps Experience special and reserves stable panel geometry', () => {
		expect(experience).toContain('experience-panels grid');
		expect(experience).toContain('col-start-1 row-start-1');
		expect(experience).toContain('visibility: hidden');
		expect(experience).toContain('panel.inert = !selected');
		expect(experienceTab).toContain('hover:bg-badge-brand-bg');
		expect(experienceTab).toContain('data-[active=true]:border-edge-strong');
	});

	it('keeps Project Cards fixed-height with minimal metadata and intrinsic actions', () => {
		expect(projectCard).toContain("'h-116.5 md:h-119.5 lg:h-93.5'");
		expect(projectCard).toContain("'h-131.5 md:h-134.5 lg:h-116'");
		expect(projectCard).toContain('tags.slice(0, 3)');
		expect(projectCard).toContain('line-clamp-3');
		expect(projectCard).toContain('lg:line-clamp-2');
		expect(projectCard).not.toContain('cardTypeText');
		expect(projectCard).not.toContain('sourceAccessText');
		expect(projectCard).toContain('justify-between');
		expect(projectCard).toContain('class="w-fit shrink-0"');
		expect(projects).toContain("caseStudyText={tProjects('caseStudy')}");
	});

	it('sizes Home biography and work actions from their localized copy', () => {
		expect(aboutMe.match(/class="w-fit"/g)).toHaveLength(2);
	});

	it('cleans up wheel listeners and does not intercept horizontal rails', () => {
		expect(sectionScroll).toContain('sectionScrollCleanup?.()');
		expect(sectionScroll).toContain('.overflow-x-auto');
		expect(sectionScroll).toContain("window.removeEventListener('wheel', onWheel)");
	});
});
