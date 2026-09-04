import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const siteUrl = 'https://sandovaldavid.com';

type JsonLd = Record<string, unknown>;

async function getJsonLd(page: Page, type: string): Promise<JsonLd> {
	const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
	const parsed = schemas.map(schema => JSON.parse(schema) as JsonLd);
	const match = parsed.find(schema => schema['@type'] === type);
	expect(match, `Expected JSON-LD type ${type}`).toBeDefined();
	return match ?? {};
}

async function hasJsonLd(page: Page, type: string): Promise<boolean> {
	const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
	return schemas
		.map(schema => JSON.parse(schema) as JsonLd)
		.some(schema => schema['@type'] === type);
}

function getString(schema: JsonLd, key: string): string {
	const value = schema[key];
	expect(typeof value, `Expected ${key} to be a string`).toBe('string');
	return typeof value === 'string' ? value : '';
}

function getObject(schema: JsonLd, key: string): JsonLd {
	const value = schema[key];
	expect(value, `Expected ${key} to be an object`).toBeTruthy();
	expect(Array.isArray(value)).toBe(false);
	return typeof value === 'object' && value !== null && !Array.isArray(value)
		? (value as JsonLd)
		: {};
}

async function expectMetadata(
	page: Page,
	scenario: {
		path: string;
		lang: 'en' | 'es';
		title: string;
		description: string;
		ogLocale: 'en_US' | 'es_PE';
		alternateOgLocale: 'en_US' | 'es_PE';
		image: string;
		imageAlt: string;
		rssEnglishTitle: string;
		rssSpanishTitle: string;
		skipText: string;
	}
) {
	await page.goto(scenario.path);

	await expect(page.locator('html')).toHaveAttribute('lang', scenario.lang);
	await expect(page).toHaveTitle(scenario.title);
	await expect(page.locator('meta[name="description"]')).toHaveAttribute(
		'content',
		scenario.description
	);
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		'href',
		`${siteUrl}${scenario.path}`
	);
	await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
		'content',
		scenario.title
	);
	await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
		'content',
		scenario.description
	);
	await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
		'content',
		`${siteUrl}${scenario.image}`
	);
	await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
		'content',
		`${siteUrl}${scenario.image}`
	);
	await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
		'content',
		scenario.ogLocale
	);
	await expect(page.locator('meta[property="og:locale:alternate"]')).toHaveAttribute(
		'content',
		scenario.alternateOgLocale
	);
	await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
		'content',
		scenario.imageAlt
	);
	await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute(
		'content',
		scenario.imageAlt
	);
	await expect(page.locator('link[type="application/rss+xml"][hreflang="en"]')).toHaveAttribute(
		'title',
		scenario.rssEnglishTitle
	);
	await expect(page.locator('link[type="application/rss+xml"][hreflang="es"]')).toHaveAttribute(
		'title',
		scenario.rssSpanishTitle
	);
	await expect(page.locator('a[href="#main-content"]')).toHaveText(scenario.skipText);
}

test.describe('localized SEO, social, RSS and structured metadata', () => {
	test('home metadata is complete and localized in both languages', async ({ page }) => {
		await expectMetadata(page, {
			path: '/',
			lang: 'en',
			title: 'David Sandoval — Software Engineer',
			description:
				'David Sandoval is a backend-oriented Software Engineer with hands-on frontend experience, working across product systems, integrations, developer tooling, and software-maintenance research. Based in Peru and open to international opportunities.',
			ogLocale: 'en_US',
			alternateOgLocale: 'es_PE',
			image: '/og/preview-portfolio-home-en-dark.png',
			imageAlt: 'David Sandoval portfolio preview',
			rssEnglishTitle: 'David Sandoval — Blog in English',
			rssSpanishTitle: 'David Sandoval — Blog in Spanish',
			skipText: 'Skip to main content',
		});

		await expectMetadata(page, {
			path: '/es/',
			lang: 'es',
			title: 'David Sandoval — Ingeniero de Software',
			description:
				'David Sandoval es Ingeniero de Software orientado a backend, con experiencia práctica en frontend y trabajo en sistemas de producto, integraciones, developer tooling e investigación sobre mantenimiento de software. Desde Perú, abierto a oportunidades internacionales.',
			ogLocale: 'es_PE',
			alternateOgLocale: 'en_US',
			image: '/og/preview-portfolio-home-es-dark.png',
			imageAlt: 'Vista previa del portafolio de David Sandoval',
			rssEnglishTitle: 'David Sandoval — Blog en inglés',
			rssSpanishTitle: 'David Sandoval — Blog en español',
			skipText: 'Saltar al contenido principal',
		});

		const website = await getJsonLd(page, 'WebSite');
		const person = await getJsonLd(page, 'Person');
		expect(getString(website, 'inLanguage')).toBe('es');
		expect(getString(website, 'description')).toContain('Ingeniero de Software');
		expect(getString(person, 'jobTitle')).toBe('Ingeniero de Software');
	});

	test('dynamic route schemas match their content family, locale and social preview', async ({
		page,
	}) => {
		await page.goto('/blog/building-this-portfolio-with-astro-and-fsd');
		const blog = await getJsonLd(page, 'BlogPosting');
		const blogHeading =
			(await page.getByRole('heading', { level: 1 }).textContent())?.trim() ?? '';
		expect(getString(blog, 'inLanguage')).toBe('en');
		expect(getString(blog, 'headline')).toBe(blogHeading);
		expect(getString(blog, 'datePublished')).toBeTruthy();
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
			'content',
			`${siteUrl}/og/preview-article-building-this-portfolio-with-astro-and-fsd-en-dark.png`
		);
		const blogBreadcrumbs = await getJsonLd(page, 'BreadcrumbList');
		expect(JSON.stringify(blogBreadcrumbs)).toContain(blogHeading);

		await page.goto('/es/devlog/v2-0-0');
		const devlog = await getJsonLd(page, 'TechArticle');
		expect(getString(devlog, 'inLanguage')).toBe('es');
		expect(getString(devlog, 'datePublished')).toBeTruthy();
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
			'content',
			`${siteUrl}/og/preview-article-v2-0-0-es-dark.png`
		);

		await page.goto('/es/research');
		expect(await hasJsonLd(page, 'ScholarlyArticle')).toBe(false);
		const research = await getJsonLd(page, 'WebPage');
		expect(getString(research, 'inLanguage')).toBe('es');
		await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
			'content',
			'website'
		);
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
			'content',
			`${siteUrl}/og/preview-website-research-es-dark.png`
		);
		const researchBreadcrumbs = await getJsonLd(page, 'BreadcrumbList');
		expect(JSON.stringify(researchBreadcrumbs)).toContain('Investigación');

		await page.goto('/es/projects/yukidoke');
		const project = await getJsonLd(page, 'SoftwareSourceCode');
		expect(getString(project, 'inLanguage')).toBe('es');
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
			'content',
			`${siteUrl}/og/preview-project-yukidoke-es-dark.png`
		);
		expect(getString(getObject(project, 'image'), 'caption')).toBe(
			'Yukidoke — Caso de estudio'
		);
	});

	test('profile and experience routes use the intended social preview family', async ({ page }) => {
		await page.goto('/es/about');
		const profile = await getJsonLd(page, 'ProfilePage');
		const person = await getJsonLd(page, 'Person');

		expect(getString(profile, 'inLanguage')).toBe('es');
		expect(getString(profile, 'description')).toContain(
			'Sobre David Sandoval, Ingeniero de Software orientado a backend'
		);
		expect(getString(person, 'jobTitle')).toBe('Ingeniero de Software');
		expect(getString(person, 'description')).toContain(
			'experiencia práctica en frontend, sistemas de producto, integraciones'
		);
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
			'content',
			`${siteUrl}/og/preview-profile-about-es-dark.png`
		);

		await page.goto('/experience/atena-software-engineer');
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
			'content',
			`${siteUrl}/og/preview-case-study-atena-software-engineer-en-dark.png`
		);

		await page.goto('/experience/chirasoft-fullstack-developer');
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
			'content',
			`${siteUrl}/og/preview-website-experience-en-dark.png`
		);
	});

	test('canonical alternate targets resolve for representative route families', async ({
		page,
		request,
	}) => {
		for (const path of [
			'/',
			'/es/about',
			'/blog/building-this-portfolio-with-astro-and-fsd',
			'/es/projects/yukidoke',
		]) {
			await page.goto(path);
			const hrefs = await page
				.locator('link[rel="alternate"][hreflang]:not([type="application/rss+xml"])')
				.evaluateAll(links => links.map(link => (link as HTMLLinkElement).href));

			for (const href of hrefs) {
				const response = await request.get(new URL(href).pathname);
				expect(response.ok(), `${path} alternate ${href}`).toBe(true);
			}
		}
	});

	test('RSS feeds expose localized metadata and locale-specific entries', async ({ request }) => {
		const englishResponse = await request.get('/rss.xml');
		const spanishResponse = await request.get('/es/rss.xml');
		expect(englishResponse.ok()).toBe(true);
		expect(spanishResponse.ok()).toBe(true);

		const english = await englishResponse.text();
		const spanish = await spanishResponse.text();
		expect(english).toContain('<language>en</language>');
		expect(english).toContain('David Sandoval — Software Engineering Blog');
		expect(english).not.toContain('/es/blog/');
		expect(spanish).toContain('<language>es</language>');
		expect(spanish).toContain('David Sandoval — Blog de ingeniería de software');
		expect(spanish).toContain('/es/blog/');
	});
});
