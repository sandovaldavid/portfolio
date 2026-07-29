import { test, expect } from './fixtures';

interface ParsedItem {
	title: string | null;
	link: string | null;
	pubDate: string | null;
}

interface ParsedFeed {
	isRss: boolean;
	version: string | null;
	channelTitle: string | null;
	description: string | null;
	itemCount: number;
	items: ParsedItem[];
}

async function fetchFeed(page: import('@playwright/test').Page, path: string) {
	const response = await page.goto(path);
	expect(response, `GET ${path} should return a response`).not.toBeNull();
	const status = response!.status();
	const contentType = response!.headers()['content-type'] ?? '';
	const body = await response!.text();

	const parsed = await page.evaluate((xml: string): ParsedFeed => {
		const doc = new DOMParser().parseFromString(xml, 'application/xml');
		const rss = doc.documentElement;
		const channel = doc.querySelector('channel');
		const items = Array.from(doc.querySelectorAll('item')).map((item): ParsedItem => ({
			title: item.querySelector('title')?.textContent ?? null,
			link: item.querySelector('link')?.textContent ?? null,
			pubDate: item.querySelector('pubDate')?.textContent ?? null,
		}));
		return {
			isRss: rss?.tagName === 'rss',
			version: rss?.getAttribute('version') ?? null,
			channelTitle: channel?.querySelector('title')?.textContent ?? null,
			description: channel?.querySelector('description')?.textContent ?? null,
			itemCount: items.length,
			items,
		};
	}, body);

	return { status, contentType, body, parsed };
}

test.describe('RSS — EN feed (/rss.xml)', () => {
	const PATH = '/rss.xml';
	const EXPECTED_CHANNEL_TITLE = 'David Sandoval — Software Engineering Blog';
	const DRAFT_TITLE = 'RSS Draft Exclusion Fixture';
	const EN_POST_LINK_PREFIX = '/blog/';
	const ES_POST_LINK_PREFIX = '/es/blog/';

	test('returns 200 with an XML content type', async ({ page }) => {
		const { status, contentType } = await fetchFeed(page, PATH);
		expect(status, `${PATH} should return HTTP 200`).toBe(200);
		expect(contentType, `${PATH} content-type should contain xml`).toContain('xml');
	});

	test('parses as RSS 2.0 with a channel and title', async ({ page }) => {
		const { parsed } = await fetchFeed(page, PATH);
		expect(parsed.isRss, 'root element should be <rss>').toBe(true);
		expect(parsed.version, 'rss version should be 2.0').toBe('2.0');
		expect(parsed.channelTitle, 'channel title should match siteConfig').toBe(
			EXPECTED_CHANNEL_TITLE
		);
		expect(parsed.description, 'channel description should be non-empty').toBeTruthy();
	});

	test('contains at least one <item>', async ({ page }) => {
		const { parsed } = await fetchFeed(page, PATH);
		expect(parsed.itemCount, 'feed should list at least one published post').toBeGreaterThan(0);
	});

	test('every <item> has title, link, and pubDate', async ({ page }) => {
		const { parsed } = await fetchFeed(page, PATH);
		for (const [i, item] of parsed.items.entries()) {
			expect(item.title, `item[${i}].title`).toBeTruthy();
			expect(item.link, `item[${i}].link`).toBeTruthy();
			expect(item.pubDate, `item[${i}].pubDate`).toBeTruthy();
		}
	});

	test('every item link points to /blog/… (EN locale)', async ({ page }) => {
		const { parsed } = await fetchFeed(page, PATH);
		for (const [i, item] of parsed.items.entries()) {
			expect(
				item.link,
				`item[${i}] link "${item.link}" should contain "${EN_POST_LINK_PREFIX}"`
			).toContain(EN_POST_LINK_PREFIX);
			expect(
				item.link,
				`item[${i}] link "${item.link}" must NOT point at the ES locale`
			).not.toContain(ES_POST_LINK_PREFIX);
		}
	});

	test('excludes draft posts from the production feed', async ({ page }) => {
		const { parsed } = await fetchFeed(page, PATH);
		const drafts = parsed.items.filter(i => i.title === DRAFT_TITLE);
		expect(drafts, 'draft fixture must not appear in the production feed').toEqual([]);
	});

	test('feed item count matches the known published EN posts (draft excluded)', async ({
		page,
	}) => {
		const { parsed } = await fetchFeed(page, PATH);
		// 2 published EN posts live under src/content/blog/en/ as of 2026-07-04;
		// the _draft-rss-test fixture is draft:true and must be excluded.
		expect(parsed.itemCount, 'EN feed should list exactly the 2 published EN posts').toBe(2);
	});

	test('does not leak ES-only post titles (locale isolation)', async ({ page }) => {
		const { parsed } = await fetchFeed(page, PATH);
		const esOnlyTitles = ['Construyendo Este Portfolio Con Astro 6 y Feature-Sliced Design'];
		for (const title of esOnlyTitles) {
			const found = parsed.items.some(i => i.title === title);
			expect(found, `EN feed must not include ES-only title "${title}"`).toBe(false);
		}
	});
});

test.describe('RSS — ES feed (/es/rss.xml)', () => {
	const PATH = '/es/rss.xml';
	const EXPECTED_CHANNEL_TITLE = 'David Sandoval — Blog de ingeniería de software';
	const DRAFT_TITLE = 'RSS Draft Exclusion Fixture';
	const ES_POST_LINK_PREFIX = '/es/blog/';

	test('returns 200 with an XML content type', async ({ page }) => {
		const { status, contentType } = await fetchFeed(page, PATH);
		expect(status, `${PATH} should return HTTP 200`).toBe(200);
		expect(contentType, `${PATH} content-type should contain xml`).toContain('xml');
	});

	test('parses as RSS 2.0 with a channel and title', async ({ page }) => {
		const { parsed } = await fetchFeed(page, PATH);
		expect(parsed.isRss, 'root element should be <rss>').toBe(true);
		expect(parsed.version, 'rss version should be 2.0').toBe('2.0');
		expect(parsed.channelTitle, 'channel title should match siteConfig').toBe(
			EXPECTED_CHANNEL_TITLE
		);
		expect(parsed.description, 'channel description should be non-empty').toBeTruthy();
	});

	test('contains at least one <item>', async ({ page }) => {
		const { parsed } = await fetchFeed(page, PATH);
		expect(parsed.itemCount, 'feed should list at least one published post').toBeGreaterThan(0);
	});

	test('every <item> has title, link, and pubDate', async ({ page }) => {
		const { parsed } = await fetchFeed(page, PATH);
		for (const [i, item] of parsed.items.entries()) {
			expect(item.title, `item[${i}].title`).toBeTruthy();
			expect(item.link, `item[${i}].link`).toBeTruthy();
			expect(item.pubDate, `item[${i}].pubDate`).toBeTruthy();
		}
	});

	test('every item link points to /es/blog/… (ES locale)', async ({ page }) => {
		const { parsed } = await fetchFeed(page, PATH);
		for (const [i, item] of parsed.items.entries()) {
			expect(
				item.link,
				`item[${i}] link "${item.link}" should contain "${ES_POST_LINK_PREFIX}"`
			).toContain(ES_POST_LINK_PREFIX);
			expect(
				item.link,
				`item[${i}] link must NOT point at the EN-only /blog/ path (without /es/ prefix)`
			).not.toMatch(/^https?:\/\/[^/]*\/blog\//);
		}
	});

	test('excludes draft posts from the production feed', async ({ page }) => {
		const { parsed } = await fetchFeed(page, PATH);
		const drafts = parsed.items.filter(i => i.title === DRAFT_TITLE);
		expect(drafts, 'draft fixture must not appear in the production feed').toEqual([]);
	});

	test('feed item count matches the known published ES posts (draft excluded)', async ({
		page,
	}) => {
		const { parsed } = await fetchFeed(page, PATH);
		// 2 published ES posts live under src/content/blog/es/ as of 2026-07-04.
		expect(parsed.itemCount, 'ES feed should list exactly the 2 published ES posts').toBe(2);
	});

	test('does not leak EN-only post titles (locale isolation)', async ({ page }) => {
		const { parsed } = await fetchFeed(page, PATH);
		const enOnlyTitles = ['Building This Portfolio With Astro 6 and Feature-Sliced Design'];
		for (const title of enOnlyTitles) {
			const found = parsed.items.some(i => i.title === title);
			expect(found, `ES feed must not include EN-only title "${title}"`).toBe(false);
		}
	});
});

test.describe('RSS — EN and ES feeds are structurally consistent', () => {
	test('both feeds share the same RSS version and each has a localized channel title', async ({
		page,
	}) => {
		const { parsed: en } = await fetchFeed(page, '/rss.xml');
		const { parsed: es } = await fetchFeed(page, '/es/rss.xml');
		expect(en.isRss && es.isRss).toBe(true);
		expect(en.version).toBe('2.0');
		expect(es.version).toBe('2.0');
		expect(en.channelTitle).toBe('David Sandoval — Software Engineering Blog');
		expect(es.channelTitle).toBe('David Sandoval — Blog de ingeniería de software');
	});

	test('EN and ES feeds list symmetric post counts', async ({ page }) => {
		const { parsed: en } = await fetchFeed(page, '/rss.xml');
		const { parsed: es } = await fetchFeed(page, '/es/rss.xml');
		expect(en.itemCount, 'EN and ES feeds should list the same number of posts').toBe(
			es.itemCount
		);
	});
});
