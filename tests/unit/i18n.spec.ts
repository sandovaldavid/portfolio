import { describe, expect, it } from 'vitest';
import { DEFAULT_LANGUAGE, getLanguageFromLocale, Language } from '@shared/config/i18n';

describe('getLanguageFromLocale', () => {
	it.each([
		['en', Language.ENGLISH],
		['es', Language.SPANISH],
	] as const)('converts Astro locale %s to the typed language', (locale, expected) => {
		expect(getLanguageFromLocale(locale)).toBe(expected);
	});

	it.each([undefined, '', 'fr', 'english'])(
		'uses the configured default for unsupported locale %s',
		locale => {
			expect(getLanguageFromLocale(locale)).toBe(DEFAULT_LANGUAGE);
		}
	);
});
