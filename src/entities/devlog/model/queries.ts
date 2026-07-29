import { getCollection } from 'astro:content';
import { getRelativeLocaleUrl } from 'astro:i18n';
import { Language, type LocalizedPathMap } from '@shared/config/i18n';
import {
	assertUniqueTranslationKeys,
	findTranslationCounterpart,
	getContentLanguage,
	isContentForLanguage,
	stripContentLocalePrefix,
} from '@shared/lib/content';
import type { DevlogPost } from './types';

async function getValidatedDevlogEntries(): Promise<DevlogPost[]> {
	const posts = await getCollection('devlog');
	assertUniqueTranslationKeys(posts, 'devlog');
	return posts;
}

/**
 * Returns all devlog posts for a given locale, sorted by pubDate desc.
 */
export async function getDevlogPosts(lang: Language): Promise<DevlogPost[]> {
	const posts = await getValidatedDevlogEntries();
	return posts
		.filter(post => isContentForLanguage(post.id, lang))
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Returns a single post by its locale-stripped slug, or undefined if not found. */
export async function getDevlogPost(lang: Language, slug: string): Promise<DevlogPost | undefined> {
	const posts = await getDevlogPosts(lang);
	return posts.find(post => getDevlogSlug(post) === slug);
}

/** Derives the route slug (without locale prefix) from a devlog post entry. */
export function getDevlogSlug(post: DevlogPost): string {
	return stripContentLocalePrefix(post.id);
}

function getDevlogPath(lang: Language, post: DevlogPost): string {
	return getRelativeLocaleUrl(lang, `devlog/${getDevlogSlug(post)}`);
}

/** Returns only verified locale paths for a devlog entry and its counterpart. */
export async function getDevlogLocalizedPaths(post: DevlogPost): Promise<LocalizedPathMap> {
	const sourceLanguage = getContentLanguage(post.id);
	if (!sourceLanguage) {
		throw new Error(`Unsupported locale prefix for devlog entry "${post.id}".`);
	}

	const posts = await getValidatedDevlogEntries();
	const localizedPaths: LocalizedPathMap = {
		[sourceLanguage]: getDevlogPath(sourceLanguage, post),
	};

	for (const targetLanguage of [Language.ENGLISH, Language.SPANISH]) {
		if (targetLanguage === sourceLanguage) continue;

		const counterpart = findTranslationCounterpart(posts, post, targetLanguage);
		if (counterpart) {
			localizedPaths[targetLanguage] = getDevlogPath(targetLanguage, counterpart);
		}
	}

	return localizedPaths;
}
