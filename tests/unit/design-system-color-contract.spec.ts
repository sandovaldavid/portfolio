import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');

const colors = readSource('src/app/styles/colors.css');
const buttons = readSource('src/shared/ui/button/button.css');
const logo = readSource('src/widgets/header/ui/BrandLogo.astro');
const splash = readSource('src/features/splash-screen/ui/SplashScreen.astro');
const cliCatalog = readSource('src/features/cli-terminal/ui/CLITerminalCatalog.astro');
const cliRuntime = readSource('src/features/cli-terminal/model/runtime.ts');
const recruiterHud = readSource('src/widgets/recruiter-hud/ui/RecruiterHUD.astro');
const themeToggle = readSource('src/features/theme-toggle/ui/ThemeToggle.astro');
const notFound = readSource('src/pages/404.astro');
const inventory = readSource('docs/design-system/portfolio-retro-color-inventory.md');

function collectFiles(directory: string): string[] {
	return readdirSync(directory).flatMap(entry => {
		const path = join(directory, entry);
		return statSync(path).isDirectory() ? collectFiles(path) : [path];
	});
}

function hexToRgb(hex: string): [number, number, number] {
	const normalized = hex.replace('#', '');
	return [0, 2, 4].map(offset => Number.parseInt(normalized.slice(offset, offset + 2), 16)) as [
		number,
		number,
		number,
	];
}

function relativeLuminance(hex: string): number {
	const [red, green, blue] = hexToRgb(hex).map(channel => {
		const normalized = channel / 255;
		return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
	});
	return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

function contrastRatio(foreground: string, background: string): number {
	const foregroundLuminance = relativeLuminance(foreground);
	const backgroundLuminance = relativeLuminance(background);
	const lighter = Math.max(foregroundLuminance, backgroundLuminance);
	const darker = Math.min(foregroundLuminance, backgroundLuminance);
	return (lighter + 0.05) / (darker + 0.05);
}

describe('Portfolio Retro color architecture', () => {
	it('keeps primitives, semantic roles, channel aliases and component roles in order', () => {
		const primitiveIndex = colors.indexOf('/* Identity Core primitives */');
		const semanticIndex = colors.indexOf('/* Shared semantic roles */');
		const channelIndex = colors.indexOf('/* Portfolio Retro channel aliases */');
		const componentIndex = colors.indexOf('/* Component roles */');

		expect(primitiveIndex).toBeGreaterThanOrEqual(0);
		expect(semanticIndex).toBeGreaterThan(primitiveIndex);
		expect(channelIndex).toBeGreaterThan(semanticIndex);
		expect(componentIndex).toBeGreaterThan(channelIndex);
	});

	it('defines the required Portfolio Retro and terminal roles', () => {
		for (const token of [
			'--color-channel-background-canvas',
			'--color-channel-surface-default',
			'--color-channel-content-strong',
			'--color-channel-edge-default',
			'--color-channel-accent-primary',
			'--color-channel-status-online',
			'--color-channel-portfolio-terminal-background',
			'--color-channel-portfolio-terminal-cyan',
			'--color-channel-portfolio-terminal-cyan-bright',
			'--color-channel-portfolio-terminal-phosphor',
			'--color-button-primary-background-hover',
			'--color-logo-primary',
		]) {
			expect(colors, token).toContain(token);
		}
	});

	it('keeps both primary hover states above WCAG AA for normal text', () => {
		expect(contrastRatio('#ffffff', '#0044cc')).toBeGreaterThanOrEqual(4.5);
		expect(contrastRatio('#020408', '#7cc7fb')).toBeGreaterThanOrEqual(4.5);
		expect(colors).toContain('--color-primary-600: light-dark(#0044cc, #0080ff);');
		expect(colors).toContain('var(--color-primary-600),');
		expect(colors).toContain('var(--color-primary-300)');
	});

	it('moves shared button colors and shadows behind component roles', () => {
		expect(buttons).toContain('bg-button-primary-background');
		expect(buttons).toContain('hover:bg-button-primary-background-hover');
		expect(buttons).toContain('box-shadow: var(--shadow-retro-md);');
		expect(buttons).toContain('box-shadow: var(--shadow-retro-xl);');
		expect(buttons).toContain('box-shadow: var(--shadow-retro-xs);');
		expect(buttons).not.toMatch(/box-shadow:\s*\d/);
		expect(buttons).not.toContain('hover:bg-primary-400');
	});

	it('gives the logo explicit roles and the approved dark base', () => {
		expect(colors).toContain(
			'--color-logo-primary: light-dark(var(--color-primary-500), #3b82f6);'
		);
		expect(logo).toContain('text-logo-primary');
		expect(logo).toContain('var(--color-logo-effect-magenta)');
		expect(logo).toContain('@media (prefers-reduced-motion: reduce)');
		expect(logo).not.toContain('#1e40af');
	});

	it('uses channel and component roles in the representative consumers', () => {
		for (const [source, expectedToken] of [
			[splash, 'bg-channel-portfolio-terminal-background'],
			[cliCatalog, 'border-channel-portfolio-terminal-cyan'],
			[cliRuntime, 'text-channel-portfolio-terminal-phosphor'],
			[recruiterHud, 'bg-button-primary-background'],
			[themeToggle, 'bg-theme-menu-background'],
			[notFound, 'bg-channel-background-canvas'],
		] as const) {
			expect(source).toContain(expectedToken);
		}
	});

	it('removes terminal literals from production consumers except vendor artwork', () => {
		const allowed = new Set(['src/assets/technologies/React.astro']);
		const offenders = collectFiles('src')
			.filter(path => /\.(astro|css|ts)$/.test(path))
			.filter(path => !allowed.has(relative('.', path)))
			.filter(path => path !== 'src/app/styles/colors.css')
			.filter(path => /#00(?:b0ff|d8ff|ff88)/i.test(readSource(path)))
			.map(path => relative('.', path));

		expect(offenders).toEqual([]);
	});

	it('documents migrated, intentional, historical and unresolved inventory classes', () => {
		for (const classification of [
			'`Migrated`',
			'`Intentional exception`',
			'`Historical`',
			'`Follow-up`',
		]) {
			expect(inventory).toContain(classification);
		}
		expect(inventory).toContain('React.astro');
		expect(inventory).toContain('before/after');
	});
});
