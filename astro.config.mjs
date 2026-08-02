// @ts-check
import { defineConfig, fontProviders, svgoOptimizer } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

const analyzeBundle = process.env.ANALYZE_BUNDLE === 'true';

// https://astro.build/config
export default defineConfig({
	experimental: {
		svgOptimizer: svgoOptimizer({
			plugins: ['preset-default', 'removeXMLNS'],
		}),
	},
	// ponytail: robots.txt is static public output; no integration needed.
	integrations: [mdx(), sitemap()],
	site: 'https://sandovaldavid.com',
	// Keep the Astro 6 whitespace contract while adopting Astro 7's Rust compiler.
	compressHTML: true,
	// Only links marked with data-astro-prefetch participate in speculative loading.
	prefetch: {
		prefetchAll: false,
		defaultStrategy: 'hover',
	},
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Press Start 2P',
			cssVariable: '--font-pixel',
			fallbacks: ['monospace'],
			options: {
				variants: [
					{
						weight: '400',
						style: 'normal',
						src: ['./src/assets/fonts/press-start-2p-400.woff2'],
					},
				],
			},
		},
		{
			provider: fontProviders.local(),
			name: 'VT323',
			cssVariable: '--font-pixel-clean',
			fallbacks: ['monospace'],
			options: {
				variants: [
					{ weight: '400', style: 'normal', src: ['./src/assets/fonts/vt323-400.woff2'] },
				],
			},
		},
		{
			provider: fontProviders.local(),
			name: 'Silkscreen',
			cssVariable: '--font-retro-tag',
			fallbacks: ['monospace'],
			options: {
				variants: [
					{
						weight: '400',
						style: 'normal',
						src: ['./src/assets/fonts/silkscreen-400.woff2'],
					},
				],
			},
		},
		{
			provider: fontProviders.local(),
			name: 'Share Tech Mono',
			cssVariable: '--font-gaming-mono',
			fallbacks: ['monospace'],
			options: {
				variants: [
					{
						weight: '400',
						style: 'normal',
						src: ['./src/assets/fonts/share-tech-mono-400.woff2'],
					},
				],
			},
		},
		{
			provider: fontProviders.local(),
			name: 'JetBrains Mono',
			cssVariable: '--font-mono',
			fallbacks: ['monospace'],
			options: {
				variants: [
					{
						weight: '400',
						style: 'normal',
						src: ['./src/assets/fonts/jetbrains-mono-400.woff2'],
					},
				],
			},
		},
	],
	vite: {
		plugins: [
			// @ts-ignore - Tailwind CSS plugin type compatibility
			tailwindcss(),
			...(analyzeBundle
				? [
						visualizer({
							filename: 'bundle-analysis/index.html',
							title: 'Bundle Analysis - Portfolio',
							template: 'treemap',
							gzipSize: true,
							brotliSize: true,
						}),
					]
				: []),
		],
	},
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'es'],
		routing: {
			prefixDefaultLocale: false,
		},
	},
});
