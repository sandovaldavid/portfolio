import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');
const readJson = <T>(path: string): T => JSON.parse(readSource(path)) as T;

describe('localized SEO, RSS and structured metadata', () => {
	it('keeps the metadata catalog mirrored and meaningfully localized', () => {
		const english = readJson<Record<string, string>>(
			'src/shared/config/i18n/locales/en/metadata.json'
		);
		const spanish = readJson<Record<string, string>>(
			'src/shared/config/i18n/locales/es/metadata.json'
		);

		expect(Object.keys(spanish).sort()).toEqual(Object.keys(english).sort());
		expect(spanish.siteTitle).toContain('Ingeniero de Software');
		expect(spanish.siteDescription).not.toBe(english.siteDescription);
		expect(spanish.rssFeedDescription).not.toBe(english.rssFeedDescription);
	});

	it('assembles locale-aware social, alternate and structured metadata in Layout', () => {
		const layout = readSource('src/app/layouts/Layout.astro');

		expect(layout).toContain("createScopedUiTranslator(lang, 'metadata')");
		expect(layout).toContain('og:locale:alternate');
		expect(layout).toContain('twitter:image:alt');
		expect(layout).toContain('BlogPosting');
		expect(layout).toContain('TechArticle');
		expect(layout).toContain('ScholarlyArticle');
		expect(layout).toContain('SoftwareSourceCode');
		expect(layout).toContain('breadcrumbLabel');
		expect(layout).toContain('const structuredTitle = breadcrumbLabel ?? title;');
		expect(layout).toContain('name: structuredTitle');
		expect(layout).toContain('headline: structuredTitle');
		expect(layout).not.toContain("'@type': 'ScholarlyArticle',\n\t\t\tname: title");
	});

	it('requires dynamic routes to provide semantic metadata from canonical content', () => {
		const routes = {
			blog: ['src/pages/blog/[slug].astro', 'src/pages/es/blog/[slug].astro'],
			devlog: ['src/pages/devlog/[slug].astro', 'src/pages/es/devlog/[slug].astro'],
			project: ['src/pages/projects/[slug].astro', 'src/pages/es/projects/[slug].astro'],
		};

		for (const path of routes.blog) {
			const source = readSource(path);
			expect(source).toContain('pageType="blog"');
			expect(source).toContain('publishedTime={post.data.pubDate}');
			expect(source).toContain('breadcrumbLabel={post.data.title}');
			expect(source).toContain('imageAlt={post.data.title}');
		}

		for (const path of routes.devlog) {
			const source = readSource(path);
			expect(source).toContain('pageType="devlog"');
			expect(source).toContain('publishedTime={post.data.pubDate}');
			expect(source).toContain('breadcrumbLabel={post.data.title}');
		}

		for (const path of routes.project) {
			const source = readSource(path);
			expect(source).toContain('pageType="project"');
			expect(source).toContain('imageAlt={project.imageAlt}');
			expect(source).toContain('breadcrumbLabel={project.title}');
		}
	});

	it('owns RSS metadata in the typed catalog and declares each feed language', () => {
		const englishRss = readSource('src/pages/rss.xml.ts');
		const spanishRss = readSource('src/pages/es/rss.xml.ts');

		for (const source of [englishRss, spanishRss]) {
			expect(source).toContain("createScopedUiTranslator(lang, 'metadata')");
			expect(source).toContain("tMetadata('rssFeedTitle')");
			expect(source).toContain("tMetadata('rssFeedDescription')");
			expect(source).not.toContain('siteConfig.defaultDescription');
		}

		expect(englishRss).toContain("customData: '<language>en</language>'");
		expect(spanishRss).toContain("customData: '<language>es</language>'");
	});
});
