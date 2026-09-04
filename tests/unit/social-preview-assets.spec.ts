import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const locales = ['en', 'es'] as const;
const websiteRoutes = [
	'projects',
	'skills',
	'research',
	'experience',
	'blog',
	'devlog',
	'components',
];
const projectSlugs = ['yukidoke', 'kioku', 'campus-map', 'mad-ai', 'fluentreads', 'auctions'];
const articleSlugs = [
	'building-this-portfolio-with-astro-and-fsd',
	'predicting-oss-abandonment-with-bilstm',
	'v1-0-0-launch',
	'v2-0-0',
];

const expectedOgFiles = [
	...locales.map(locale => `preview-portfolio-home-${locale}-dark.png`),
	...locales.map(locale => `preview-profile-about-${locale}-dark.png`),
	...websiteRoutes.flatMap(route =>
		locales.map(locale => `preview-website-${route}-${locale}-dark.png`)
	),
	...projectSlugs.flatMap(slug =>
		locales.map(locale => `preview-project-${slug}-${locale}-dark.png`)
	),
	...locales.map(locale => `preview-case-study-atena-software-engineer-${locale}-dark.png`),
	...articleSlugs.flatMap(slug =>
		locales.map(locale => `preview-article-${slug}-${locale}-dark.png`)
	),
].sort();

const publicPageSources = [
	'src/pages/index.astro',
	'src/pages/es/index.astro',
	'src/pages/about.astro',
	'src/pages/es/about.astro',
	'src/pages/projects.astro',
	'src/pages/es/projects.astro',
	'src/pages/projects/[slug].astro',
	'src/pages/es/projects/[slug].astro',
	'src/pages/skills.astro',
	'src/pages/es/skills.astro',
	'src/pages/research.astro',
	'src/pages/es/research.astro',
	'src/pages/experience/index.astro',
	'src/pages/es/experience/index.astro',
	'src/pages/experience/[slug].astro',
	'src/pages/es/experience/[slug].astro',
	'src/pages/blog.astro',
	'src/pages/es/blog.astro',
	'src/pages/blog/[slug].astro',
	'src/pages/es/blog/[slug].astro',
	'src/pages/devlog.astro',
	'src/pages/es/devlog.astro',
	'src/pages/devlog/[slug].astro',
	'src/pages/es/devlog/[slug].astro',
	'src/pages/components.astro',
	'src/pages/es/components.astro',
];

describe('route-specific social preview assets', () => {
	it('contains exactly the 40 canonical Figma exports', () => {
		const actual = readdirSync('public/og')
			.filter(name => name.endsWith('.png'))
			.sort();

		expect(actual).toEqual(expectedOgFiles);
		expect(actual).toHaveLength(40);
	});

	it('keeps every exported PNG at the canonical 1200x630 geometry', () => {
		for (const filename of expectedOgFiles) {
			const image = readFileSync(`public/og/${filename}`);
			expect(image.subarray(1, 4).toString('ascii'), filename).toBe('PNG');
			expect(image.readUInt32BE(16), `${filename} width`).toBe(1200);
			expect(image.readUInt32BE(20), `${filename} height`).toBe(630);
		}
	});

	it('removes retired OG fallbacks from public route metadata', () => {
		expect(existsSync('public/og-meta.png')).toBe(false);

		for (const path of publicPageSources) {
			const source = readFileSync(path, 'utf8');
			expect(source, path).not.toContain('/og-meta.png');
			expect(source, path).not.toContain('/projects/portfolio.webp');
		}
	});

	it('uses the general Experience preview only when a dedicated case-study export is absent', () => {
		const english = readFileSync('src/pages/experience/[slug].astro', 'utf8');
		const spanish = readFileSync('src/pages/es/experience/[slug].astro', 'utf8');

		expect(english).toContain("slug === 'atena-software-engineer'");
		expect(english).toContain('/og/preview-website-experience-en-dark.png');
		expect(spanish).toContain("slug === 'atena-software-engineer'");
		expect(spanish).toContain('/og/preview-website-experience-es-dark.png');
	});
});
