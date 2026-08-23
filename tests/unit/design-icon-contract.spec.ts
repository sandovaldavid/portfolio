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
});
