import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');

const englishBlogRoute = readSource('src/pages/blog.astro');
const spanishBlogRoute = readSource('src/pages/es/blog.astro');
const englishDevlogRoute = readSource('src/pages/devlog.astro');
const spanishDevlogRoute = readSource('src/pages/es/devlog.astro');

const englishBlogDetailRoute = readSource('src/pages/blog/[slug].astro');
const spanishBlogDetailRoute = readSource('src/pages/es/blog/[slug].astro');
const englishDevlogDetailRoute = readSource('src/pages/devlog/[slug].astro');
const spanishDevlogDetailRoute = readSource('src/pages/es/devlog/[slug].astro');

const blogList = readSource('src/widgets/blog/ui/BlogList.astro');
const devlogList = readSource('src/widgets/devlog/ui/DevlogList.astro');
const blogDetail = readSource('src/widgets/blog/ui/BlogDetail.astro');
const devlogDetail = readSource('src/widgets/devlog/ui/DevlogDetail.astro');
const editorialCard = readSource('src/shared/ui/editorial-card/EditorialCard.astro');

describe('Editorial and Devlog catalog composition contract', () => {
	it('uses flush content layout across all blog and devlog routes', () => {
		for (const route of [
			englishBlogRoute,
			spanishBlogRoute,
			englishDevlogRoute,
			spanishDevlogRoute,
			englishBlogDetailRoute,
			spanishBlogDetailRoute,
			englishDevlogDetailRoute,
			spanishDevlogDetailRoute,
		]) {
			expect(route).toContain('contentLayout="flush"');
		}
	});

	it('maintains fixed header clearance (pt-18) on list and detail widgets', () => {
		expect(blogList).toContain('class="w-full pt-18"');
		expect(devlogList).toContain('class="w-full pt-18"');
		expect(blogDetail).toContain('class="w-full pt-18"');
		expect(devlogDetail).toContain('class="w-full pt-18"');
	});

	it('equips BlogList with open editorial intro, RSS feed access, and snapshot metrics', () => {
		expect(blogList).toContain('id="blog-list-title"');
		expect(blogList).toContain("lang === 'es' ? '/es/rss.xml' : '/rss.xml'");
		expect(blogList).toContain("tBlog('snapshotLabel')");
		expect(blogList).toContain("tBlog('snapshotArticles')");
		expect(blogList).toContain("tBlog('snapshotTopics')");
		expect(blogList).toContain("tBlog('snapshotLatest')");
		expect(blogList).toContain('grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:gap-8');
	});

	it('equips DevlogList with milestone snapshot and 2-column grid', () => {
		expect(devlogList).toContain('id="devlog-list-title"');
		expect(devlogList).toContain("tDevlog('snapshotLabel')");
		expect(devlogList).toContain("tDevlog('snapshotMilestones')");
		expect(devlogList).toContain("tDevlog('snapshotActiveStatus')");
		expect(devlogList).toContain("tDevlog('snapshotCurrentBaseline')");
		expect(devlogList).toContain('grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:gap-8');
	});

	it('structures detail views with 1280px aligned reading column, retro code blocks, and navigation', () => {
		expect(blogDetail).toContain('max-w-320');
		expect(devlogDetail).toContain('max-w-320');
		expect(blogDetail).not.toContain('max-w-190');
		expect(devlogDetail).not.toContain('max-w-190');
		expect(blogDetail).toContain('articleBodyClasses');
		expect(devlogDetail).toContain('articleBodyClasses');
		expect(blogDetail).toContain('authorRole');
		expect(blogDetail).toContain('authorBio');
		expect(blogDetail).toContain('previousPost');
		expect(blogDetail).toContain('nextPost');
		expect(devlogDetail).toContain('previousPost');
		expect(devlogDetail).toContain('nextPost');
		expect(devlogDetail).toContain('manifestLabel');
	});

	it('lets EditorialCard fill responsive grid columns naturally without rigid width caps', () => {
		expect(editorialCard).not.toContain('max-w-[520px]');
		expect(editorialCard).not.toContain('max-w-[340px]');
		expect(editorialCard).toContain('min-h-[360px] lg:min-h-[300px]');
	});

	it('keeps editorial surfaces free of inline presentation and raw palette literals', () => {
		const rawPaletteUtility =
			/\b(?:bg|text|border|ring|from|via|to)-(?:white|black|primary-\d+|neutral-\d+|success-\d+|warning-\d+|error-\d+)\b/g;
		for (const source of [blogList, devlogList, blogDetail, devlogDetail, editorialCard]) {
			expect(source.match(rawPaletteUtility) ?? []).toEqual([]);
			expect(source).not.toMatch(/\sstyle\s*=/i);
		}
	});
});
