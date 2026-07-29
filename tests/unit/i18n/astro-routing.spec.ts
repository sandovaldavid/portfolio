import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function listSourceFiles(directory: string): string[] {
	return readdirSync(directory).flatMap(entry => {
		const path = join(directory, entry);
		return statSync(path).isDirectory() ? listSourceFiles(path) : [path];
	});
}

const sourceFiles = listSourceFiles('src').filter(path => /\.(astro|ts)$/.test(path));
const readSource = (path: string): string => readFileSync(path, 'utf8');

describe('Astro-native locale routing ownership', () => {
	it('removes the legacy URL parser and prefix builder', () => {
		expect(existsSync('src/shared/lib/i18n/url-lang.ts')).toBe(false);
		expect(existsSync('src/shared/lib/i18n/localized-path.ts')).toBe(false);

		for (const path of sourceFiles) {
			const source = readSource(path);
			expect(source, path).not.toContain('getLangFromUrl');
			expect(source, path).not.toContain('getLocalizedPath');
		}
	});

	it('uses Astro locale context and URL helpers at the routing boundary', () => {
		const layout = readSource('src/app/layouts/Layout.astro');
		const picker = readSource('src/features/language-picker/ui/LanguagePicker.astro');
		const languages = readSource('src/shared/config/i18n/languages.ts');

		expect(layout).toContain('Astro.currentLocale');
		expect(layout).toContain('getRelativeLocaleUrl');
		expect(layout).toContain('getPathByLocale');
		expect(layout).toContain('pathHasLocale');
		expect(layout).toContain('resolvedLocalizedPaths');
		expect(languages).toContain('getLanguageFromLocale');

		expect(picker).toContain('Astro.currentLocale');
		expect(picker).toContain('data-language-base-path');
		expect(picker).toContain('preservePathShape');
		expect(picker).toContain('syncLanguageLinkState();');
		expect(picker).toContain('window.location.search');
		expect(picker).toContain('window.location.hash');
		expect(picker).not.toContain('.replace(');
		expect(picker).not.toMatch(/`\/es\$\{/);
	});

	it('delegates ordinary and content-detail paths to astro:i18n', () => {
		const blogQueries = readSource('src/entities/blog/model/queries.ts');
		const devlogQueries = readSource('src/entities/devlog/model/queries.ts');
		const config = readSource('astro.config.mjs');

		expect(blogQueries).toContain('getRelativeLocaleUrl');
		expect(devlogQueries).toContain('getRelativeLocaleUrl');
		expect(config).toContain('prefixDefaultLocale: false');
	});
});
