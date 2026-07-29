export const INTENTIONAL_SINGLE_LOCALE_EDITORIAL = Object.freeze({
	blog: Object.freeze({
		'draft-rss-test':
			'English-only draft fixture used to prove production RSS exclusion; it is never published.',
	}),
	devlog: Object.freeze({}),
});

export const HARD_CODED_TEXT_ALLOWLIST = Object.freeze([
	Object.freeze({
		file: 'src/features/cli-terminal/ui/CLITerminalCatalog.astro',
		value: 'portfolio@sandovaldavid:~',
		reason: 'Decorative shell prompt composed only from the public handle and source-code syntax.',
	}),
	Object.freeze({
		file: 'src/widgets/hero/ui/Hero.astro',
		value: 'David Sandoval',
		reason: 'Proper name displayed as the portfolio owner identity; proper names are language-neutral.',
	}),
]);

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
	'Something went wrong',
	'The requested content could not be loaded.',
	'Page not found',
	'Go to home',
	'Go back',
	'A required translation is missing.',
]);

export const REPRESENTATIVE_ROUTE_PAIRS = Object.freeze([
	Object.freeze({ english: '/', spanish: '/es/' }),
	Object.freeze({ english: '/about', spanish: '/es/about' }),
	Object.freeze({ english: '/atena', spanish: '/es/atena' }),
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
