import type { APIRoute } from 'astro';

import { renderOpenGraphImage } from '@shared/lib/brand';

export const prerender = true;

export const GET: APIRoute = async () =>
	new Response(await renderOpenGraphImage('dark'), {
		headers: {
			'Cache-Control': 'public, max-age=31536000, immutable',
			'Content-Type': 'image/png',
		},
	});
