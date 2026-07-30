#!/usr/bin/env node
// @ts-check

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, 'dist');
const CONFIG_FILE = path.join(ROOT, 'config', 'performance-budgets.json');
const OUTPUT_DIR = path.join(ROOT, 'performance-report');
const OUTPUT_JSON = path.join(OUTPUT_DIR, 'route-budgets.json');
const OUTPUT_MARKDOWN = path.join(OUTPUT_DIR, 'route-budgets.md');

/** @typedef {'javascriptParsedBytes' | 'javascriptTransferBytes' | 'cssTransferBytes' | 'largestImageBytes' | 'fontPreloadCount' | 'requestCount'} MetricName */
/** @typedef {Record<MetricName, number>} Metrics */
/** @typedef {{ route: string, budgets: Metrics }} RouteBudget */
/** @typedef {{ schemaVersion: number, routes: RouteBudget[] }} BudgetConfig */
/** @typedef {{ route: string, htmlFile: string, metrics: Metrics, assets: { javascript: string[], stylesheets: string[], fonts: string[], images: string[] }, failures: string[] }} RouteResult */

/** @param {string} value */
function getAttributes(value) {
	/** @type {Record<string, string>} */
	const attributes = {};
	const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
	for (const match of value.matchAll(pattern)) {
		attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
	}
	return attributes;
}

/** @param {string} html @param {string} tagName */
function getTags(html, tagName) {
	const pattern = new RegExp(`<${tagName}\\b([^>]*)>`, 'gi');
	return [...html.matchAll(pattern)].map(match => getAttributes(match[1]));
}

/** @param {string} route */
function routeToHtmlFile(route) {
	if (route === '/') return path.join(DIST_DIR, 'index.html');
	return path.join(DIST_DIR, route.replace(/^\//, '').replace(/\/$/, ''), 'index.html');
}

/** @param {string} reference */
function resolveInternalAsset(reference) {
	if (!reference || reference.startsWith('#') || reference.startsWith('data:')) return null;
	let url;
	try {
		url = new URL(reference, 'https://portfolio.invalid/');
	} catch {
		return null;
	}
	if (url.origin !== 'https://portfolio.invalid') return null;
	const file = path.join(DIST_DIR, decodeURIComponent(url.pathname).replace(/^\//, ''));
	return existsSync(file) && statSync(file).isFile() ? file : null;
}

/** @param {string[]} values */
function unique(values) {
	return [...new Set(values)].sort();
}

/** @param {string} file */
function fileSize(file) {
	return statSync(file).size;
}

/** @param {string} file */
function gzipSize(file) {
	return gzipSync(readFileSync(file), { level: 9 }).byteLength;
}

/** @param {string} file */
function relativeAsset(file) {
	return `/${path.relative(DIST_DIR, file).split(path.sep).join('/')}`;
}

/** @param {RouteBudget} definition */
function inspectRoute(definition) {
	const htmlFile = routeToHtmlFile(definition.route);
	if (!existsSync(htmlFile)) {
		return {
			route: definition.route,
			htmlFile: path.relative(ROOT, htmlFile),
			metrics: {
				javascriptParsedBytes: 0,
				javascriptTransferBytes: 0,
				cssTransferBytes: 0,
				largestImageBytes: 0,
				fontPreloadCount: 0,
				requestCount: 0,
			},
			assets: { javascript: [], stylesheets: [], fonts: [], images: [] },
			failures: [`Generated route file is missing: ${path.relative(ROOT, htmlFile)}`],
		};
	}

	const html = readFileSync(htmlFile, 'utf8');
	const scripts = unique(
		getTags(html, 'script')
			.map(attributes => resolveInternalAsset(attributes.src))
			.filter(value => value !== null)
	);
	const links = getTags(html, 'link');
	const stylesheets = unique(
		links
			.filter(attributes => attributes.rel?.split(/\s+/).includes('stylesheet'))
			.map(attributes => resolveInternalAsset(attributes.href))
			.filter(value => value !== null)
	);
	const fonts = unique(
		links
			.filter(
				attributes =>
					attributes.rel?.split(/\s+/).includes('preload') && attributes.as === 'font'
			)
			.map(attributes => resolveInternalAsset(attributes.href))
			.filter(value => value !== null)
	);
	const images = unique([
		...getTags(html, 'img')
			.map(attributes => resolveInternalAsset(attributes.src))
			.filter(value => value !== null),
		...links
			.filter(
				attributes =>
					attributes.rel?.split(/\s+/).includes('preload') && attributes.as === 'image'
			)
			.map(attributes => resolveInternalAsset(attributes.href))
			.filter(value => value !== null),
	]);

	const requestedAssets = unique([...scripts, ...stylesheets, ...fonts, ...images]);
	/** @type {Metrics} */
	const metrics = {
		javascriptParsedBytes: scripts.reduce((total, file) => total + fileSize(file), 0),
		javascriptTransferBytes: scripts.reduce((total, file) => total + gzipSize(file), 0),
		cssTransferBytes: stylesheets.reduce((total, file) => total + gzipSize(file), 0),
		largestImageBytes: images.reduce((largest, file) => Math.max(largest, fileSize(file)), 0),
		fontPreloadCount: fonts.length,
		requestCount: requestedAssets.length + 1,
	};

	/** @type {string[]} */
	const failures = [];
	for (const metric of /** @type {MetricName[]} */ (Object.keys(definition.budgets))) {
		if (metrics[metric] > definition.budgets[metric]) {
			failures.push(
				`${metric}: ${metrics[metric]} exceeds budget ${definition.budgets[metric]}`
			);
		}
	}

	return {
		route: definition.route,
		htmlFile: path.relative(ROOT, htmlFile),
		metrics,
		assets: {
			javascript: scripts.map(relativeAsset),
			stylesheets: stylesheets.map(relativeAsset),
			fonts: fonts.map(relativeAsset),
			images: images.map(relativeAsset),
		},
		failures,
	};
}

/** @param {number} value */
function formatBytes(value) {
	if (value < 1024) return `${value} B`;
	return `${(value / 1024).toFixed(1)} KiB`;
}

/** @param {RouteResult[]} results */
function markdownReport(results) {
	const lines = [
		'# Route performance budgets',
		'',
		'Measurements use emitted production files referenced directly by each generated HTML route. Transfer sizes are deterministic gzip estimates; parsed JavaScript uses uncompressed emitted bytes.',
		'',
		'| Route | JS parsed | JS gzip | CSS gzip | Largest image | Font preloads | Critical requests | Result |',
		'|---|---:|---:|---:|---:|---:|---:|---|',
	];
	for (const result of results) {
		const metrics = result.metrics;
		lines.push(
			`| \`${result.route}\` | ${formatBytes(metrics.javascriptParsedBytes)} | ${formatBytes(metrics.javascriptTransferBytes)} | ${formatBytes(metrics.cssTransferBytes)} | ${formatBytes(metrics.largestImageBytes)} | ${metrics.fontPreloadCount} | ${metrics.requestCount} | ${result.failures.length === 0 ? 'PASS' : 'FAIL'} |`
		);
	}
	const failures = results.flatMap(result =>
		result.failures.map(failure => `- \`${result.route}\`: ${failure}`)
	);
	if (failures.length > 0) lines.push('', '## Failures', '', ...failures);
	return `${lines.join('\n')}\n`;
}

if (!existsSync(DIST_DIR)) {
	console.error('[performance] dist/ not found. Run "bun run build" first.');
	process.exit(1);
}
if (!existsSync(CONFIG_FILE)) {
	console.error('[performance] config/performance-budgets.json not found.');
	process.exit(1);
}

/** @type {BudgetConfig} */
const config = JSON.parse(readFileSync(CONFIG_FILE, 'utf8'));
const results = config.routes.map(inspectRoute);
const passed = results.every(result => result.failures.length === 0);
mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(
	OUTPUT_JSON,
	`${JSON.stringify({ generatedAt: new Date().toISOString(), passed, results }, null, 2)}\n`
);
writeFileSync(OUTPUT_MARKDOWN, markdownReport(results));
console.log(markdownReport(results));
console.log(`[performance] Reports written to ${path.relative(ROOT, OUTPUT_DIR)}/`);
if (!passed) process.exit(1);
