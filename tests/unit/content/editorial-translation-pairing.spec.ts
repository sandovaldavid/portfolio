import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Language } from '@shared/config/i18n';
import { assertUniqueTranslationKeys, findTranslationCounterpart } from '@shared/lib/content';

interface TestEntry {
	id: string;
	data: {
		translationKey: string;
		draft?: boolean;
	};
}

const makeEntry = (id: string, translationKey: string, draft = false): TestEntry => ({
	id,
	data: { translationKey, draft },
});

function readTranslationKeys(collection: 'blog' | 'devlog') {
	return (['en', 'es'] as const).flatMap(locale => {
		const directory = `src/content/${collection}/${locale}`;
		return readdirSync(directory)
			.filter(file => file.endsWith('.md') || file.endsWith('.mdx'))
			.map(file => {
				const content = readFileSync(`${directory}/${file}`, 'utf8');
				const match = content.match(/^translationKey:\s*([a-z0-9-]+)$/m);
				return { locale, file, translationKey: match?.[1] };
			});
	});
}

describe('editorial translation pairing', () => {
	it('allows one stable identity in each supported locale', () => {
		const entries = [
			makeEntry('en/english-slug', 'shared-article'),
			makeEntry('es/slug-localizado', 'shared-article'),
		];

		expect(() => assertUniqueTranslationKeys(entries, 'blog')).not.toThrow();
	});

	it('rejects duplicate identities inside the same locale', () => {
		const entries = [
			makeEntry('en/first-slug', 'duplicate-article'),
			makeEntry('en/second-slug', 'duplicate-article'),
		];

		expect(() => assertUniqueTranslationKeys(entries, 'blog')).toThrow(
			'Duplicate translation key "duplicate-article" for blog locale "en"'
		);
	});

	it('resolves a counterpart by identity even when localized slugs differ', () => {
		const source = makeEntry('en/english-slug', 'shared-article');
		const spanish = makeEntry('es/slug-localizado', 'shared-article');

		expect(findTranslationCounterpart([source, spanish], source, Language.SPANISH)).toBe(
			spanish
		);
	});

	it('treats a draft counterpart as unavailable when the caller excludes drafts', () => {
		const source = makeEntry('en/published', 'shared-article');
		const spanishDraft = makeEntry('es/borrador', 'shared-article', true);

		expect(
			findTranslationCounterpart(
				[source, spanishDraft],
				source,
				Language.SPANISH,
				entry => !entry.data.draft
			)
		).toBeUndefined();
	});

	it('returns undefined when a translation is intentionally absent', () => {
		const source = makeEntry('en/single-language', 'single-language');
		expect(findTranslationCounterpart([source], source, Language.SPANISH)).toBeUndefined();
	});

	it('requires an explicit stable identity in every blog and devlog entry', () => {
		for (const collection of ['blog', 'devlog'] as const) {
			const entries = readTranslationKeys(collection);
			expect(entries.length).toBeGreaterThan(0);
			for (const entry of entries) {
				expect(entry.translationKey, `${collection}/${entry.locale}/${entry.file}`).toMatch(
					/^[a-z0-9-]+$/
				);
			}
		}
	});

	it('pairs published articles and devlog entries while allowing the draft fixture to stand alone', () => {
		const blogKeys = readTranslationKeys('blog');
		const devlogKeys = readTranslationKeys('devlog');

		const countByKey = (entries: typeof blogKeys) =>
			entries.reduce<Record<string, number>>((counts, entry) => {
				if (entry.translationKey) {
					counts[entry.translationKey] = (counts[entry.translationKey] ?? 0) + 1;
				}
				return counts;
			}, {});

		expect(countByKey(blogKeys)).toEqual({
			'building-this-portfolio-with-astro-and-fsd': 2,
			'predicting-oss-abandonment-with-bilstm': 2,
			'draft-rss-test': 1,
		});
		expect(Object.values(countByKey(devlogKeys)).every(count => count === 2)).toBe(true);
	});

	it('disables an unavailable target locale instead of constructing a link', () => {
		const picker = readFileSync('src/features/language-picker/ui/LanguagePicker.astro', 'utf8');
		const detailRoutes = [
			'src/pages/blog/[slug].astro',
			'src/pages/es/blog/[slug].astro',
			'src/pages/devlog/[slug].astro',
			'src/pages/es/devlog/[slug].astro',
		];

		expect(picker).toContain('const path = localizedPaths[lang]');
		expect(picker).toContain('const isUnavailable = !path');
		expect(picker).toContain('<button');
		expect(picker).toContain('disabled');
		expect(picker).toContain("tAccessibility('translationUnavailable')");
		for (const route of detailRoutes) {
			expect(readFileSync(route, 'utf8'), route).toContain('{localizedPaths}');
		}
	});

	it('keeps RSS feeds locale-specific and production drafts excluded', () => {
		const englishRss = readFileSync('src/pages/rss.xml.ts', 'utf8');
		const spanishRss = readFileSync('src/pages/es/rss.xml.ts', 'utf8');
		const blogQueries = readFileSync('src/entities/blog/model/queries.ts', 'utf8');

		expect(englishRss).toContain('const lang = Language.ENGLISH');
		expect(englishRss).toContain("createScopedUiTranslator(lang, 'metadata')");
		expect(englishRss).toContain('getBlogPosts(lang)');
		expect(englishRss).toContain("customData: '<language>en</language>'");
		expect(englishRss).toContain('link: `/blog/${getBlogSlug(post)}/`');

		expect(spanishRss).toContain('const lang = Language.SPANISH');
		expect(spanishRss).toContain("createScopedUiTranslator(lang, 'metadata')");
		expect(spanishRss).toContain('getBlogPosts(lang)');
		expect(spanishRss).toContain("customData: '<language>es</language>'");
		expect(spanishRss).toContain('link: `/es/blog/${getBlogSlug(post)}/`');

		expect(blogQueries).toContain('isContentForLanguage(post.id, lang)');
		expect(blogQueries).toContain('import.meta.env.PROD ? !post.data.draft : true');
	});
});
