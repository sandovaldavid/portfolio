import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');
const collectFiles = (directory: string): string[] =>
	readdirSync(directory).flatMap(entry => {
		const path = join(directory, entry);
		return statSync(path).isDirectory() ? collectFiles(path) : [path];
	});

const globalStyles = readSource('src/app/styles/global.css');
const colors = readSource('src/app/styles/colors.css');
const layout = readSource('src/app/layouts/Layout.astro');
const buttons = readSource('src/shared/ui/button/button.css');
const sectionContainer = readSource('src/shared/ui/section-container/SectionContainer.astro');
const experience = readSource('src/widgets/experience/ui/Experience.astro');
const experienceTab = readSource('src/widgets/experience/ui/ExperienceTab.astro');
const projects = readSource('src/widgets/projects/ui/Projects.astro');
const projectCard = readSource('src/entities/project/ui/ProjectCard.astro');
const research = readSource('src/widgets/research/ui/Research.astro');
const about = readSource('src/widgets/about-me/ui/AboutMe.astro');
const techStack = readSource('src/widgets/tech-stack/ui/TechStack.astro');
const recruiterHud = readSource('src/widgets/recruiter-hud/ui/RecruiterHUD.astro');
const contactSidebar = readSource('src/widgets/contact-sidebar/ui/ContactSidebar.astro');

const homeStyleSurfaces = [
	layout,
	readSource('src/widgets/hero/ui/Hero.astro'),
	readSource('src/widgets/hero/ui/HeroProfileRecord.astro'),
	experience,
	experienceTab,
	readSource('src/widgets/experience/ui/ExperienceDetail.astro'),
	projects,
	projectCard,
	research,
	about,
	techStack,
	recruiterHud,
	contactSidebar,
	sectionContainer,
	readSource('src/shared/ui/title-section/TitleSection.astro'),
];

const productionStyleFiles = collectFiles('src').filter(
	path => /\.(astro|css|ts|tsx|js|mjs)$/.test(path) && path !== 'src/app/styles/colors.css'
);

describe('Home style hygiene', () => {
	it('keeps Home consumers on semantic color roles instead of raw Tailwind ramps', () => {
		const rawPaletteUtility =
		/\b(?:bg|text|border|ring|from|via|to)-(?:white|black|primary-\d+|neutral-\d+|success-\d+|warning-\d+|error-\d+)\b/g;
		const offenders = homeStyleSurfaces.flatMap((source, index) =>
			(source.match(rawPaletteUtility) ?? []).map(match => `${index}:${match}`)
		);

		expect(offenders).toEqual([]);
		expect(layout).toContain('focus:bg-button-primary-background');
		expect(layout).toContain('focus:text-button-primary-content');
	});

	it('keeps component-local geometry declarative and avoids inline style attributes', () => {
		for (const source of homeStyleSurfaces) {
			expect(source).not.toMatch(/\sstyle\s*=/i);
		}
	});

	it('removes retired global aliases and duplicated typography utilities', () => {
		for (const retired of [
			'text-section-heading',
			'text-code-body',
			':has(> #hero)',
			'.container {',
		]) {
			expect(globalStyles).not.toContain(retired);
		}

		for (const retired of [
			'Backward-compatible aliases while consumers migrate',
			'--color-hero-glow',
			'--color-channel-hero-glow',
			'--color-theme-menu-background',
			'--color-theme-menu-border',
			'--color-theme-option-background-hover',
			'--color-logo-effect-magenta',
			'--color-logo-effect-cyan',
			'--animate-fade-in',
			'--animate-slide-up',
			'.hero-gradient',
		]) {
			expect(colors).not.toContain(retired);
		}
	});

	it('has no production consumers of retired migration token names', () => {
		const retiredFragments = [
			'color-surface-highlight-light',
			'color-surface-highlight-dark',
			'color-background-light',
			'color-background-dark',
			'color-content-strong-light',
			'color-content-strong-dark',
			'color-content-light',
			'color-content-dark',
			'color-content-muted-light',
			'color-content-muted-dark',
			'color-edge-subtle-light',
			'color-edge-subtle-dark',
			'color-edge-strong-light',
			'color-edge-strong-dark',
			'color-retro-cyan',
			'color-retro-cyan-bright',
			'color-theme-menu-background',
			'color-theme-menu-border',
			'color-theme-option-background-hover',
			'color-logo-effect-magenta',
			'color-logo-effect-cyan',
			'color-channel-hero-glow',
		];
		const offenders = productionStyleFiles.flatMap(path => {
			const source = readSource(path);
			return retiredFragments
				.filter(fragment => source.includes(fragment))
				.map(fragment => `${path}: ${fragment}`);
		});

		expect(offenders).toEqual([]);
	});

	it('centralizes shared button typography in the semantic Button Label role', () => {
		expect(buttons).toContain('@apply text-button-label;');
		expect(buttons).not.toContain('tracking-[0.7px]');
	});

	it('keeps Home composition explicit instead of relying on hidden descendant overrides', () => {
		expect(sectionContainer).not.toContain(':global(.title-section)');
		expect(sectionContainer).not.toContain('HOME_VIEWPORT_SECTIONS');
		expect(sectionContainer).not.toContain('HOME_COMPACT_SECTIONS');
		expect(layout).toContain('layout="viewport"');
		expect(layout).toContain('layout="compact"');
		expect(projects.trimStart()).toContain('<div class="w-full">');
		expect(research.trimStart()).toContain('<div class="w-full">');
		expect(projectCard).not.toContain('<article class="group h-full w-full font-sans">');
		expect(techStack).not.toContain('createScopedUiTranslator');
	});

	it('derives Experience active state from the accessible selected state', () => {
		expect(experienceTab).not.toContain('active: boolean');
		expect(experience).not.toContain('active={idx === 0}');
		expect(experienceTab).toContain("data-active={selected ? 'true' : 'false'}");
	});
});
