import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const globalStyles = readFileSync('src/app/styles/global.css', 'utf8');
const layout = readFileSync('src/app/layouts/Layout.astro', 'utf8');
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
	it('uses an explicit full-width Home wrapper without viewport-width or relational-selector hacks', () => {
		expect(layout).toContain('<div class="w-full pt-18">');
		expect(globalStyles).not.toContain(':has(> #hero)');
		expect(globalStyles).not.toContain('.container {');
		expect(experience).not.toContain('w-dvw');
		expect(experience).not.toContain('100dvw');
		expect(experience).not.toContain('-translate-x-1/2');
	});

	it('centers viewport title/content compositions with one shared gap rhythm', () => {
		expect(sectionContainer).toContain("layout?: 'contained' | 'viewport' | 'compact'");
		expect(sectionContainer).toContain("surface?: 'canvas' | 'highlight'");
		expect(sectionContainer).not.toContain('HOME_VIEWPORT_SECTIONS');
		expect(sectionContainer).not.toContain('HOME_COMPACT_SECTIONS');
		expect(sectionContainer).toContain('flex w-full max-w-360 flex-col justify-center');
		expect(sectionContainer).toContain('!gap-y-10');
		expect(sectionContainer).toContain('md:!gap-y-12');
		expect(sectionContainer).toContain('lg:!gap-y-14');
		expect(sectionContainer).toContain("layout === 'viewport'");
		expect(sectionContainer).toContain('md:min-h-[calc(100svh-4.5rem)]');
		expect(sectionContainer).not.toContain('md:grid-rows-[auto_1fr]');
		expect(sectionContainer).not.toContain('md:[&>*:nth-child(2)]:self-center');
		expect(sectionContainer).toContain('data-home-compact-shell');

		for (const id of ['projects', 'research', 'about-me']) {
			expect(layout).toMatch(new RegExp(`id="${id}"[\\s\\S]*?layout="viewport"`, 'm'));
		}
		expect(layout).toMatch(/id="technologies"[\s\S]*?layout="compact"/m);
		expect(hero).toContain('md:min-h-[calc(100svh-4.5rem)]');
		expect(experience).toContain('md:min-h-[calc(100svh-4.5rem)]');
		expect(experience).toContain('flex w-full max-w-320 flex-col justify-center');
		expect(experience).toContain('gap-10');
		expect(experience).toContain('md:gap-12');
		expect(experience).toContain('lg:gap-14');
	});

	it('keeps Experience special and reserves stable panel geometry', () => {
		expect(experience).toContain('experience-panels grid');
		expect(experience).toContain('col-start-1 row-start-1');
		expect(experience).toContain('visibility: hidden');
		expect(experience).toContain('panel.inert = !selected');
		expect(experience).not.toContain('active={idx === 0}');
		expect(experienceTab).not.toContain('active: boolean');
		expect(experienceTab).toContain('hover:bg-badge-brand-bg');
		expect(experienceTab).toContain('data-[active=true]:border-edge-strong');
	});

	it('keeps Home Project Cards fixed-height with minimal metadata and intrinsic actions', () => {
		expect(projectCard).toContain("'h-116.5 md:h-119.5 lg:h-97.5'");
		expect(projectCard).toContain("'h-131.5 md:h-134.5 lg:h-116'");
		expect(projectCard).toContain("const isCatalog = variant === 'catalog'");
		expect(projectCard).toContain('tags.slice(0, isCatalog ? 4 : 3)');
		expect(projectCard).toContain("isCatalog ? 'lg:max-w-148' : 'lg:max-w-140'");
		expect(projectCard).toContain(": 'h-32.5 lg:h-34'");
		expect(projectCard).toContain('line-clamp-3');
		expect(projectCard).toContain('lg:line-clamp-2');
		expect(projectCard).not.toContain('cardTypeText');
		expect(projectCard).not.toContain('sourceAccessText');
		expect(projectCard).toContain('justify-between');
		expect(projectCard).toContain('class="w-fit shrink-0 px-3"');
		expect(projectCard).toContain('class="hidden shrink-0 md:block"');
		expect(projectCard).toContain('class="w-fit px-3"');
		expect(projects).toContain('lg:grid-cols-[repeat(2,minmax(0,560px))] lg:gap-12');
		expect(projects).toContain("caseStudyText={tProjects('caseStudy')}");
	});

	it('balances Home biography and current role without inventing additional content', () => {
		expect(aboutMe.match(/class="w-fit/g)).toHaveLength(2);
		expect(aboutMe).toContain('max-w-288');
		expect(aboutMe).toContain('data-about-profile');
		expect(aboutMe).toContain('data-about-current-role');
		expect(aboutMe).toContain('border-t border-edge-subtle');
		expect(aboutMe).toContain('lg:grid-cols-[200px_minmax(0,1fr)_auto]');
	});

	it('navigates only viewport targets and yields to real vertical scrollers and the content-driven tail', () => {
		expect(sectionScroll).toContain("['hero', 'experience', 'projects', 'research', 'about-me']");
		expect(sectionScroll).not.toContain("querySelectorAll<HTMLElement>('main > div > section[id], footer[id]')");
		expect(sectionScroll).toContain('elementCanScrollVertically');
		expect(sectionScroll).toContain('const { overflowY } = window.getComputedStyle(element)');
		expect(sectionScroll).not.toContain("closest(\n\t\t\t\t\t'.overflow-y-auto");
		expect(sectionScroll).not.toContain('.overflow-x-auto, .overflow-auto');
		expect(sectionScroll).toContain('findDirectionalTarget');
		expect(sectionScroll).toContain('WHEEL_QUIET_PERIOD');
		expect(sectionScroll).not.toContain('}, 500);');
		expect(sectionScroll).toContain('After About Me, Technologies and the Footer are intentionally content-driven.');
		expect(sectionScroll).toContain('sectionScrollCleanup?.()');
		expect(sectionScroll).toContain("window.removeEventListener('wheel', onWheel)");
	});
});
