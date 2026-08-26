import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const locales = ['en', 'es'] as const;

describe('Project Detail MDX shell ownership', () => {
	it('keeps ProjectResources owned by the shared shell instead of localized MDX', () => {
		for (const locale of locales) {
			const directory = `src/content/projects/${locale}`;
			for (const file of readdirSync(directory).filter(name => name.endsWith('.mdx'))) {
				const source = readFileSync(`${directory}/${file}`, 'utf8');
				expect(source, `${locale}/${file}`).not.toContain('<ProjectResources');
			}
		}
	});
});
