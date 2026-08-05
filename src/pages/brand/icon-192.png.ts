import type { APIRoute } from 'astro';

import { renderProjectMark } from '@shared/lib/brand/render-brand-image';

export const prerender = true;

export const GET: APIRoute = async () =>
	new Response(await renderProjectMark('dark', 192), {
		headers: {
			'Cache-Control': 'public, max-age=31536000, immutable',
			'Content-Type': 'image/png',
		},
	});
