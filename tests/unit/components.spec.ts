import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createScopedUiTranslator, Language } from '@shared/config/i18n';

describe('home section catalog consumers', () => {
	it('resolves English hero and section copy', () => {
		const hero = createScopedUiTranslator(Language.ENGLISH, 'sections.hero');
		const research = createScopedUiTranslator(Language.ENGLISH, 'sections.research');
		const techStack = createScopedUiTranslator(Language.ENGLISH, 'sections.techStack');

		expect(hero('title')).toBe(
			'Backend-oriented Software Engineer with hands-on frontend experience'
		);
		expect(hero('subtitle')).toBe(
			'I work on product systems across APIs, service integrations, and frontend features.'
		);
		expect(hero('credential')).toContain('Remote from Peru');
		expect(research('sectionTitle')).toBe('RESEARCH');
		expect(techStack('sectionTitle')).toBe('CORE STACK');
	});

	it('resolves Spanish hero and section copy', () => {
		const hero = createScopedUiTranslator(Language.SPANISH, 'sections.hero');
		const research = createScopedUiTranslator(Language.SPANISH, 'sections.research');
		const techStack = createScopedUiTranslator(Language.SPANISH, 'sections.techStack');

		expect(hero('title')).toBe(
			'Ingeniero de Software orientado a backend, con experiencia práctica en frontend'
		);
		expect(hero('subtitle')).toBe(
			'Trabajo en sistemas de producto entre APIs, integraciones y funcionalidades frontend.'
		);
		expect(hero('banner')).toContain('DISPONIBLE');
		expect(research('sectionTitle')).toBe('INVESTIGACIÓN');
		expect(techStack('sectionTitle')).toBe('STACK PRINCIPAL');
	});

	it('reuses shared status and action labels', () => {
		const commonEn = createScopedUiTranslator(Language.ENGLISH, 'common');
		const commonEs = createScopedUiTranslator(Language.SPANISH, 'common');

		expect(commonEn('status.available')).toBe('Available');
		expect(commonEs('status.inProgress')).toBe('En progreso');
		expect(commonEn('actions.viewWork')).toBe('View work');
		expect(commonEs('actions.viewWork')).toBe('Ver proyectos');
	});

	it('enforces WCAG 2.2 AA modal focus traps, shortcut toggle, target sizes, and semantic CTAs', () => {
		const cliRuntime = readFileSync('src/features/cli-terminal/model/runtime.ts', 'utf8');
		const cliCatalog = readFileSync(
			'src/features/cli-terminal/ui/CLITerminalCatalog.astro',
			'utf8'
		);
		const splash = readFileSync('src/features/splash-screen/ui/SplashScreen.astro', 'utf8');
		const mobileNav = readFileSync('src/widgets/header/ui/MobileNav.astro', 'utf8');
		const linkButton = readFileSync('src/shared/ui/link-button/LinkButton.astro', 'utf8');
		const projectCard = readFileSync('src/entities/project/ui/ProjectCard.astro', 'utf8');
		const editorialCard = readFileSync(
			'src/shared/ui/editorial-card/EditorialCard.astro',
			'utf8'
		);
		const experienceArchive = readFileSync(
			'src/widgets/experience-case-study/ui/ExperienceArchive.astro',
			'utf8'
		);
		const experience = readFileSync('src/widgets/experience/ui/Experience.astro', 'utf8');
		const mermaid = readFileSync('src/shared/ui/rich-content/ui/MermaidDiagram.astro', 'utf8');

		expect(cliRuntime).toContain('trapDialogFocus');
		expect(cliRuntime).toContain('getScrollBehavior');
		expect(cliRuntime).toContain('portfolio-vim-shortcuts');
		expect(cliRuntime).toContain(
			"if (event.key === 'Tab' && !event.shiftKey && cliInput.value.trim().length > 0)"
		);
		expect(cliCatalog).toContain('inline-flex size-6 items-center justify-center');
		expect(cliCatalog).toContain('id="shortcuts-toggle"');
		expect(splash).toContain('min-h-6 min-w-6');
		expect(mobileNav).toContain("if (e.key === 'Tab')");
		expect(linkButton).toContain('href={disabled ? undefined : href}');
		expect(projectCard).toContain('<span class="sr-only">: {title}</span>');
		expect(editorialCard).toContain('<span class="sr-only">: {title}</span>');
		expect(experienceArchive).toContain('<span class="sr-only">: {item.company}</span>');
		expect(experience).toContain('inert={idx !== 0 ? true : undefined}');
		expect(mermaid).not.toContain('data-mermaid-state="pending"\n\t\taria-busy="true"');
		expect(mermaid).toContain("host.setAttribute('aria-busy', 'true')");
	});
});
