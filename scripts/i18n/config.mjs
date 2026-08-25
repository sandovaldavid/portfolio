export const INTENTIONAL_SINGLE_LOCALE_EDITORIAL = Object.freeze({
	blog: Object.freeze({
		'draft-rss-test':
			'English-only draft fixture used to prove production RSS exclusion; it is never published.',
	}),
	devlog: Object.freeze({}),
});

/** @type {readonly { file: string; value: string; reason: string }[]} */
export const HARD_CODED_TEXT_ALLOWLIST = Object.freeze([]);

export const SPANISH_FORBIDDEN_PHRASES = Object.freeze([
	'Skip to main content',
	'Main navigation',
	'Mobile navigation',
	'Open navigation menu',
	'Close navigation menu',
	'Choose language',
	'Opens in a new tab',
	'Current page',
	'Translation unavailable',
	'Social and contact links',
	'Experience tabs',
	'Portfolio CLI terminal',
	'Terminal command input',
	'Close terminal',
	'Developer secret mode',
	'Page not found',
	'Go to home',
	'Go back',
]);

export const REPRESENTATIVE_ROUTE_PAIRS = Object.freeze([
	Object.freeze({ english: '/', spanish: '/es/' }),
	Object.freeze({ english: '/about', spanish: '/es/about' }),
	Object.freeze({ english: '/experience', spanish: '/es/experience' }),
	Object.freeze({
		english: '/experience/atena-software-engineer',
		spanish: '/es/experience/atena-software-engineer',
	}),
	Object.freeze({ english: '/components', spanish: '/es/components' }),
	Object.freeze({ english: '/research', spanish: '/es/research' }),
	Object.freeze({ english: '/skills', spanish: '/es/skills' }),
	Object.freeze({ english: '/projects', spanish: '/es/projects' }),
	Object.freeze({ english: '/projects/yukidoke', spanish: '/es/projects/yukidoke' }),
	Object.freeze({ english: '/blog', spanish: '/es/blog' }),
	Object.freeze({
		english: '/blog/building-this-portfolio-with-astro-and-fsd',
		spanish: '/es/blog/building-this-portfolio-with-astro-and-fsd',
	}),
	Object.freeze({ english: '/devlog', spanish: '/es/devlog' }),
	Object.freeze({
		english: '/devlog/phase-3-complete',
		spanish: '/es/devlog/phase-3-complete',
	}),
]);
