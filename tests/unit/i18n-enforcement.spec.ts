import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { validateCatalogs } from '../../scripts/i18n/check-catalogs.mjs';
import { validateLocalizedContent } from '../../scripts/i18n/check-content.mjs';
import { validateHardcodedCopy } from '../../scripts/i18n/check-hardcoded.mjs';
import { validateGeneratedLocaleRoutes } from '../../scripts/i18n/check-routes.mjs';

const fixtures: string[] = [];

function createFixture(files: Record<string, string>): string {
	const root = mkdtempSync(path.join(tmpdir(), 'portfolio-i18n-'));
	fixtures.push(root);
	for (const [relativePath, content] of Object.entries(files)) {
		const filePath = path.join(root, relativePath);
		mkdirSync(path.dirname(filePath), { recursive: true });
		writeFileSync(filePath, content);
	}
	return root;
}

afterEach(() => {
	for (const fixture of fixtures.splice(0)) {
		rmSync(fixture, { recursive: true, force: true });
	}
});

describe('i18n repository enforcement', () => {
	it('accepts the current static catalog, content and production-copy contracts', () => {
		expect(() => validateCatalogs()).not.toThrow();
		expect(() => validateLocalizedContent()).not.toThrow();
		expect(() => validateHardcodedCopy()).not.toThrow();
	});

	it('reports the exact locale module and key when catalog parity drifts', () => {
		const root = createFixture({
			'src/shared/config/i18n/locales/en/common.json': '{"greeting":"Hello"}',
			'src/shared/config/i18n/locales/es/common.json': '{}',
			'src/shared/config/i18n/catalog.ts': [
				"import commonEn from './locales/en/common.json';",
				"import commonEs from './locales/es/common.json';",
			].join('\n'),
		});

		expect(() => validateCatalogs({ rootDir: root })).toThrowError(
			/src\/shared\/config\/i18n\/locales\/es\/common\.json: missing key "greeting"/
		);
	});

	it('reports missing stable structured-content counterparts', () => {
		const root = createFixture({
			'src/content/portfolio-profile/en/profile.json':
				'{"profileId":"profile","locale":"en"}',
			'src/content/portfolio-profile/es/profile.json':
				'{"profileId":"profile","locale":"es"}',
			'src/content/experience/en/role.json': '{"experienceId":"role","locale":"en"}',
			'src/content/experience/es/.gitkeep': '',
			'src/content/research/en/study.json': '{"researchId":"study","locale":"en"}',
			'src/content/research/es/study.json': '{"researchId":"study","locale":"es"}',
			'src/content/projects/en/project.json': '{"projectId":"project","locale":"en"}',
			'src/content/projects/es/project.json': '{"projectId":"project","locale":"es"}',
			'src/content/blog/en/post.mdx': '---\ntranslationKey: post\n---\n',
			'src/content/blog/es/post.mdx': '---\ntranslationKey: post\n---\n',
			'src/content/devlog/en/entry.md': '---\ntranslationKey: entry\n---\n',
			'src/content/devlog/es/entry.md': '---\ntranslationKey: entry\n---\n',
		});

		expect(() => validateLocalizedContent({ rootDir: root })).toThrowError(
			/missing es counterpart for experienceId "role"/
		);
	});

	it('reports hardcoded visible and accessible text with its source line', () => {
		const root = createFixture({
			'src/pages/demo.astro':
				'<button aria-label="Download resume">Download resume</button>\n',
		});

		expect(() => validateHardcodedCopy({ rootDir: root })).toThrowError(
			/src\/pages\/demo\.astro:1: hardcoded user-facing aria-label value "Download resume"/
		);
		expect(() => validateHardcodedCopy({ rootDir: root })).toThrowError(
			/hardcoded visible text "Download resume"/
		);
	});

	it('ignores language-neutral locale codes and decorative single-token identifiers', () => {
		const root = createFixture({
			'src/app/metadata.ts':
				"const ogLocale = lang === Language.ENGLISH ? 'en_US' : 'es_PE';\n",
			'src/widgets/brand/ui/Brand.astro': '<span>&lt;sandovaldavid/&gt;</span>\n',
		});

		expect(() => validateHardcodedCopy({ rootDir: root })).not.toThrow();
	});

	it('does not expose a migration-debt bypass', () => {
		const config = readFileSync('scripts/i18n/config.mjs', 'utf8');
		const checker = readFileSync('scripts/i18n/check-hardcoded.mjs', 'utf8');

		expect(config).not.toContain('HARD_CODED_COPY_DEBT_BASELINE');
		expect(checker).not.toContain('debtBaseline');
		expect(checker).not.toContain('applyDebtBaseline');
		expect(checker).not.toContain('findingsDigest');
	});

	it('reports broken generated alternates and English-only Spanish output', () => {
		const root = createFixture({
			'dist/index.html':
				'<html lang="en"><head><link rel="canonical" href="https://sandovaldavid.com/"><link rel="alternate" hreflang="en" href="/"><link rel="alternate" hreflang="es" href="/es/"><link rel="alternate" hreflang="x-default" href="/"></head></html>',
			'dist/es/index.html':
				'<html lang="es"><head><link rel="canonical" href="https://sandovaldavid.com/es/"><link rel="alternate" hreflang="en" href="/"><link rel="alternate" hreflang="es" href="/es/"><link rel="alternate" hreflang="x-default" href="/"></head><body>Skip to main content</body></html>',
		});

		expect(() =>
			validateGeneratedLocaleRoutes({ rootDir: root, distDir: path.join(root, 'dist') })
		).toThrowError(
			/Spanish generated page contains known English-only phrase "Skip to main content"/
		);
	});
});
