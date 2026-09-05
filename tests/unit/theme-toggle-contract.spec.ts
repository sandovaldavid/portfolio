import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const themeToggle = readFileSync('src/features/theme-toggle/ui/ThemeToggle.astro', 'utf8');
const globalStyles = readFileSync('src/app/styles/global.css', 'utf8');

describe('theme toggle runtime contract', () => {
	it('keeps the three-state cyclic preference model', () => {
		expect(themeToggle).toContain(
			"const THEME_ORDER: ThemePreference[] = ['light', 'dark', 'system'];"
		);
		expect(themeToggle).toContain("type ResolvedTheme = 'light' | 'dark';");
		expect(themeToggle).toContain('button.dataset.themeCurrent = theme;');
	});

	it('smooths only cheap semantic color properties during a theme change', () => {
		expect(themeToggle).toContain("root.classList.add('theme-transition')");
		expect(globalStyles).toContain(
			'transition-property: background-color, border-color, color, fill, stroke;'
		);
		expect(globalStyles).not.toContain('transition-property: all');
		expect(globalStyles).not.toContain('stroke, box-shadow');
		expect(themeToggle).toContain("window.matchMedia('(prefers-reduced-motion: reduce)')");
	});

	it('owns the page-wide transition in application styles', () => {
		expect(globalStyles).toContain('html.theme-transition,');
		expect(globalStyles).toContain('html.theme-transition body *');
	});

	it('applies the semantic theme change synchronously after transition styles are ready', () => {
		expect(themeToggle).toContain('root.offsetWidth');
		expect(themeToggle).toContain('applyTheme();');
		expect(themeToggle).not.toContain('requestAnimationFrame');
		expect(themeToggle).not.toContain('cancelAnimationFrame');
	});

	it('crossfades the outgoing and incoming icons without changing button geometry', () => {
		expect(themeToggle).toContain('theme-toggle-icon');
		expect(themeToggle).toContain('icon.dataset.themeActive');
		expect(themeToggle).toContain('outgoingIcon?.animate(');
		expect(themeToggle).toContain('incomingIcon?.animate(');
		expect(themeToggle).toContain("{ opacity: 0, transform: 'rotate(18deg) scale(0.72)' }");
		expect(themeToggle).toContain("{ opacity: 0, transform: 'rotate(-18deg) scale(0.72)' }");
		expect(themeToggle).toContain("{ opacity: 1, transform: 'rotate(0deg) scale(1)' }");
		expect(themeToggle).toContain('position: absolute;');
		expect(themeToggle).toContain('inset: 0;');
	});

	it('keeps motion optional and independent from state correctness', () => {
		expect(themeToggle).toContain('button.animate(');
		expect(themeToggle).toContain('if (reducedMotionMedia.matches) return;');
		expect(themeToggle).toContain('syncThemeState();');
	});

	it('keeps a runtime favicon aligned with the resolved portfolio theme', () => {
		expect(themeToggle).toContain('link[data-theme-favicon-active]');
		expect(themeToggle).toContain('`/favicon.${resolvedTheme}.svg`');
		expect(themeToggle).toContain('document.head.append(favicon)');
		expect(themeToggle).toContain(
			'document.documentElement.dataset.themeResolved = resolvedTheme;'
		);
	});
});
