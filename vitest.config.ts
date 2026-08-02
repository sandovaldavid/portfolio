import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import path from 'path';

const root = fileURLToPath(new URL('.', import.meta.url));

/**
 * Risk-based unit coverage scope.
 *
 * These files contain deterministic logic that can be exercised without Astro's runtime or a
 * browser. The percentages do not represent whole-repository coverage; the executable scope below
 * is authoritative.
 */
const unitCoverageScope = [
	'src/shared/lib/i18n/**/*.ts',
	'src/shared/config/i18n/**/*.ts',
	'src/shared/lib/content/locale-content-id.ts',
];

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['tests/unit/**/*.spec.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'text-summary', 'json', 'json-summary', 'html', 'lcov'],
			include: unitCoverageScope,
			exclude: [
				'node_modules/',
				'dist/',
				'tests/',
				'**/*.spec.ts',
				'**/*.test.ts',
				'src/shared/config/i18n/locales/**',
			],
			thresholds: {
				lines: 90,
				functions: 90,
				branches: 90,
				statements: 90,
			},
		},
	},
	resolve: {
		alias: {
			'@shared': path.resolve(root, 'src/shared'),
			'@entities': path.resolve(root, 'src/entities'),
			'@features': path.resolve(root, 'src/features'),
			'@widgets': path.resolve(root, 'src/widgets'),
			'@app': path.resolve(root, 'src/app'),
			'@assets': path.resolve(root, 'src/assets'),
		},
	},
});
