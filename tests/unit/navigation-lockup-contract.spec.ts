import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');

describe('navigation lockup contract', () => {
	it('uses the approved assets and removes the legacy terminal animation', () => {
		const source = readSource('src/widgets/header/ui/BrandLogo.astro');

		expect(source).toContain('src="/brand/logo-primary-dark.svg"');
		expect(source).toContain('`/brand/logo-primary-${mode}.svg`');
		expect(source).toContain('&lt;sandovaldavid/&gt;');
		expect(source).toContain('font-gaming-mono');
		expect(source).toContain('text-base');
		expect(source).toContain('leading-[22px]');
		expect(source).toContain('tracking-[1px]');
		expect(source).toContain('h-11');
		expect(source).toContain(':focus-visible');
		expect(source).toContain('@media (prefers-reduced-motion: reduce)');
		expect(source).toContain('data-brand-logo');
		expect(source).toContain('MutationObserver');
		expect(source).toContain("setAttribute('src', source)");

		for (const forbidden of [
			'prompt-symbol',
			'logo-typing',
			'typing-load',
			'typing-hover',
			'blink-caret',
			'prompt-pulse',
			'glitch',
			'logo-effect-magenta',
			'logo-effect-cyan',
			'mouseenter',
			'mouseleave',
			'style.animation',
			'min-width: 19ch',
		]) {
			expect(source, forbidden).not.toContain(forbidden);
		}
	});

	it('keeps the accessible name in the typed EN and ES catalogs', () => {
		const english = JSON.parse(
			readSource('src/shared/config/i18n/locales/en/accessibility.json')
		) as Record<string, string>;
		const spanish = JSON.parse(
			readSource('src/shared/config/i18n/locales/es/accessibility.json')
		) as Record<string, string>;
		const header = readSource('src/widgets/header/ui/Header.astro');

		expect(english.brandHomeLink).toBe('David Sandoval — Home');
		expect(spanish.brandHomeLink).toBe('David Sandoval — Inicio');
		expect(header).toContain("tAccessibility('brandHomeLink')");
	});

	it('uses the tablet-safe navigation breakpoint without changing FSD ownership', () => {
		const header = readSource('src/widgets/header/ui/Header.astro');
		const desktopNav = readSource('src/widgets/header/ui/DesktopNav.astro');
		const mobileNav = readSource('src/widgets/header/ui/MobileNav.astro');

		expect(header).toContain('hidden lg:flex flex-1 min-w-0 justify-center');
		expect(header).toContain('flex lg:hidden items-center');
		expect(desktopNav).toContain('hidden lg:flex');
		expect(mobileNav).toContain('flex lg:hidden');
		expect(header).toContain("import BrandLogo from './BrandLogo.astro'");
	});
});
