import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const beforeDirectory = resolve(process.env.DESIGN_SYSTEM_BEFORE_DIR ?? 'baseline');
const afterDirectory = resolve(process.env.DESIGN_SYSTEM_AFTER_DIR ?? '.');
const outputDirectory = resolve(process.env.DESIGN_SYSTEM_EVIDENCE_DIR ?? 'design-system-evidence');
const beforeUrl = 'http://127.0.0.1:4322';
const afterUrl = 'http://127.0.0.1:4323';

const servers = [];

function startPreview(directory, port) {
	const server = spawn(
		'bun',
		['x', 'astro', 'preview', '--host', '127.0.0.1', '--port', String(port)],
		{
			cwd: directory,
			stdio: ['ignore', 'pipe', 'pipe'],
			env: { ...process.env, CI: 'true' },
		}
	);
	server.stdout.on('data', chunk => process.stdout.write(`[preview:${port}] ${chunk}`));
	server.stderr.on('data', chunk => process.stderr.write(`[preview:${port}] ${chunk}`));
	servers.push(server);
	return server;
}

async function waitForUrl(url) {
	const deadline = Date.now() + 45_000;
	let lastError;
	while (Date.now() < deadline) {
		try {
			const response = await fetch(url);
			if (response.ok) return;
			lastError = new Error(`${url} returned ${response.status}`);
		} catch (error) {
			lastError = error;
		}
		await new Promise(resolvePromise => setTimeout(resolvePromise, 500));
	}
	throw new Error(`Preview did not become ready: ${url}`, { cause: lastError });
}

const scenarios = [
	{
		name: 'home-en-light-desktop',
		path: '/',
		theme: 'light',
		viewport: { width: 1440, height: 1000 },
	},
	{
		name: 'home-es-dark-desktop',
		path: '/es/',
		theme: 'dark',
		viewport: { width: 1440, height: 1000 },
	},
	{
		name: 'home-en-dark-mobile',
		path: '/',
		theme: 'dark',
		viewport: { width: 390, height: 844 },
	},
	{
		name: 'not-found-light',
		path: '/missing-design-system-evidence',
		theme: 'light',
		viewport: { width: 1280, height: 900 },
	},
	{
		name: 'cli-dark',
		path: '/',
		theme: 'dark',
		viewport: { width: 1280, height: 900 },
		prepare: async page => {
			await page.keyboard.press('Shift+;');
			await page.locator('#cli-overlay').waitFor({ state: 'visible' });
		},
	},
	{
		name: 'splash-dark',
		path: '/?retro=1',
		theme: 'dark',
		viewport: { width: 1280, height: 900 },
		prepare: async page => {
			await page.locator('#splash-screen').waitFor({ state: 'visible' });
		},
	},
];

async function captureSide(browser, side, baseUrl) {
	for (const scenario of scenarios) {
		const context = await browser.newContext({ viewport: scenario.viewport });
		await context.addInitScript(theme => {
			localStorage.setItem('theme', theme);
		}, scenario.theme);
		const page = await context.newPage();
		await page.goto(`${baseUrl}${scenario.path}`, { waitUntil: 'networkidle' });
		await page.addStyleTag({
			content: `
				*, *::before, *::after {
					animation-duration: 0s !important;
					animation-delay: 0s !important;
					transition-duration: 0s !important;
				}
			`,
		});
		if (scenario.prepare) await scenario.prepare(page);
		await page.screenshot({
			path: resolve(outputDirectory, `${scenario.name}-${side}.png`),
			fullPage: scenario.name.startsWith('home-'),
		});
		await context.close();
	}
}

try {
	await mkdir(outputDirectory, { recursive: true });
	startPreview(beforeDirectory, 4322);
	startPreview(afterDirectory, 4323);
	await Promise.all([waitForUrl(beforeUrl), waitForUrl(afterUrl)]);

	const browser = await chromium.launch({ headless: true });
	try {
		await captureSide(browser, 'before', beforeUrl);
		await captureSide(browser, 'after', afterUrl);
	} finally {
		await browser.close();
	}
} finally {
	for (const server of servers) server.kill('SIGTERM');
}
