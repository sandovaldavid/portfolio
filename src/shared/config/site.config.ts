/**
 * Site Configuration — Language-Neutral Source of Truth
 * FSD Layer: Shared > Config
 *
 * Edit this file to update identity, URLs, contact details and technical
 * metadata shared by every locale. Localized SEO and RSS copy belongs to
 * the typed `metadata` catalog namespace.
 */

export const siteConfig = {
	// ─── Personal ────────────────────────────────────────────────
	name: 'David Sandoval',
	fullName: 'Juan David Sandoval Salvador',
	handle: 'sandovaldavid',
	role: 'Software Engineer',
	location: 'Peru (UTC-5)',
	currentCompany: 'Atena',
	availability: true,

	// ─── Site / SEO ──────────────────────────────────────────────
	url: 'https://sandovaldavid.com',
	/** Used for canonical and og:url — appended with Astro.url.pathname */
	get canonicalBase() {
		return this.url;
	},
	defaultImage: '/projects/portfolio.webp',
	twitterCard: 'summary_large_image' as const,

	// ─── Contact ─────────────────────────────────────────────────
	email: 'hello@sandovaldavid.com',
	emailSubjectRecruiter: 'Software engineering opportunity',

	// ─── Social Networks ─────────────────────────────────────────
	social: {
		github: 'https://github.com/sandovaldavid',
		githubUsername: 'sandovaldavid',
		linkedin: 'https://www.linkedin.com/in/jdsandovals',
		linkedinUsername: 'jdsandovals',
		linkHub: 'https://hub.sandovaldavid.com',
	},

	// ─── Resume ──────────────────────────────────────────────────
	resume: {
		en: 'https://sandovaldavid.com/resume/david-sandoval-resume.pdf',
		es: 'https://sandovaldavid.com/resume/david-sandoval-resume-es.pdf',
	},
} as const;

/** Shorthand getters for the most-used values */
export const siteUrl = siteConfig.url;
export const siteEmail = siteConfig.email;
export const siteSocial = siteConfig.social;
export const siteName = siteConfig.name;
