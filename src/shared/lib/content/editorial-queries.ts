import { Language, type LocalizedPathMap } from '@shared/config/i18n';
import {
	getContentLanguage,
	isContentForLanguage,
	stripContentLocalePrefix,
} from './locale-content-id';
import { findTranslationCounterpart } from './translation-pairing';

export interface EditorialEntry {
	id: string;
	data: {
		translationKey: string;
		pubDate: Date;
	};
}

/**
 * Filter, sort, and resolve paths for any editorial content collection.
 */
export function filterAndSortEditorialPosts<T extends EditorialEntry>(
	posts: readonly T[],
	lang: Language,
	filterFn: (post: T) => boolean = () => true
): T[] {
	return posts
		.filter(post => isContentForLanguage(post.id, lang) && filterFn(post))
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function getEditorialSlug(post: { id: string }): string {
	return stripContentLocalePrefix(post.id);
}

export function resolveEditorialLocalizedPaths<T extends EditorialEntry>(
	allPosts: readonly T[],
	post: T,
	resolvePath: (lang: Language, slug: string) => string,
	filterFn: (post: T) => boolean = () => true
): LocalizedPathMap {
	const sourceLanguage = getContentLanguage(post.id);
	if (!sourceLanguage) {
		throw new Error(`Unsupported locale prefix for editorial entry "${post.id}".`);
	}

	const slug = getEditorialSlug(post);
	const localizedPaths: LocalizedPathMap = {
		[sourceLanguage]: resolvePath(sourceLanguage, slug),
	};

	for (const targetLanguage of [Language.ENGLISH, Language.SPANISH]) {
		if (targetLanguage === sourceLanguage) continue;

		const counterpart = findTranslationCounterpart(allPosts, post, targetLanguage, filterFn);
		if (counterpart) {
			localizedPaths[targetLanguage] = resolvePath(
				targetLanguage,
				getEditorialSlug(counterpart)
			);
		}
	}

	return localizedPaths;
}
