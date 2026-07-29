/**
 * Supported languages in the application.
 * This enum ensures type safety throughout the codebase.
 */
export enum Language {
	ENGLISH = 'en',
	SPANISH = 'es',
}

/**
 * Language metadata for display purposes
 */
export const LANGUAGE_LABELS = {
	[Language.ENGLISH]: 'English',
	[Language.SPANISH]: 'Español',
} as const;

/**
 * Language flags for UI components
 */
export const LANGUAGE_FLAGS = {
	[Language.ENGLISH]: 'US',
	[Language.SPANISH]: 'ES',
} as const;

/**
 * Default language for the application
 */
export const DEFAULT_LANGUAGE = Language.ENGLISH;

/**
 * All available languages
 */
export const AVAILABLE_LANGUAGES = Object.values(Language);

/**
 * Converts Astro's current locale into the repository's typed language.
 * Undefined or unsupported locale values use the configured routing default.
 */
export function getLanguageFromLocale(locale: string | undefined): Language {
	return AVAILABLE_LANGUAGES.includes(locale as Language)
		? (locale as Language)
		: DEFAULT_LANGUAGE;
}
