import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');
const readJson = <T>(path: string): T => JSON.parse(readSource(path)) as T;

const backToTop = readSource('src/features/back-to-top/ui/BackToTop.astro');
const footer = readSource('src/widgets/footer/ui/Footer.astro');
const printStyles = readSource('src/app/styles/print.css');
const englishAccessibility = readJson<Record<string, string>>(
	'src/shared/config/i18n/locales/en/accessibility.json'
);
const spanishAccessibility = readJson<Record<string, string>>(
	'src/shared/config/i18n/locales/es/accessibility.json'
);

describe('global back-to-top accessibility contract', () => {
	it('mounts once through the global Footer widget and stays out of print output', () => {
		expect(footer).toContain("import { BackToTop } from '@features/back-to-top'");
		expect(footer).toContain('<BackToTop />');
		expect(printStyles).toContain('#back-to-top');
	});

	it('reveals after one viewport and remains keyboard/focus safe', () => {
		expect(backToTop).toContain("createScopedUiTranslator(lang, 'accessibility')");
		expect(backToTop).toContain("tAccessibility('backToTop')");
		expect(backToTop).toContain('window.scrollY > window.innerHeight');
		expect(backToTop).toContain('button.tabIndex = visible ? 0 : -1');
		expect(backToTop).toContain('button.inert = !visible');
		expect(backToTop).toContain("behavior: reducedMotion.matches ? 'auto' : 'smooth'");
		expect(backToTop).toContain("document.getElementById('main-content')");
		expect(backToTop).toContain('main.focus({ preventScroll: true })');
		expect(backToTop).toContain('backToTopCleanup?.()');
		expect(backToTop).toContain("window.removeEventListener('scroll', updateVisibility)");
	});

	it('keeps the accessible name localized with catalog parity', () => {
		expect(englishAccessibility.backToTop).toBe('Back to top');
		expect(spanishAccessibility.backToTop).toBe('Volver al inicio');
		expect(Object.keys(englishAccessibility).sort()).toEqual(
			Object.keys(spanishAccessibility).sort()
		);
	});
});
