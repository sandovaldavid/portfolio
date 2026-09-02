import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');

describe('navigation lockup contract', () => {
	it('uses Logo v2 with David Sandoval as the verbal identifier', () => {
		const source = readSource('src/shared/ui/brand-logo/BrandLogo.astro');
		const lightLogo = readSource('public/brand/logo-primary-light.svg');
		const darkLogo = readSource('public/brand/logo-primary-dark.svg');

		expect(source).toContain('src="/brand/logo-primary-dark.svg"');
		expect(source).toContain('`/brand/logo-primary-${mode}.svg`');
		expect(source).toContain('David Sandoval');
		expect(source).toContain('brand-logo-name');
		expect(source).not.toContain('&lt;sandovaldavid/&gt;');
		expect(source).not.toContain('brand-logo-signature');
		expect(source).toContain('font-gaming-mono');
		expect(source).toContain('text-base');
		expect(source).toContain('leading-[22px]');
		expect(source).toContain('tracking-[1px]');
		expect(source).toContain('h-11');
		expect(source).toContain(':focus-visible');
		expect(source).toContain('outline-offset: -2px');
		expect(source).toContain('@media (prefers-reduced-motion: reduce)');
		expect(source).toContain('data-brand-logo');
		expect(source).toContain('MutationObserver');
		expect(source).toContain("setAttribute('src', source)");
		expect(source).not.toContain('sm:w-[210px]');

		for (const logo of [lightLogo, darkLogo]) {
			expect(logo).toContain('M265.3 50.9');
			expect(logo).not.toContain('<circle');
			expect(logo).not.toContain('M190 170L104 256L190 342');
		}

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
		expect(header).toContain('BrandLogo');
		expect(header).toContain("from '@shared/ui'");
	});
});
