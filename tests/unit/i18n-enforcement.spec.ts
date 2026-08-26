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
			'src/content/experience/en/role.mdx': '---\nexperienceId: role\nlocale: en\n---\n',
			'src/content/experience/es/.gitkeep': '',
			'src/content/research/en/study.mdx': '---\nresearchId: study\nlocale: en\n---\n',
			'src/content/research/es/study.mdx': '---\nresearchId: study\nlocale: es\n---\n',
			'src/content/projects/en/project.mdx': '---\nprojectId: project\nlocale: en\n---\n',
			'src/content/projects/es/project.mdx': '---\nprojectId: project\nlocale: es\n---\n',
			'src/content/blog/en/post.mdx': '---\ntranslationKey: post\n---\n',
			'src/content/blog/es/post.mdx': '---\ntranslationKey: post\n---\n',
			'src/content/devlog/en/entry.md': '---\ntranslationKey: entry\n---\n',
			'src/content/devlog/es/entry.md': '---\ntranslationKey: entry\n---\n',
		});

		expect(() => validateLocalizedContent({ rootDir: root })).toThrowError(
			/missing es counterpart for experienceId "role"/
		);
	});

	it('reports a missing localized MDX project counterpart', () => {
		const root = createFixture({
			'src/content/portfolio-profile/en/profile.json':
				'{"profileId":"profile","locale":"en"}',
			'src/content/portfolio-profile/es/profile.json':
				'{"profileId":"profile","locale":"es"}',
			'src/content/experience/en/role.mdx': '---\nexperienceId: role\nlocale: en\n---\n',
			'src/content/experience/es/role.mdx': '---\nexperienceId: role\nlocale: es\n---\n',
			'src/content/research/en/study.mdx': '---\nresearchId: study\nlocale: en\n---\n',
			'src/content/research/es/study.mdx': '---\nresearchId: study\nlocale: es\n---\n',
			'src/content/projects/en/project.mdx': '---\nprojectId: project\nlocale: en\n---\n',
			'src/content/projects/es/.gitkeep': '',
			'src/content/blog/en/post.mdx': '---\ntranslationKey: post\n---\n',
			'src/content/blog/es/post.mdx': '---\ntranslationKey: post\n---\n',
			'src/content/devlog/en/entry.md': '---\ntranslationKey: entry\n---\n',
			'src/content/devlog/es/entry.md': '---\ntranslationKey: entry\n---\n',
		});

		expect(() => validateLocalizedContent({ rootDir: root })).toThrowError(
			/missing es counterpart for projectId "project"/
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

	it('masks script and style blocks with browser-tolerated closing tags', () => {
		const root = createFixture({
			'src/pages/demo.astro': [
				'<script>const message = "Not visible copy";</script >',
				'<style>.example::after { content: "Not visible copy"; }</style data-extra>',
				'<div>{message}</div>',
			].join('\n'),
		});

		expect(() => validateHardcodedCopy({ rootDir: root })).not.toThrow();
	});

	it('still reports visible template text after a tolerant closing tag', () => {
		const root = createFixture({
			'src/pages/demo.astro': [
				'<script>const message = "Not visible copy";</script >',
				'<p>Download resume</p>',
			].join('\n'),
		});

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

	it('accepts generated legacy redirects without weakening canonical-page contracts', () => {
		const root = createFixture({
			'dist/404.html': '<html lang="en"><head></head></html>',
			'dist/atena/index.html':
				'<head><link rel="canonical" href="/experience/atena-software-engineer"><meta http-equiv="refresh" content="0;url=/experience/atena-software-engineer"></head>',
			'dist/es/atena/index.html':
				'<head><link rel="canonical" href="/es/experience/atena-software-engineer"><meta http-equiv="refresh" content="0; url=/es/experience/atena-software-engineer"></head>',
			'dist/experience/atena-software-engineer/index.html':
				'<html lang="en"><head><link rel="canonical" href="/experience/atena-software-engineer"></head></html>',
			'dist/es/experience/atena-software-engineer/index.html':
				'<html lang="es"><head><link rel="canonical" href="/es/experience/atena-software-engineer"></head></html>',
		});

		expect(() =>
			validateGeneratedLocaleRoutes({
				rootDir: root,
				distDir: path.join(root, 'dist'),
				representativeRoutePairs: [],
			})
		).not.toThrow();
	});

	it('rejects a legacy redirect artifact that no longer points to its canonical destination', () => {
		const root = createFixture({
			'dist/404.html': '<html lang="en"><head></head></html>',
			'dist/atena/index.html':
				'<head><link rel="canonical" href="/atena"><meta http-equiv="refresh" content="0;url=/atena"></head>',
			'dist/experience/atena-software-engineer/index.html':
				'<html lang="en"><head><link rel="canonical" href="/experience/atena-software-engineer"></head></html>',
		});

		expect(() =>
			validateGeneratedLocaleRoutes({
				rootDir: root,
				distDir: path.join(root, 'dist'),
				representativeRoutePairs: [],
			})
		).toThrowError(/legacy redirect canonical for "\/atena"/);
	});
});
