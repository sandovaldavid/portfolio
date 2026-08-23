import { describe, expect, expectTypeOf, it } from 'vitest';
import {
	assertKeyParity,
	assertNoMissingTranslations,
	assertUniqueModules,
	createScopedUiTranslator,
	createUiTranslator,
	flattenCatalog,
	getUiCatalog,
	getUiCatalogNamespace,
	Language,
	MissingUiTranslationError,
	translateUi,
	UI_CATALOG_MODULES,
	uiCatalogs,
	validateUiCatalogs,
	type UiCatalogKey,
} from '@shared/config/i18n';

describe('granular UI catalogs', () => {
	it('defines unique mirrored catalog modules', () => {
		expect(new Set(UI_CATALOG_MODULES).size).toBe(UI_CATALOG_MODULES.length);
		expect(validateUiCatalogs()).toBe(true);
	});

	it('keeps English and Spanish keys in parity', () => {
		const englishKeys = Object.keys(uiCatalogs[Language.ENGLISH]).sort();
		const spanishKeys = Object.keys(uiCatalogs[Language.SPANISH]).sort();

		expect(spanishKeys).toEqual(englishKeys);
	});

	it('contains only non-empty scalar strings', () => {
		for (const catalog of Object.values(uiCatalogs)) {
			for (const value of Object.values(catalog)) {
				expect(typeof value).toBe('string');
				expect(value.trim().length).toBeGreaterThan(0);
			}
		}
	});

	it('resolves typed translations without a fallback locale', () => {
		const translateEnglish = createUiTranslator(Language.ENGLISH);
		const translateSpanish = createUiTranslator(Language.SPANISH);

		expect(translateEnglish('navigation.projects')).toBe('Projects');
		expect(translateSpanish('navigation.projects')).toBe('Proyectos');
		expect(translateSpanish('sections.hero.title')).not.toBe(
			translateEnglish('sections.hero.title')
		);
	});

	it('returns a typed namespace and scoped translator', () => {
		const navigation = getUiCatalogNamespace(Language.SPANISH, 'navigation');
		const translateHero = createScopedUiTranslator(Language.ENGLISH, 'sections.hero');

		expect(navigation.projects).toBe('Proyectos');
		expect(translateHero('roleLabel')).toBe('ROLE');
	});

	it('fails loudly for a missing key instead of returning a key or English fallback', () => {
		expect(() =>
			translateUi(Language.SPANISH, 'navigation.missing' as UiCatalogKey)
		).toThrowError(MissingUiTranslationError);
	});

	it('exposes a readonly catalog with inferred leaf keys', () => {
		const catalog = getUiCatalog(Language.ENGLISH);
		const key: UiCatalogKey = 'sections.techStack.sectionTitle';

		expect(catalog[key]).toBe('CORE STACK');
		expectTypeOf<UiCatalogKey>().toMatchTypeOf<string>();
	});

	describe('catalog integrity guards', () => {
		it('rejects duplicate module namespaces', () => {
			expect(() => assertUniqueModules(['common', 'navigation', 'common'])).toThrowError(
				'UI catalog module namespaces must be unique.'
			);
			expect(() => assertUniqueModules(['common', 'navigation'])).not.toThrow();
		});

		it('rejects mismatched key counts between locales', () => {
			expect(() => assertKeyParity(['a', 'b'], ['a'])).toThrowError(
				'English and Spanish UI catalogs must contain the same number of keys.'
			);
		});

		it('rejects a key mismatch at the same sorted index', () => {
			expect(() => assertKeyParity(['a', 'b'], ['a', 'c'])).toThrowError(
				'UI catalog key parity failed at "b".'
			);
			expect(() => assertKeyParity(['a', 'b'], ['a', 'b'])).not.toThrow();
		});

		it('rejects a non-object catalog namespace', () => {
			expect(() => flattenCatalog('not-an-object')).toThrowError(
				'UI catalog namespace "<root>" must be an object.'
			);
			expect(() => flattenCatalog('not-an-object', 'sections')).toThrowError(
				'UI catalog namespace "sections" must be an object.'
			);
		});

		it('rejects a non-scalar catalog value', () => {
			expect(() => flattenCatalog({ hero: { title: 42 } })).toThrowError(
				'UI catalog value "hero.title" must be a scalar string.'
			);
		});

		it('rejects a blank translation value', () => {
			expect(() =>
				assertNoMissingTranslations({
					[Language.ENGLISH]: { 'navigation.projects': '   ' },
				})
			).toThrowError(MissingUiTranslationError);
			expect(() =>
				assertNoMissingTranslations({
					[Language.ENGLISH]: { 'navigation.projects': 'Projects' },
				})
			).not.toThrow();
		});
	});
});
