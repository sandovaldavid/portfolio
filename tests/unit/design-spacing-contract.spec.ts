import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const MIGRATED_STYLE_SURFACES = [
	'src/app/layouts/Layout.astro',
	'src/entities/project/ui/ProjectCard.astro',
	'src/shared/ui/badge/Badge.astro',
	'src/shared/ui/content-panel/ContentPanel.astro',
	'src/shared/ui/editorial-card/EditorialCard.astro',
	'src/shared/ui/link-inline/LinkInline.astro',
	'src/shared/ui/rich-content/ui/MermaidDiagram.astro',
	'src/shared/ui/section-container/SectionContainer.astro',
	'src/shared/ui/tech-pill/TechPill.astro',
	'src/features/theme-toggle/ui/ThemeToggle.astro',
	'src/widgets/header/ui/Header.astro',
	'src/widgets/header/ui/DesktopNav.astro',
	'src/widgets/footer/ui/Footer.astro',
	'src/widgets/hero/ui/Hero.astro',
	'src/widgets/hero/ui/HeroProfileRecord.astro',
	'src/widgets/experience/ui/Experience.astro',
	'src/widgets/experience/ui/ExperienceTab.astro',
	'src/widgets/experience/ui/ExperienceDetail.astro',
	'src/widgets/projects/ui/Projects.astro',
	'src/widgets/project-case-study/ui/ProjectCaseStudy.astro',
	'src/widgets/project-case-study/ui/CaseStudySection.astro',
	'src/widgets/project-case-study/ui/CaseStudyGrid.astro',
	'src/widgets/project-case-study/ui/CaseStudyCard.astro',
	'src/widgets/project-case-study/ui/EvidenceBlock.astro',
	'src/widgets/project-case-study/ui/ProjectResources.astro',
	'src/widgets/project-case-study/ui/ProjectVideo.astro',
	'src/widgets/project-case-study/ui/ProjectGallery.astro',
	'src/widgets/research-page/ui/ResearchPage.astro',
	'src/widgets/research-page/ui/ResearchEvidenceLayout.astro',
	'src/widgets/research-page/ui/ResearchEvidenceColumn.astro',
	'src/widgets/research-page/ui/ResearchSection.astro',
	'src/widgets/research-page/ui/EvaluationCriteria.astro',
	'src/widgets/research/ui/Research.astro',
	'src/widgets/about-me/ui/AboutMe.astro',
	'src/widgets/tech-stack/ui/TechStack.astro',
	'src/widgets/recruiter-hud/ui/RecruiterHUD.astro',
	'src/widgets/contact-sidebar/ui/ContactSidebar.astro',
] as const;

const arbitraryPixelSpacing =
	/\b(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)-\[[^\]]*px\]/g;
const arbitraryPixelRadius = /\brounded(?:-[trbl]{1,2})?-\[[^\]]*px\]/g;

describe('Portfolio v2 spacing contract', () => {
	it('keeps migrated surfaces on semantic or Tailwind numeric spacing utilities', () => {
		const offenders = MIGRATED_STYLE_SURFACES.flatMap(path => {
			const source = readFileSync(path, 'utf8');
			const matches = [
				...(source.match(arbitraryPixelSpacing) ?? []),
				...(source.match(arbitraryPixelRadius) ?? []),
			];
			return matches.map(match => `${path}: ${match}`);
		});

		expect(offenders).toEqual([]);
	});

	it('preserves arbitrary values only for non-spacing geometry or expressions', () => {
		const profileRecord = readFileSync('src/widgets/hero/ui/HeroProfileRecord.astro', 'utf8');
		const hero = readFileSync('src/widgets/hero/ui/Hero.astro', 'utf8');
		const experience = readFileSync('src/widgets/experience/ui/Experience.astro', 'utf8');
		const sectionContainer = readFileSync(
			'src/shared/ui/section-container/SectionContainer.astro',
			'utf8'
		);
		const contactRail = readFileSync(
			'src/widgets/contact-sidebar/ui/ContactSidebar.astro',
			'utf8'
		);

		expect(profileRecord).toContain('md:grid-cols-[220px_minmax(0,1fr)]');
		expect(hero).toContain('md:min-h-[calc(100svh-4.5rem)]');
		expect(experience).toContain('md:grid-cols-[280px_minmax(0,1fr)]');
		expect(experience).toContain('lg:grid-cols-[360px_minmax(0,1fr)]');
		expect(sectionContainer).toContain('md:min-h-[calc(100svh-4.5rem)]');
		expect(contactRail).toContain('translateX(calc(-100% - 0.5rem))');
		expect(profileRecord).toContain('p-0.5');
		expect(profileRecord).toContain('gap-3.5');
		expect(profileRecord).toContain('p-4.5');
	});
});
