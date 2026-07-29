import type { Language } from '@shared/config/i18n';
import { getContentLanguage } from './locale-content-id';

interface TranslationEntry {
	id: string;
	data: {
		translationKey: string;
	};
}

/**
 * Rejects duplicate translation identities within the same locale and collection.
 * The same identity is intentionally allowed once in English and once in Spanish.
 */
export function assertUniqueTranslationKeys<T extends TranslationEntry>(
	entries: readonly T[],
	collectionName: string
): void {
	const seen = new Map<string, string>();

	for (const entry of entries) {
		const locale = getContentLanguage(entry.id);
		if (!locale) {
			throw new Error(`Unsupported locale prefix for ${collectionName} entry "${entry.id}".`);
		}

		const identity = `${locale}:${entry.data.translationKey}`;
		const previousEntry = seen.get(identity);
		if (previousEntry) {
			throw new Error(
				`Duplicate translation key "${entry.data.translationKey}" for ${collectionName} locale "${locale}": "${previousEntry}" and "${entry.id}".`
			);
		}

		seen.set(identity, entry.id);
	}
}

/**
 * Resolves an editorial counterpart by stable identity instead of filename or slug equality.
 * The availability predicate allows callers to exclude drafts from production switching.
 */
export function findTranslationCounterpart<T extends TranslationEntry>(
	entries: readonly T[],
	source: T,
	targetLanguage: Language,
	isAvailable: (entry: T) => boolean = () => true
): T | undefined {
	return entries.find(
		entry =>
			getContentLanguage(entry.id) === targetLanguage &&
			entry.data.translationKey === source.data.translationKey &&
			isAvailable(entry)
	);
}
