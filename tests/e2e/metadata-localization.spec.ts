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
				'Software Engineer building maintainable web products and backend systems with clear technical decisions, automated validation and documented trade-offs. Remote from Peru, open to international opportunities.',
			ogLocale: 'en_US',
			alternateOgLocale: 'es_PE',
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
				'Ingeniero de software que construye productos web y sistemas backend mantenibles con decisiones técnicas claras, validación automatizada y trade-offs documentados. Remoto desde Perú, disponible para oportunidades internacionales.',
			ogLocale: 'es_PE',
			alternateOgLocale: 'en_US',
			imageAlt: 'Vista previa del portafolio de David Sandoval',
			rssEnglishTitle: 'David Sandoval — Blog en inglés',
			rssSpanishTitle: 'David Sandoval — Blog en español',
			skipText: 'Saltar al contenido principal',
		});

		const website = await getJsonLd(page, 'WebSite');
		const person = await getJsonLd(page, 'Person');
		expect(getString(website, 'inLanguage')).toBe('es');
		expect(getString(website, 'description')).toContain('Ingeniero de software');
		expect(getString(person, 'jobTitle')).toBe('Ingeniero de Software');
	});

	test('dynamic route schemas match their content family and locale', async ({ page }) => {
		await page.goto('/blog/building-this-portfolio-with-astro-and-fsd');
		const blog = await getJsonLd(page, 'BlogPosting');
		const blogHeading =
			(await page.getByRole('heading', { level: 1 }).textContent())?.trim() ?? '';
		expect(getString(blog, 'inLanguage')).toBe('en');
		expect(getString(blog, 'headline')).toBe(blogHeading);
		expect(getString(blog, 'datePublished')).toBeTruthy();
		const blogBreadcrumbs = await getJsonLd(page, 'BreadcrumbList');
		expect(JSON.stringify(blogBreadcrumbs)).toContain(blogHeading);

		await page.goto('/es/devlog/phase-3-complete');
		const devlog = await getJsonLd(page, 'TechArticle');
		expect(getString(devlog, 'inLanguage')).toBe('es');
		expect(getString(devlog, 'datePublished')).toBeTruthy();

		await page.goto('/es/research');
		const researchSchemas = await page
			.locator('script[type="application/ld+json"]')
			.allTextContents();
		const parsedResearchSchemas = researchSchemas.map(schema => JSON.parse(schema) as JsonLd);
		expect(parsedResearchSchemas.some(schema => schema['@type'] === 'ScholarlyArticle')).toBe(false);
		const researchBreadcrumbs = await getJsonLd(page, 'BreadcrumbList');
		expect(JSON.stringify(researchBreadcrumbs)).toContain('Investigación');

		await page.goto('/es/projects/yukidoke');
		const project = await getJsonLd(page, 'SoftwareSourceCode');
		expect(getString(project, 'inLanguage')).toBe('es');
		expect(getString(getObject(project, 'image'), 'caption')).toBe(
			'Vista previa de la arquitectura de la plataforma financiera familiar Yukidoke'
		);
	});

	test('profile routes expose localized ProfilePage and Person data', async ({ page }) => {
		await page.goto('/es/about');
		const profile = await getJsonLd(page, 'ProfilePage');
		const person = await getJsonLd(page, 'Person');

		expect(getString(profile, 'inLanguage')).toBe('es');
		expect(getString(profile, 'description')).toContain(
			'Conoce cómo David Sandoval aborda la ingeniería de software'
		);
		expect(getString(person, 'jobTitle')).toBe('Ingeniero de Software');
		expect(getString(person, 'description')).toContain('sistemas backend mantenibles');
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
