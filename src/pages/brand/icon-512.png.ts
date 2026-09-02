import type { APIRoute } from 'astro';

import { renderAppIcon } from '@shared/lib/brand';

export const prerender = true;

export const GET: APIRoute = async () =>
	new Response(await renderAppIcon('dark', 512), {
		headers: {
			'Cache-Control': 'public, max-age=31536000, immutable',
			'Content-Type': 'image/png',
		},
	});
