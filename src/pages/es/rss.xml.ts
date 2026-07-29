import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getBlogPosts, getBlogSlug } from '@entities/blog';
import { createScopedUiTranslator, Language } from '@shared/config/i18n';
import { siteConfig } from '@shared/config/site.config';

export async function GET(context: APIContext) {
	const lang = Language.SPANISH;
	const tMetadata = createScopedUiTranslator(lang, 'metadata');
	const posts = await getBlogPosts(lang);
	return rss({
		title: tMetadata('rssFeedTitle'),
		description: tMetadata('rssFeedDescription'),
		site: context.site ?? siteConfig.url,
		customData: '<language>es</language>',
		items: posts.map(post => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: `/es/blog/${getBlogSlug(post)}/`,
		})),
	});
}
