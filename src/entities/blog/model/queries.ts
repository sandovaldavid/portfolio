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
	return posts
		.filter(post => isContentForLanguage(post.id, lang) && isPublished(post))
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Returns a single post by its locale-stripped slug, or undefined if not found. */
export async function getBlogPost(lang: Language, slug: string): Promise<BlogPost | undefined> {
	const posts = await getBlogPosts(lang);
	return posts.find(post => getBlogSlug(post) === slug);
}

/** Derives the route slug (without locale prefix) from a blog post entry. */
export function getBlogSlug(post: BlogPost): string {
	return stripContentLocalePrefix(post.id);
}

function getBlogPath(lang: Language, post: BlogPost): string {
	return getRelativeLocaleUrl(lang, `blog/${getBlogSlug(post)}`);
}

/**
 * Returns only verified locale paths for a post and its published counterpart.
 * A draft counterpart is intentionally unavailable in production.
 */
export async function getBlogLocalizedPaths(post: BlogPost): Promise<LocalizedPathMap> {
	const sourceLanguage = getContentLanguage(post.id);
	if (!sourceLanguage) {
		throw new Error(`Unsupported locale prefix for blog entry "${post.id}".`);
	}

	const posts = await getValidatedBlogEntries();
	const localizedPaths: LocalizedPathMap = {
		[sourceLanguage]: getBlogPath(sourceLanguage, post),
	};

	for (const targetLanguage of [Language.ENGLISH, Language.SPANISH]) {
		if (targetLanguage === sourceLanguage) continue;

		const counterpart = findTranslationCounterpart(posts, post, targetLanguage, isPublished);
		if (counterpart) {
			localizedPaths[targetLanguage] = getBlogPath(targetLanguage, counterpart);
		}
	}

	return localizedPaths;
}
