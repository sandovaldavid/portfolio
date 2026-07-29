import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const SOURCE_EXTENSIONS = new Set(['.astro', '.ts', '.tsx']);
const readSource = (filePath: string): string => readFileSync(filePath, 'utf8');

function listProductionSources(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
		const entryPath = path.join(directory, entry.name);
		if (entry.isDirectory()) return listProductionSources(entryPath);
		return SOURCE_EXTENSIONS.has(path.extname(entry.name)) ? [entryPath] : [];
	});
}

describe('legacy localization removal', () => {
	it('deletes monolithic dictionaries and mixed translator modules', () => {
		for (const removedPath of [
			'src/shared/config/i18n/locales/en.json',
			'src/shared/config/i18n/locales/es.json',
			'src/shared/config/i18n/dictionaries/index.ts',
			'src/shared/lib/i18n/translations.ts',
		]) {
			expect(existsSync(removedPath), removedPath).toBe(false);
		}
	});

	it('exposes only the supported catalog, locale and interpolation APIs', () => {
		const configIndex = readSource('src/shared/config/i18n/index.ts');
		const libIndex = readSource('src/shared/lib/i18n/index.ts');

		expect(configIndex).not.toContain('dictionaries');
		expect(configIndex).not.toContain('translations');
		expect(libIndex).not.toContain('translations');
		expect(libIndex).toContain('interpolation');
	});

	it('keeps production free from legacy translators, path helpers and direct locale imports', () => {
		for (const filePath of listProductionSources('src')) {
			const source = readSource(filePath);
			expect(source, filePath).not.toMatch(/\buseTranslations(?:List)?\b/);
			expect(source, filePath).not.toMatch(/\bgetLangFromUrl\b/);
			expect(source, filePath).not.toMatch(/\bgetLocalizedPath\b/);
			expect(source, filePath).not.toContain('config/i18n/dictionaries');

			if (filePath !== path.join('src', 'shared', 'config', 'i18n', 'catalog.ts')) {
				expect(source, filePath).not.toMatch(
					/(?:@shared\/config\/i18n\/locales|\.\/locales\/)/
				);
			}
		}
	});
});
