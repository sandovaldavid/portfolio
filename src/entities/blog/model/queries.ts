import { getCollection } from 'astro:content';
import { getRelativeLocaleUrl } from 'astro:i18n';
import type { Language, LocalizedPathMap } from '@shared/config/i18n';
import {
	assertUniqueTranslationKeys,
	filterAndSortEditorialPosts,
	getEditorialSlug,
	resolveEditorialLocalizedPaths,
} from '@shared/lib/content';
import type { BlogPost } from './types';

function isPublished(post: BlogPost): boolean {
	return import.meta.env.PROD ? !post.data.draft : true;
}

async function getValidatedBlogEntries(): Promise<BlogPost[]> {
	const posts = await getCollection('blog');
	assertUniqueTranslationKeys(posts, 'blog');
	return posts;
}

/**
 * Returns all published posts for a given locale, sorted by pubDate desc.
 * Drafts are excluded in production builds.
 */
export async function getBlogPosts(lang: Language): Promise<BlogPost[]> {
	const posts = await getValidatedBlogEntries();
	return filterAndSortEditorialPosts(posts, lang, isPublished);
}

/** Returns a single post by its locale-stripped slug, or undefined if not found. */
export async function getBlogPost(lang: Language, slug: string): Promise<BlogPost | undefined> {
	const posts = await getBlogPosts(lang);
	return posts.find(post => getBlogSlug(post) === slug);
}

/** Derives the route slug (without locale prefix) from a blog post entry. */
export const getBlogSlug = getEditorialSlug;

/**
 * Returns only verified locale paths for a post and its published counterpart.
 * A draft counterpart is intentionally unavailable in production.
 */
export async function getBlogLocalizedPaths(post: BlogPost): Promise<LocalizedPathMap> {
	const posts = await getValidatedBlogEntries();
	return resolveEditorialLocalizedPaths(
		posts,
		post,
		(lang, slug) => getRelativeLocaleUrl(lang, `blog/${slug}`),
		isPublished
	);
}
