import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(path, 'utf8');

describe('Portfolio v2 icon contract', () => {
	it('uses the canonical About glyph in desktop and mobile navigation', () => {
		const desktop = read('src/widgets/header/ui/DesktopNav.astro');
		const mobile = read('src/widgets/header/ui/MobileNav.astro');

		for (const source of [desktop, mobile]) {
			expect(source).toContain("import AboutIcon from '@assets/icons/About.astro'");
			expect(source).toContain("link.icon === 'about-me' && <AboutIcon");
			expect(source).not.toContain("link.icon === 'about-me' && <ProfileCheckIcon");
		}

		const about = read('src/assets/icons/About.astro');
		expect(about).toContain('M12 12C14.2091 12');
		expect(about).toContain('M4 21C4 18.8783');
	});

	it('keeps Link Hub on its canonical social icon without an appended chevron', () => {
		const sidebar = read('src/widgets/contact-sidebar/ui/ContactSidebar.astro');
		const genericLink = read('src/assets/icons/Link.astro');
		const linkHub = read('src/assets/social-networks/LinkHub.astro');

		expect(sidebar).toContain(
			"import LinkHubIcon from '@assets/social-networks/LinkHub.astro'"
		);
		expect(sidebar).toContain('Icon: LinkHubIcon');
		expect((genericLink.match(/<svg/g) ?? []).length).toBe(1);
		expect(genericLink).not.toContain('M9 6l6 6l-6 6');
		expect(linkHub).toContain('stroke="currentColor"');
	});

	it('reuses the canonical Close Astro component instead of inline close SVGs', () => {
		const hud = read('src/widgets/recruiter-hud/ui/RecruiterHUD.astro');
		const mobile = read('src/widgets/header/ui/MobileNav.astro');
		const close = read('src/assets/icons/Close.astro');

		for (const source of [hud, mobile]) {
			expect(source).toContain("import CloseIcon from '@assets/icons/Close.astro'");
			expect(source).toContain('<CloseIcon class="size-5" aria-hidden="true" />');
			expect(source).not.toContain('M6 18L18 6M6 6l12 12');
		}

		expect(close).toContain('M6 6L18 18M18 6L6 18');
	});

	it('normalizes every TechPill brand mark inside the same 24px icon frame', () => {
		const techPill = read('src/shared/ui/tech-pill/TechPill.astro');

		expect(techPill).toContain('tech-pill-icon-frame flex size-6');
		expect(techPill).toContain("iconClasses = 'block size-full max-h-6 max-w-6 shrink-0'");
		expect(techPill).toContain('<Icon class={iconClasses} aria-hidden="true" />');
	});

	it('uses official .NET and C# artwork instead of custom approximations', () => {
		const dotnet = read('src/assets/technologies/DotNet.astro');
		const csharp = read('src/assets/technologies/CSharp.astro');

		expect(dotnet).toContain('Official .NET logo from dotnet/brand');
		expect(dotnet).toContain('viewBox="0 0 456 456"');
		expect(dotnet).toContain('<rect width="456" height="456" fill="#512BD4"></rect>');

		expect(csharp).toContain('Official C# language mark from dotnet/brand');
		expect(csharp).toContain('viewBox="0 0 72 72"');
		expect(csharp).toContain('stop-color="#927BE5"');
		expect(csharp).toContain('stop-color="#512BD4"');
		expect(csharp).not.toContain('stroke="currentColor"');
	});

	it('keeps the Core Stack on the current official product marks', () => {
		const techStack = read('src/widgets/tech-stack/ui/TechStack.astro');
		const angular = read('src/assets/technologies/Angular.astro');
		const typeScript = read('src/assets/technologies/TypeScript.astro');
		const astro = read('src/assets/technologies/AstroIcon.astro');
		const postgres = read('src/assets/technologies/PostgreSQL.astro');
		const playwright = read('src/assets/technologies/Playwright.astro');
		const githubActions = read('src/assets/technologies/GitHubActions.astro');

		for (const asset of [
			'DotNet.astro',
			'CSharp.astro',
			'Angular.astro',
			'TypeScript.astro',
			'AstroIcon.astro',
			'PostgreSQL.astro',
			'Playwright.astro',
			'GitHubActions.astro',
		]) {
			expect(techStack).toContain(`@assets/technologies/${asset}`);
		}

		// Angular v17+ gradient shield from the current Angular press kit.
		expect(angular).toContain('viewBox="0 0 242 256"');
		expect(angular).toContain('stop-color="#E40035"');
		expect(angular).toContain('stop-color="#6C00F5"');

		// TypeScript primary blue mark from typescriptlang.org/branding.
		expect(typeScript).toContain('viewBox="0 0 256 256"');
		expect(typeScript).toContain('fill="#3178C6"');

		// Astro 2023+ official logomark geometry and brand orange.
		expect(astro).toContain('viewBox="0 0 256 366"');
		expect(astro).toContain('fill="#FF5D01"');

		// PostgreSQL three-color Slonik elephant mark.
		expect(postgres).toContain('viewBox="0 0 256 264"');
		expect(postgres).toContain('fill="#336791"');

		// Playwright site logo, normalized to a 24px SVG coordinate system.
		expect(playwright).toContain('viewBox="0 0 24 24"');
		expect(playwright).toContain('fill="#E2574C"');
		expect(playwright).toContain('fill="#2EAD33"');

		// GitHub Actions product mark used by the Actions sub-brand.
		expect(githubActions).toContain('viewBox="0 0 24 24"');
		expect(githubActions).toContain('fill="#2088FF"');
	});
});
