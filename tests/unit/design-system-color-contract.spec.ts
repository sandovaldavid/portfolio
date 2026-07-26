import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');

const colors = readSource('src/app/styles/colors.css');
const buttons = readSource('src/shared/ui/button/button.css');
const logo = readSource('src/widgets/header/ui/BrandLogo.astro');
const header = readSource('src/widgets/header/ui/Header.astro');
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

const approvedPrimitives: Record<string, string> = {
	'--color-primary-50': 'oklch(97.318% 0.01305 251.56)',
	'--color-primary-100': 'oklch(94.544% 0.02585 248.1)',
	'--color-primary-200': 'oklch(88.896% 0.05659 241.17)',
	'--color-primary-300': 'oklch(80.049% 0.10523 240.14)',
	'--color-primary-400-light': 'oklch(62.308% 0.18801 259.81)',
	'--color-primary-400-dark': 'oklch(81.362% 0.14541 217.11)',
	'--color-primary-500-light': 'oklch(50.992% 0.20091 260.06)',
	'--color-primary-500-dark': 'oklch(72.084% 0.16317 239.29)',
	'--color-primary-600-light': 'oklch(45.378% 0.21747 262.45)',
	'--color-primary-600-dark': 'oklch(61.517% 0.21082 256.1)',
	'--color-primary-700': 'oklch(48.82% 0.21717 264.38)',
	'--color-primary-800': 'oklch(42.445% 0.18087 265.64)',
	'--color-primary-900': 'oklch(37.906% 0.13776 265.52)',
	'--color-primary-950': 'oklch(28.226% 0.08745 267.94)',
	'--color-neutral-50': 'oklch(98.817% 0.00411 271.37)',
	'--color-neutral-100': 'oklch(95.938% 0.01081 256.7)',
	'--color-neutral-200': 'oklch(92.876% 0.01262 255.51)',
	'--color-neutral-300': 'oklch(86.898% 0.01985 252.89)',
	'--color-neutral-400': 'oklch(71.067% 0.03511 256.79)',
	'--color-neutral-500': 'oklch(55.439% 0.04072 257.42)',
	'--color-neutral-600': 'oklch(44.553% 0.03745 257.28)',
	'--color-neutral-700': 'oklch(37.17% 0.03916 257.29)',
	'--color-neutral-800': 'oklch(27.95% 0.03685 260.03)',
	'--color-neutral-900': 'oklch(20.768% 0.03982 265.75)',
	'--color-neutral-950': 'oklch(10.543% 0.01489 255.89)',
	'--color-success-500': 'oklch(80.987% 0.21415 151.77)',
	'--color-success-900': 'oklch(42.539% 0.11588 144.31)',
	'--color-warning-500': 'oklch(84.417% 0.17216 84.93)',
	'--color-warning-900': 'oklch(70.757% 0.19745 46.46)',
	'--color-error-500': 'oklch(63.747% 0.24894 20.73)',
	'--color-error-900': 'oklch(50.164% 0.18868 27.48)',
	'--color-base-white': 'oklch(100% 0 0)',
	'--color-base-background-light': 'oklch(97.799% 0.00622 255.47)',
	'--color-base-surface-highlight-light': 'oklch(94.778% 0.01616 262.75)',
	'--color-base-surface-dark': 'oklch(15.939% 0.01573 266.59)',
	'--color-base-surface-highlight-dark': 'oklch(22.235% 0.02948 263.69)',
	'--color-base-content-strong-dark': 'oklch(96.826% 0.00685 247.9)',
	'--color-base-status-success-text-light': 'oklch(43.18% 0.08647 166.91)',
	'--color-base-status-success-text-dark': 'oklch(77.294% 0.15349 163.22)',
	'--color-retro-phosphor': 'oklch(87.628% 0.22779 152.55)',
	'--color-terminal-success': 'oklch(87.628% 0.22779 152.55)',
};

describe('Portfolio Retro color architecture', () => {
	it('copies every approved production primitive from Figma in canonical OKLCH', () => {
		for (const [token, value] of Object.entries(approvedPrimitives)) {
			expect(colors, token).toContain(`${token}: ${value};`);
		}
		expect(colors).toContain('Canonical authoring is OKLCH in the sRGB working gamut');
	});

	it('keeps primitives, semantic roles, channel aliases and component roles in order', () => {
		const primitiveIndex = colors.indexOf('Identity Core primitives.');
		const semanticIndex = colors.indexOf('Shared semantic roles:');
		const channelIndex = colors.indexOf('Portfolio channel aliases:');
		const componentIndex = colors.indexOf('Component roles:');

		expect(primitiveIndex).toBeGreaterThanOrEqual(0);
		expect(semanticIndex).toBeGreaterThan(primitiveIndex);
		expect(channelIndex).toBeGreaterThan(semanticIndex);
		expect(componentIndex).toBeGreaterThan(channelIndex);
	});

	it('does not declare duplicate custom-property names', () => {
		const declarations = [...colors.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map(
			match => match[1]
		);
		const duplicates = declarations.filter(
			(token, index) => declarations.indexOf(token) !== index
		);
		expect([...new Set(duplicates)]).toEqual([]);
	});

	it('maps the exact Figma Portfolio channel and terminal aliases', () => {
		for (const contract of [
			'--channel-accent-primary: light-dark(',
			'--channel-accent-secondary: light-dark(',
			'--channel-status-online: light-dark(',
			'--color-terminal-background: var(--color-neutral-950);',
			'--color-terminal-surface: var(--color-base-surface-dark);',
			'--color-terminal-content: var(--color-base-content-strong-dark);',
			'--color-terminal-cyan: var(--color-primary-500-dark);',
			'--color-terminal-cyan-bright: var(--color-primary-400-dark);',
			'--color-terminal-phosphor: var(--color-retro-phosphor);',
			'--color-terminal-grid: var(--color-neutral-800);',
		]) {
			expect(colors, contract).toContain(contract);
		}
	});

	it('keeps default and hover button states above WCAG AA in both modes', () => {
		for (const [foreground, background] of [
			['#FFFFFF', '#0A5CD6'],
			['#FFFFFF', '#0044CC'],
			['#020408', '#00B0FF'],
			['#020408', '#00D8FF'],
		] as const) {
			expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
		}
		expect(colors).toContain('var(--color-primary-600-light)');
		expect(colors).toContain('var(--color-primary-400-dark)');
	});

	it('moves shared button behavior behind component colors and retro shadows', () => {
		expect(buttons).toContain('bg-button-primary-background');
		expect(buttons).toContain('hover:bg-button-primary-background-hover');
		expect(buttons).toContain('box-shadow: var(--shadow-retro-md);');
		expect(buttons).toContain('box-shadow: var(--shadow-retro-xl);');
		expect(buttons).toContain('box-shadow: var(--shadow-retro-xs);');
		expect(buttons).not.toMatch(/box-shadow:\s*\d/);
		expect(buttons).not.toContain('hover:bg-primary-400');
	});

	it('uses explicit logo roles with the approved dark bracket base and reduced motion', () => {
		expect(colors).toContain(
			'--color-logo-brackets: light-dark(var(--color-primary-800), var(--color-primary-400-light));'
		);
		expect(logo).toContain('text-logo-primary');
		expect(logo).toContain('var(--color-logo-effect-magenta)');
		expect(logo).toContain('@media (prefers-reduced-motion: reduce)');
		expect(logo).not.toMatch(/#(?:1e40af|3b82f6)/i);
	});

	it('removes raw color literals from production consumers except governed artwork and print CSS', () => {
		const excludedRoots = ['src/assets/'];
		const excludedFiles = new Set(['src/app/styles/colors.css', 'src/app/styles/print.css']);
		const rawColor = /(?<!&)#[0-9a-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklab|oklch|lab|lch)\(/i;
		const offenders = collectFiles('src')
			.filter(path => /\.(astro|css|ts|tsx|js|mjs)$/.test(path))
			.map(path => relative('.', path).replaceAll('\\', '/'))
			.filter(path => !excludedFiles.has(path))
			.filter(path => !excludedRoots.some(root => path.startsWith(root)))
			.filter(path => rawColor.test(readSource(path)));

		expect(offenders).toEqual([]);
	});

	it('uses named roles in high-risk consumers and keeps the header derived effects tokenized', () => {
		for (const [source, expectedToken] of [
			[splash, 'bg-channel-portfolio-terminal-background'],
			[cliCatalog, 'border-channel-portfolio-terminal-cyan'],
			[cliRuntime, 'text-channel-portfolio-terminal-phosphor'],
			[recruiterHud, 'bg-button-primary-background'],
			[themeToggle, 'bg-theme-menu-background'],
			[notFound, 'bg-channel-background-canvas'],
			[header, 'var(--color-header-surface-scrolled)'],
		] as const) {
			expect(source).toContain(expectedToken);
		}
		expect(header).not.toMatch(/rgba?\(|#[0-9a-f]{3,8}\b/i);
	});

	it('documents migrated, intentional, historical and follow-up inventory classes', () => {
		for (const classification of [
			'`Migrated`',
			'`Intentional exception`',
			'`Historical`',
			'`Follow-up`',
		]) {
			expect(inventory).toContain(classification);
		}
		expect(inventory).toContain('sRGB reference');
		expect(inventory).toContain('before/after');
	});
});
