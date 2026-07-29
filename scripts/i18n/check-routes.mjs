import { existsSync } from 'node:fs';
import path from 'node:path';
import { REPRESENTATIVE_ROUTE_PAIRS, SPANISH_FORBIDDEN_PHRASES } from './config.mjs';
import {
	assertNoIssues,
	isDirectExecution,
	listFiles,
	normalizePath,
	readText,
	REPOSITORY_ROOT,
	repositoryRelative,
	runValidationCli,
} from './shared.mjs';

const HTML_EXTENSIONS = new Set(['.html']);

/** @param {string} route */
function normalizeRoute(route) {
	const pathname = route.split(/[?#]/, 1)[0] || '/';
	if (pathname === '/') return '/';
	return pathname.replace(/\/$/, '');
}

/**
 * @param {string} filePath
 * @param {string} distRoot
 */
function routeFromHtml(filePath, distRoot) {
	const relative = normalizePath(path.relative(distRoot, filePath));
	if (relative === 'index.html') return '/';
	if (relative.endsWith('/index.html')) return `/${relative.slice(0, -'/index.html'.length)}`;
	return `/${relative}`;
}

/**
 * @param {string} route
 * @param {string} distRoot
 */
function routeExists(route, distRoot) {
	const normalized = normalizeRoute(route);
	if (normalized === '/') return existsSync(path.join(distRoot, 'index.html'));
	const relative = normalized.replace(/^\//, '');
	return (
		existsSync(path.join(distRoot, relative, 'index.html')) ||
		existsSync(path.join(distRoot, relative)) ||
		existsSync(path.join(distRoot, `${relative}.html`))
	);
}

/** @param {string} tag */
function attributes(tag) {
	/** @type {Record<string, string>} */
	const values = {};
	for (const match of tag.matchAll(/([:@A-Za-z][A-Za-z0-9:._-]*)\s*=\s*(["'])(.*?)\2/gs)) {
		const name = match[1];
		const value = match[3];
		if (name && value !== undefined) values[name.toLowerCase()] = value;
	}
	return values;
}

/**
 * @param {string} source
 * @param {string} tagName
 */
function tags(source, tagName) {
	return [...source.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, 'gi'))].map(match => ({
		attributes: attributes(match[0]),
	}));
}

/** @param {string} href */
function hrefPathname(href) {
	try {
		return new URL(href, 'https://sandovaldavid.com').pathname;
	} catch {
		return href;
	}
}

/**
 * @param {{ rootDir?: string; distDir?: string }} [options]
 */
export function validateGeneratedLocaleRoutes({
	rootDir = REPOSITORY_ROOT,
	distDir = path.join(rootDir, 'dist'),
} = {}) {
	/** @type {{ file: string; message: string }[]} */
	const issues = [];
	if (!existsSync(distDir)) {
		issues.push({
			file: repositoryRelative(distDir, rootDir),
			message: 'generated output is missing; run bun run build before check:i18n:routes',
		});
		assertNoIssues('i18n:routes', issues);
	}

	const htmlFiles = listFiles(distDir, HTML_EXTENSIONS);
	const routes = new Set(
		htmlFiles.map(filePath => normalizeRoute(routeFromHtml(filePath, distDir)))
	);
	for (const pair of REPRESENTATIVE_ROUTE_PAIRS) {
		for (const route of [pair.english, pair.spanish]) {
			if (!routeExists(route, distDir)) {
				issues.push({
					file: repositoryRelative(distDir, rootDir),
					message: `representative localized route was not generated: "${route}"`,
				});
			}
		}
	}
	if (!existsSync(path.join(distDir, '404.html'))) {
		issues.push({
			file: repositoryRelative(distDir, rootDir),
			message: '404.html was not generated',
		});
	}

	let alternateTargets = 0;
	let languagePickerTargets = 0;
	for (const filePath of htmlFiles) {
		const file = repositoryRelative(filePath, rootDir);
		const route = normalizeRoute(routeFromHtml(filePath, distDir));
		const source = readText(filePath);
		const htmlTag = tags(source, 'html')[0];
		const expectedLanguage = route === '/es' || route.startsWith('/es/') ? 'es' : 'en';
		if (htmlTag?.attributes.lang !== expectedLanguage) {
			issues.push({
				file,
				message: `<html lang> must be "${expectedLanguage}" for route "${route}", received ${JSON.stringify(htmlTag?.attributes.lang)}`,
			});
		}

		if (route !== '/404.html') {
			const linkTags = tags(source, 'link');
			const canonical = linkTags.find(link => link.attributes.rel === 'canonical');
			if (!canonical?.attributes.href) {
				issues.push({ file, message: `route "${route}" is missing a canonical link` });
			} else if (normalizeRoute(hrefPathname(canonical.attributes.href)) !== route) {
				issues.push({
					file,
					message: `canonical URL points to "${hrefPathname(canonical.attributes.href)}" instead of self-referential route "${route}"`,
				});
			}

			const pageAlternates = linkTags.filter(
				link =>
					link.attributes.rel === 'alternate' &&
					link.attributes.hreflang &&
					link.attributes.type !== 'application/rss+xml'
			);
			const localeAlternates = new Map(
				pageAlternates
					.filter(link => ['en', 'es', 'x-default'].includes(link.attributes.hreflang))
					.map(link => [link.attributes.hreflang, link.attributes.href])
			);
			for (const locale of ['en', 'es']) {
				const href = localeAlternates.get(locale);
				if (!href) continue;
				alternateTargets += 1;
				const target = hrefPathname(href);
				if (!routeExists(target, distDir)) {
					issues.push({
						file,
						message: `hreflang="${locale}" target does not exist in dist: "${target}"`,
					});
				}
			}
			const englishHref = localeAlternates.get('en');
			const defaultHref = localeAlternates.get('x-default');
			if (englishHref && !defaultHref) {
				issues.push({ file, message: `route "${route}" is missing hreflang="x-default"` });
			} else if (
				englishHref &&
				defaultHref &&
				hrefPathname(defaultHref) !== hrefPathname(englishHref)
			) {
				issues.push({
					file,
					message: `x-default must match the verified English target; received "${hrefPathname(defaultHref)}" and "${hrefPathname(englishHref)}"`,
				});
			} else if (!englishHref && defaultHref) {
				issues.push({
					file,
					message: `x-default target "${hrefPathname(defaultHref)}" has no verified English alternate`,
				});
			}
		}

		for (const anchor of tags(source, 'a')) {
			if (!Object.hasOwn(anchor.attributes, 'data-language-base-path')) continue;
			const target = anchor.attributes['data-language-base-path'] || anchor.attributes.href;
			if (!target) {
				issues.push({
					file,
					message: `language-picker link on route "${route}" has no target`,
				});
				continue;
			}
			languagePickerTargets += 1;
			const pathname = hrefPathname(target);
			if (!routeExists(pathname, distDir)) {
				issues.push({
					file,
					message: `language-picker target does not exist in dist: "${pathname}"`,
				});
			}
		}

		if (expectedLanguage === 'es') {
			for (const phrase of SPANISH_FORBIDDEN_PHRASES) {
				if (source.includes(phrase)) {
					issues.push({
						file,
						message: `Spanish generated page contains known English-only phrase ${JSON.stringify(phrase)}`,
					});
				}
			}
		}
	}

	assertNoIssues('i18n:routes', issues);
	return `${routes.size} generated route(s), ${alternateTargets} locale alternate target(s), and ${languagePickerTargets} language-picker target(s) validated.`;
}

if (isDirectExecution(import.meta.url)) {
	runValidationCli('i18n:routes', () => validateGeneratedLocaleRoutes());
}
