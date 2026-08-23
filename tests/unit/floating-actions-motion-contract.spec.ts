import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const recruiterHud = readFileSync('src/widgets/recruiter-hud/ui/RecruiterHUD.astro', 'utf8');
const contactRail = readFileSync(
	'src/widgets/contact-sidebar/ui/ContactSidebar.astro',
	'utf8'
);

describe('Floating quick links motion contract', () => {
	it('animates Recruiter HUD open/close and Footer takeover without display toggling', () => {
		expect(recruiterHud).toContain("data-open=\"false\"");
		expect(recruiterHud).toContain("data-footer-hidden=\"false\"");
		expect(recruiterHud).toContain(".recruiter-hud[data-open='true'] .recruiter-panel");
		expect(recruiterHud).toContain(".recruiter-hud[data-footer-hidden='true']");
		expect(recruiterHud).toContain('opacity 180ms ease-out');
		expect(recruiterHud).toContain('transform 220ms cubic-bezier');
		expect(recruiterHud).toContain('@media (prefers-reduced-motion: reduce)');
		expect(recruiterHud).not.toContain("panel.classList.toggle('hidden'");
	});

	it('keeps the Home contact rail visible initially, collapsible after scroll and hover/focus revealable', () => {
		expect(contactRail).toContain("Astro.url.pathname === '/' || Astro.url.pathname === '/es/'");
		expect(contactRail).toContain('const COLLAPSE_SCROLL_OFFSET = 96');
		expect(contactRail).toContain("data-collapsed=\"false\"");
		expect(contactRail).toContain(".contact-sidebar[data-collapsed='true'] .contact-sidebar-rail");
		expect(contactRail).toContain("root.addEventListener('pointerenter'");
		expect(contactRail).toContain("root.addEventListener('focusin'");
		expect(contactRail).toContain("window.addEventListener('scroll', syncFromScroll, { passive: true })");
		expect(contactRail).toContain('rail.inert = collapsed');
		expect(contactRail).toContain('@media (prefers-reduced-motion: reduce)');
	});
});
