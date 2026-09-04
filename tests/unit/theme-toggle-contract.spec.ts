import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const themeToggle = readFileSync('src/features/theme-toggle/ui/ThemeToggle.astro', 'utf8');

describe('theme toggle runtime contract', () => {
	it('keeps the three-state cyclic preference model', () => {
		expect(themeToggle).toContain(
			"const THEME_ORDER: ThemePreference[] = ['light', 'dark', 'system'];"
		);
		expect(themeToggle).toContain("type ResolvedTheme = 'light' | 'dark';");
		expect(themeToggle).toContain('data-theme-current');
	});

	it('smooths only semantic visual properties during a theme change', () => {
		expect(themeToggle).toContain("root.classList.add('theme-transition')");
		expect(themeToggle).toContain('background-color, border-color, color, fill, stroke, box-shadow');
		expect(themeToggle).not.toContain('transition-property: all');
		expect(themeToggle).toContain("window.matchMedia('(prefers-reduced-motion: reduce)')");
	});

	it('animates the control without making motion part of state correctness', () => {
		expect(themeToggle).toContain('button.animate(');
		expect(themeToggle).toContain('activeIcon?.animate(');
		expect(themeToggle).toContain("if (reducedMotionMedia.matches) return;");
	});

	it('keeps a runtime favicon aligned with the resolved portfolio theme', () => {
		expect(themeToggle).toContain("link[data-theme-favicon-active]");
		expect(themeToggle).toContain('`/favicon.${resolvedTheme}.svg`');
		expect(themeToggle).toContain('document.head.append(favicon)');
		expect(themeToggle).toContain('document.documentElement.dataset.themeResolved = resolvedTheme;');
	});
});
