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

	it('uses one document snapshot crossfade instead of transitioning the DOM tree', () => {
		expect(themeToggle).toContain('startViewTransition');
		expect(globalStyles).toContain('html.theme-transition::view-transition-old(root)');
		expect(globalStyles).toContain('html.theme-transition::view-transition-new(root)');
		expect(globalStyles).toContain('theme-crossfade-old 180ms ease-out both');
		expect(globalStyles).toContain('theme-crossfade-new 180ms ease-out both');
		expect(globalStyles).not.toContain('html.theme-transition body *');
		expect(globalStyles).not.toContain('transition-property: background-color');
	});

	it('does not add manual frame or forced-layout latency before changing theme state', () => {
		expect(themeToggle).not.toContain('requestAnimationFrame');
		expect(themeToggle).not.toContain('cancelAnimationFrame');
		expect(themeToggle).not.toContain('offsetWidth');
	});

	it('does not cancel an unrelated Astro navigation view transition', () => {
		expect(themeToggle).toContain('if (transitionDocument.activeViewTransition)');
		expect(themeToggle).toContain('if (activeThemeTransition)');
		expect(themeToggle).toContain('previousTransition.skipTransition();');
	});

	it('crossfades only when the resolved visual palette changes', () => {
		expect(themeToggle).toContain('const currentResolvedTheme = getResolvedTheme(currentTheme);');
		expect(themeToggle).toContain('const nextResolvedTheme = getResolvedTheme(nextTheme);');
		expect(themeToggle).toContain(
			'const renderedResolvedTheme = document.documentElement.dataset.themeResolved;'
		);
		expect(themeToggle).toContain('currentResolvedTheme === nextResolvedTheme');
		expect(themeToggle).toContain('renderedResolvedTheme === nextResolvedTheme');
		expect(themeToggle).toContain('applyThemePreference(currentTheme, nextTheme);');
	});

	it('keeps rapid cyclic input state-correct even while a snapshot is pending', () => {
		expect(themeToggle).toContain('let themeRequestVersion = 0;');
		expect(themeToggle).toContain('const requestVersion = ++themeRequestVersion;');
		expect(themeToggle).toContain('if (requestVersion !== themeRequestVersion) return;');
	});

	it('keeps icon geometry stable while snapshotting theme states', () => {
		expect(themeToggle).toContain('theme-toggle-icon');
		expect(themeToggle).toContain('icon.dataset.themeActive');
		expect(themeToggle).toContain('position: absolute;');
		expect(themeToggle).toContain('inset: 0;');
		expect(themeToggle).not.toContain('button.animate(');
	});

	it('keeps motion optional and independent from state correctness', () => {
		expect(themeToggle).toContain("window.matchMedia('(prefers-reduced-motion: reduce)')");
		expect(themeToggle).toContain(
			'if (reducedMotionMedia.matches || !transitionDocument.startViewTransition)'
		);
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
