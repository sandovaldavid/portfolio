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
	currentCompany: 'Atena',

	// ─── Site / SEO ──────────────────────────────────────────────
	url: 'https://sandovaldavid.com',
	twitterCard: 'summary_large_image' as const,

	// ─── Contact ─────────────────────────────────────────────────
	email: 'hello@sandovaldavid.com',

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
