import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');
const projectCard = readSource('src/entities/project/ui/ProjectCard.astro');
const cliTerminal = readSource('src/features/cli-terminal/ui/CLITerminalHome.astro');
const cliIndex = readSource('src/features/cli-terminal/index.ts');

describe('Route performance scope contract', () => {
	it('keeps catalog images below the primary-card raster target', () => {
		expect(projectCard).toContain(
			'const mediaWidth = isPrimary ? 800 : isCatalog ? 640 : 600;'
		);
		expect(projectCard).toContain(
			'const mediaSourceHeight = isPrimary ? 500 : isCatalog ? 400 : 380;'
		);
		expect(projectCard).toContain('width={mediaWidth}');
		expect(projectCard).toContain('height={mediaSourceHeight}');
	});

	it('keeps the section-oriented CLI terminal on localized home routes only', () => {
		expect(cliIndex).toContain("from './ui/CLITerminalHome.astro'");
		expect(cliTerminal).toContain("import { getPathByLocale } from 'astro:i18n'");
		expect(cliTerminal).toContain("Astro.url.pathname.split('/').filter(Boolean)");
		expect(cliTerminal).toContain('pathnameSegments.length === 0');
		expect(cliTerminal).toContain('pathnameSegments.length === 1');
		expect(cliTerminal).toContain('pathnameSegments[0] === localePath');
		expect(cliTerminal).toContain('isHome && <CLITerminalCatalog />');
	});
});
