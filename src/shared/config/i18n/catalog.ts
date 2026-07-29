import accessibilityEn from './locales/en/accessibility.json';
import breadcrumbsEn from './locales/en/breadcrumbs.json';
import cliEn from './locales/en/cli.json';
import commonEn from './locales/en/common.json';
import errorsEn from './locales/en/errors.json';
import footerEn from './locales/en/footer.json';
import metadataEn from './locales/en/metadata.json';
import navigationEn from './locales/en/navigation.json';
import atenaEn from './locales/en/pages/atena.json';
import blogEn from './locales/en/pages/blog.json';
import componentsEn from './locales/en/pages/components.json';
import devlogEn from './locales/en/pages/devlog.json';
import researchPageEn from './locales/en/pages/research.json';
import skillsEn from './locales/en/pages/skills.json';
import recruiterEn from './locales/en/recruiter.json';
import aboutEn from './locales/en/sections/about.json';
import badgesEn from './locales/en/sections/badges.json';
import experienceEn from './locales/en/sections/experience.json';
import heroEn from './locales/en/sections/hero.json';
import projectsEn from './locales/en/sections/projects.json';
import researchEn from './locales/en/sections/research.json';
import techStackEn from './locales/en/sections/tech-stack.json';
import visionEn from './locales/en/sections/vision.json';
import splashEn from './locales/en/splash.json';
import themeEn from './locales/en/theme.json';
import accessibilityEs from './locales/es/accessibility.json';
import breadcrumbsEs from './locales/es/breadcrumbs.json';
import cliEs from './locales/es/cli.json';
import commonEs from './locales/es/common.json';
import errorsEs from './locales/es/errors.json';
import footerEs from './locales/es/footer.json';
import metadataEs from './locales/es/metadata.json';
import navigationEs from './locales/es/navigation.json';
import atenaEs from './locales/es/pages/atena.json';
import blogEs from './locales/es/pages/blog.json';
import componentsEs from './locales/es/pages/components.json';
import devlogEs from './locales/es/pages/devlog.json';
import researchPageEs from './locales/es/pages/research.json';
import skillsEs from './locales/es/pages/skills.json';
import recruiterEs from './locales/es/recruiter.json';
import aboutEs from './locales/es/sections/about.json';
import badgesEs from './locales/es/sections/badges.json';
import experienceEs from './locales/es/sections/experience.json';
import heroEs from './locales/es/sections/hero.json';
import projectsEs from './locales/es/sections/projects.json';
import researchEs from './locales/es/sections/research.json';
import techStackEs from './locales/es/sections/tech-stack.json';
import visionEs from './locales/es/sections/vision.json';
import splashEs from './locales/es/splash.json';
import themeEs from './locales/es/theme.json';
import { Language } from './languages';
import type { KeysWithinNamespace, LeafPath, StringCatalogShape } from './types';

const englishCatalog = {
	common: commonEn,
	navigation: navigationEn,
	accessibility: accessibilityEn,
	breadcrumbs: breadcrumbsEn,
	cli: cliEn,
	footer: footerEn,
	metadata: metadataEn,
	theme: themeEn,
	errors: errorsEn,
	recruiter: recruiterEn,
	splash: splashEn,
	pages: {
		atena: atenaEn,
		blog: blogEn,
		components: componentsEn,
		devlog: devlogEn,
		research: researchPageEn,
		skills: skillsEn,
	},
	sections: {
		hero: heroEn,
		about: aboutEn,
		badges: badgesEn,
		experience: experienceEn,
		projects: projectsEn,
		research: researchEn,
		vision: visionEn,
		techStack: techStackEn,
	},
} as const;

const spanishCatalog = {
	common: commonEs,
	navigation: navigationEs,
	accessibility: accessibilityEs,
	breadcrumbs: breadcrumbsEs,
	cli: cliEs,
	footer: footerEs,
	metadata: metadataEs,
	theme: themeEs,
	errors: errorsEs,
	recruiter: recruiterEs,
	splash: splashEs,
	pages: {
		atena: atenaEs,
		blog: blogEs,
		components: componentsEs,
		devlog: devlogEs,
		research: researchPageEs,
		skills: skillsEs,
	},
	sections: {
		hero: heroEs,
		about: aboutEs,
		badges: badgesEs,
		experience: experienceEs,
		projects: projectsEs,
		research: researchEs,
		vision: visionEs,
		techStack: techStackEs,
	},
} as const satisfies StringCatalogShape<typeof englishCatalog>;

export const UI_CATALOG_MODULES = [
	'common',
	'navigation',
	'accessibility',
	'breadcrumbs',
	'cli',
	'footer',
	'metadata',
	'theme',
	'errors',
	'recruiter',
	'splash',
	'pages.atena',
	'pages.blog',
	'pages.components',
	'pages.devlog',
	'pages.research',
	'pages.skills',
	'sections.hero',
	'sections.about',
	'sections.badges',
	'sections.experience',
	'sections.projects',
	'sections.research',
	'sections.vision',
	'sections.techStack',
] as const;

export type UiCatalog = typeof englishCatalog;
export type UiCatalogKey = LeafPath<UiCatalog>;
export type UiCatalogNamespace = (typeof UI_CATALOG_MODULES)[number];
export type UiCatalogScopedKey<Namespace extends UiCatalogNamespace> = KeysWithinNamespace<
	UiCatalogKey,
	Namespace
>;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function flattenCatalog(node: unknown, prefix = ''): Record<string, string> {
	if (!isRecord(node)) {
		throw new TypeError(`UI catalog namespace "${prefix || '<root>'}" must be an object.`);
	}

	return Object.entries(node).reduce<Record<string, string>>((catalog, [key, value]) => {
		const fullKey = prefix ? `${prefix}.${key}` : key;

		if (typeof value === 'string') {
			catalog[fullKey] = value;
			return catalog;
		}

		if (!isRecord(value)) {
			throw new TypeError(`UI catalog value "${fullKey}" must be a scalar string.`);
		}

		Object.assign(catalog, flattenCatalog(value, fullKey));
		return catalog;
	}, {});
}

const englishFlatCatalog = flattenCatalog(englishCatalog) as Record<UiCatalogKey, string>;
const spanishFlatCatalog = flattenCatalog(spanishCatalog) as Record<UiCatalogKey, string>;

export const uiCatalogs: Readonly<Record<Language, Readonly<Record<UiCatalogKey, string>>>> = {
	[Language.ENGLISH]: englishFlatCatalog,
	[Language.SPANISH]: spanishFlatCatalog,
};

export class MissingUiTranslationError extends Error {
	constructor(
		public readonly locale: Language,
		public readonly key: string
	) {
		super(`Missing UI translation "${key}" for locale "${locale}".`);
		this.name = 'MissingUiTranslationError';
	}
}

export function validateUiCatalogs(): true {
	const moduleNames = new Set(UI_CATALOG_MODULES);
	if (moduleNames.size !== UI_CATALOG_MODULES.length) {
		throw new Error('UI catalog module namespaces must be unique.');
	}

	const englishKeys = Object.keys(englishFlatCatalog).sort();
	const spanishKeys = Object.keys(spanishFlatCatalog).sort();

	if (englishKeys.length !== spanishKeys.length) {
		throw new Error('English and Spanish UI catalogs must contain the same number of keys.');
	}

	for (const [index, englishKey] of englishKeys.entries()) {
		if (spanishKeys[index] !== englishKey) {
			throw new Error(`UI catalog key parity failed at "${englishKey}".`);
		}
	}

	for (const [locale, catalog] of Object.entries(uiCatalogs)) {
		for (const [key, value] of Object.entries(catalog)) {
			if (value.trim().length === 0) {
				throw new MissingUiTranslationError(locale as Language, key);
			}
		}
	}

	return true;
}

export function getUiCatalog(locale: Language): Readonly<Record<UiCatalogKey, string>> {
	return uiCatalogs[locale];
}

export function translateUi(locale: Language, key: UiCatalogKey): string {
	const value = uiCatalogs[locale]?.[key];
	if (typeof value !== 'string' || value.trim().length === 0) {
		throw new MissingUiTranslationError(locale, key);
	}
	return value;
}

export function createUiTranslator(locale: Language) {
	return <Key extends UiCatalogKey>(key: Key): string => translateUi(locale, key);
}

export function getUiCatalogNamespace<Namespace extends UiCatalogNamespace>(
	locale: Language,
	namespace: Namespace
): Readonly<Record<UiCatalogScopedKey<Namespace>, string>> {
	const prefix = `${namespace}.`;
	return Object.fromEntries(
		Object.entries(uiCatalogs[locale])
			.filter(([key]) => key.startsWith(prefix))
			.map(([key, value]) => [key.slice(prefix.length), value])
	) as Record<UiCatalogScopedKey<Namespace>, string>;
}

export function createScopedUiTranslator<Namespace extends UiCatalogNamespace>(
	locale: Language,
	namespace: Namespace
) {
	return (key: UiCatalogScopedKey<Namespace>): string =>
		translateUi(locale, `${namespace}.${key}` as UiCatalogKey);
}

validateUiCatalogs();
