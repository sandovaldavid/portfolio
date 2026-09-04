import { test, expect } from './fixtures';

/**
 * Typography enforcement spec.
 *
 * Asserts, on every key page (EN + ES) and at desktop + mobile viewports:
 *   1. Global floor: every visible element with direct text renders at >= 12px.
 *   2. Reading paragraph floor: visible `main p` copy is >= 14px unless explicitly styled as a caption; reading copy (>= 80 chars) is >= 16px.
 *   3. Exactly one visible <h1> per page.
 *   4. No skipped heading levels in DOM order.
 *   5. Headings (h1–h3) render strictly larger than the page's body text.
 *
 * Chromium-only: computed font-size in px is engine-independent, and this spec
 * drives its own desktop/mobile viewports. Repeating it across browser/device
 * projects adds duplicate geometry work rather than compatibility coverage.
 */

const KEY_PAGES = [
	{ path: '/', name: 'Home (EN)' },
	{ path: '/about', name: 'About (EN)' },
	{ path: '/projects', name: 'Projects (EN)' },
	{ path: '/skills', name: 'Skills (EN)' },
	{ path: '/research', name: 'Research (EN)' },
	{ path: '/blog', name: 'Blog (EN)' },
	{ path: '/devlog', name: 'Devlog (EN)' },
	{ path: '/experience/atena-software-engineer', name: 'Atena experience (EN)' },
	{ path: '/es/', name: 'Home (ES)' },
	{ path: '/es/about', name: 'About (ES)' },
	{ path: '/es/projects', name: 'Projects (ES)' },
	{ path: '/es/skills', name: 'Skills (ES)' },
	{ path: '/es/research', name: 'Research (ES)' },
	{ path: '/es/blog', name: 'Blog (ES)' },
	{ path: '/es/devlog', name: 'Devlog (ES)' },
	{ path: '/es/experience/atena-software-engineer', name: 'Atena experience (ES)' },
	{ path: '/projects/mad-ai', name: 'Project detail (EN)' },
	{ path: '/es/projects/mad-ai', name: 'Project detail (ES)' },
	{ path: '/blog/building-this-portfolio-with-astro-and-fsd', name: 'Blog detail (EN)' },
	{ path: '/es/blog/building-this-portfolio-with-astro-and-fsd', name: 'Blog detail (ES)' },
	{ path: '/devlog/v2-0-0', name: 'Devlog detail (EN)' },
	{ path: '/es/devlog/v2-0-0', name: 'Devlog detail (ES)' },
];

const VIEWPORTS = [
	{ name: 'desktop', width: 1280, height: 720 },
	{ name: 'mobile', width: 375, height: 667 },
];

const MIN_ANY_TEXT = 12;
const MIN_PARAGRAPH = 14;
const MIN_READING_COPY = 16;
const READING_COPY_CHARS = 80;

interface TextMetric {
	tag: string;
	size: number;
	text: string;
}

interface ParagraphMetric {
	size: number;
	chars: number;
	text: string;
	isExplicitCaption: boolean;
}

interface HeadingMetric {
	level: number;
	size: number;
	text: string;
}

interface PageMetrics {
	textElements: TextMetric[];
	paragraphs: ParagraphMetric[];
	headings: HeadingMetric[];
}

function collectMetrics(): PageMetrics {
	const isVisible = (el: Element): boolean => {
		const style = window.getComputedStyle(el);
		if (style.display === 'none' || style.visibility === 'hidden') return false;
		return el.getClientRects().length > 0;
	};

	const snippet = (el: Element): string =>
		(el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 60);

	const hasDirectText = (el: Element): boolean =>
		Array.from(el.childNodes).some(
			node => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim().length > 0
		);

	const textElements: TextMetric[] = [];
	for (const el of Array.from(document.body.querySelectorAll('*'))) {
		if (!hasDirectText(el) || !isVisible(el)) continue;
		textElements.push({
			tag: el.tagName.toLowerCase(),
			size: parseFloat(window.getComputedStyle(el).fontSize),
			text: snippet(el),
		});
	}

	const paragraphs: ParagraphMetric[] = Array.from(
		document.querySelectorAll<HTMLParagraphElement>('main p')
	)
		.filter(isVisible)
		.map(p => ({
			size: parseFloat(window.getComputedStyle(p).fontSize),
			chars: (p.textContent ?? '').trim().length,
			text: snippet(p),
			isExplicitCaption:
				p.classList.contains('text-xs') ||
				p.classList.contains('text-caption') ||
				p.classList.contains('text-editorial-label-compact') ||
				p.dataset.typographyRole === 'caption',
		}));

	const headings: HeadingMetric[] = Array.from(
		document.querySelectorAll('h1, h2, h3, h4, h5, h6')
	)
		.filter(isVisible)
		.map(h => ({
			level: Number(h.tagName[1]),
			size: parseFloat(window.getComputedStyle(h).fontSize),
			text: snippet(h),
		}));

	return { textElements, paragraphs, headings };
}

function median(values: number[]): number {
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

test.skip(
	({ browserName }) => browserName !== 'chromium',
	'Computed font-size is engine-independent — canonical Chromium covers it'
);

for (const { path, name } of KEY_PAGES) {
	for (const viewport of VIEWPORTS) {
		test.describe(`${name} @ ${viewport.name}`, () => {
			test.beforeEach(async ({ page }) => {
				await page.setViewportSize({ width: viewport.width, height: viewport.height });
				await page.goto(path);
			});

			test('text-size floors (12px global, 14/16px reading paragraphs)', async ({ page }) => {
				const metrics = (await page.evaluate(collectMetrics)) as PageMetrics;

				const belowFloor = metrics.textElements.filter(t => t.size < MIN_ANY_TEXT);
				expect(
					belowFloor,
					`Visible text below ${MIN_ANY_TEXT}px: ${belowFloor
						.map(t => `<${t.tag}> ${t.size}px "${t.text}"`)
						.join(' | ')}`
				).toEqual([]);

				const smallParagraphs = metrics.paragraphs.filter(
					p => !p.isExplicitCaption && p.size < MIN_PARAGRAPH
				);
				expect(
					smallParagraphs,
					`Reading main <p> below ${MIN_PARAGRAPH}px: ${smallParagraphs
						.map(p => `${p.size}px "${p.text}"`)
						.join(' | ')}`
				).toEqual([]);

				const smallReadingCopy = metrics.paragraphs.filter(
					p =>
						!p.isExplicitCaption &&
						p.chars >= READING_COPY_CHARS &&
						p.size < MIN_READING_COPY
				);
				expect(
					smallReadingCopy,
					`Reading copy (>= ${READING_COPY_CHARS} chars) below ${MIN_READING_COPY}px: ${smallReadingCopy
						.map(p => `${p.size}px "${p.text}"`)
						.join(' | ')}`
				).toEqual([]);
			});

			test('heading structure (one h1, no level skips, heading > body)', async ({ page }) => {
				const metrics = (await page.evaluate(collectMetrics)) as PageMetrics;

				const h1s = metrics.headings.filter(h => h.level === 1);
				expect(
					h1s,
					`Expected exactly one visible <h1>, got ${h1s.length}: ${h1s
						.map(h => `"${h.text}"`)
						.join(' | ')}`
				).toHaveLength(1);

				let maxSeen = 0;
				for (const heading of metrics.headings) {
					expect(
						heading.level,
						`Heading level skip: <h${heading.level}> "${heading.text}" follows max level h${maxSeen}`
					).toBeLessThanOrEqual(maxSeen + 1);
					maxSeen = Math.max(maxSeen, heading.level);
				}

				const primaryHeadings = metrics.headings.filter(h => h.level <= 3);
				const bodyParagraphs = metrics.paragraphs.filter(p => !p.isExplicitCaption);
				if (primaryHeadings.length > 0 && bodyParagraphs.length > 0) {
					const bodySize = median(bodyParagraphs.map(p => p.size));
					const smallest = primaryHeadings.reduce((a, b) => (a.size <= b.size ? a : b));
					expect(
						smallest.size,
						`<h${smallest.level}> "${smallest.text}" (${smallest.size}px) is not larger than body text (median ${bodySize}px)`
					).toBeGreaterThan(bodySize);
				}
			});
		});
	}
}
