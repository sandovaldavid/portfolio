#!/usr/bin/env node

import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');
const outputRoot = path.join(repositoryRoot, 'test-results', 'manual-screenshots');
const baseUrl = 'http://localhost:4321';

const devices = {
	mobile: { width: 390, height: 844, name: 'iPhone 12 Pro', directory: 'mobile' },
	tablet: { width: 1024, height: 1366, name: 'iPad Pro', directory: 'tablet' },
	desktop: { width: 1920, height: 1080, name: 'Desktop', directory: 'desktop' },
};

const routes = [
	{ url: '/', name: 'home-en' },
	{ url: '/about', name: 'about-en' },
	{ url: '/projects', name: 'projects-en' },
	{ url: '/es/', name: 'home-es' },
	{ url: '/es/about', name: 'about-es' },
	{ url: '/es/projects', name: 'projects-es' },
];

function ensureDirectory(directory) {
	if (!existsSync(directory)) mkdirSync(directory, { recursive: true });
}

async function captureScreenshot(page, device, route) {
	await page.setViewportSize({ width: device.width, height: device.height });

	const filename = `${device.directory}_${route.name}.png`;
	const filepath = path.join(outputRoot, device.directory, filename);

	try {
		await page.goto(`${baseUrl}${route.url}`, {
			waitUntil: 'networkidle',
			timeout: 10_000,
		});
		await page.waitForTimeout(1_000);
		await page.screenshot({ path: filepath, fullPage: false });
		console.log(`✓ ${device.name.padEnd(13)} | ${route.name.padEnd(11)} | ${filename}`);
		return true;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`✗ ${device.name.padEnd(13)} | ${route.name.padEnd(11)} | ${message}`);
		return false;
	}
}

async function main() {
	for (const device of Object.values(devices)) {
		ensureDirectory(path.join(outputRoot, device.directory));
	}

	console.log(`Capturing screenshots from ${baseUrl}`);

	const browser = await chromium.launch();
	let successCount = 0;
	let totalCount = 0;

	try {
		const page = await browser.newPage();
		await page.addInitScript(() => {
			document.documentElement.style.scrollBehavior = 'auto';
		});

		for (const device of Object.values(devices)) {
			for (const route of routes) {
				totalCount += 1;
				if (await captureScreenshot(page, device, route)) successCount += 1;
			}
		}

		await page.close();
	} finally {
		await browser.close();
	}

	console.log(`${successCount}/${totalCount} screenshots written to ${outputRoot}`);
	if (successCount !== totalCount) process.exitCode = 1;
}

main().catch(error => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
});
