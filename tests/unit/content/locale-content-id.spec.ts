import { describe, expect, it } from 'vitest';
import { Language } from '@shared/config/i18n';
import {
	getContentLanguage,
	isContentForLanguage,
	stripContentLocalePrefix,
} from '@shared/lib/content';

describe('stripContentLocalePrefix', () => {
	it.each([
		['en/building-with-astro', 'building-with-astro'],
		['es/construyendo-con-astro', 'construyendo-con-astro'],
		['en/nested/path', 'nested/path'],
		['es/', ''],
	])('removes the supported locale prefix from %s', (id, expected) => {
		expect(stripContentLocalePrefix(id)).toBe(expected);
	});

	it.each(['fr/future-post', 'english/post', 'post-without-locale', ''])(
		'preserves unsupported or absent locale prefixes in %s',
		id => {
			expect(stripContentLocalePrefix(id)).toBe(id);
		}
	);
});

describe('getContentLanguage', () => {
	it('resolves supported editorial locale folders', () => {
		expect(getContentLanguage('en/post')).toBe(Language.ENGLISH);
		expect(getContentLanguage('es/post')).toBe(Language.SPANISH);
	});

	it.each(['fr/post', 'english/post', 'en-post', ''])(
		'rejects unsupported content IDs %s',
		id => {
			expect(getContentLanguage(id)).toBeUndefined();
		}
	);
});

describe('isContentForLanguage', () => {
	it('matches entries that belong to the requested language folder', () => {
		expect(isContentForLanguage('en/post', Language.ENGLISH)).toBe(true);
		expect(isContentForLanguage('es/post', Language.SPANISH)).toBe(true);
	});

	it('rejects entries from another supported language', () => {
		expect(isContentForLanguage('es/post', Language.ENGLISH)).toBe(false);
		expect(isContentForLanguage('en/post', Language.SPANISH)).toBe(false);
	});

	it.each(['english/post', 'en-post', 'en', '/en/post', ''])(
		'requires an exact locale directory prefix for %s',
		id => {
			expect(isContentForLanguage(id, Language.ENGLISH)).toBe(false);
		}
	);
});
