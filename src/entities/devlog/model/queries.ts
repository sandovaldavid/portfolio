import { getCollection } from 'astro:content';
import { getRelativeLocaleUrl } from 'astro:i18n';
import type { Language, LocalizedPathMap } from '@shared/config/i18n';
import {
	assertUniqueTranslationKeys,
	filterAndSortEditorialPosts,
	getEditorialSlug,
	resolveEditorialLocalizedPaths,
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
	return filterAndSortEditorialPosts(posts, lang);
}

/** Returns a single post by its locale-stripped slug, or undefined if not found. */
export async function getDevlogPost(lang: Language, slug: string): Promise<DevlogPost | undefined> {
	const posts = await getDevlogPosts(lang);
	return posts.find(post => getDevlogSlug(post) === slug);
}

/** Derives the route slug (without locale prefix) from a devlog post entry. */
export const getDevlogSlug = getEditorialSlug;

/** Returns only verified locale paths for a devlog entry and its counterpart. */
export async function getDevlogLocalizedPaths(post: DevlogPost): Promise<LocalizedPathMap> {
	const posts = await getValidatedDevlogEntries();
	return resolveEditorialLocalizedPaths(posts, post, (lang, slug) =>
		getRelativeLocaleUrl(lang, `devlog/${slug}`)
	);
}
