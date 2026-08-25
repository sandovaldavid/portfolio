import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { INTENTIONAL_SINGLE_LOCALE_EDITORIAL } from './config.mjs';
import {
	assertNoIssues,
	isDirectExecution,
	listFiles,
	normalizePath,
	readFrontmatterScalars,
	readText,
	REPOSITORY_ROOT,
	repositoryRelative,
	runValidationCli,
	SUPPORTED_LOCALES,
} from './shared.mjs';

const JSON_EXTENSIONS = new Set(['.json']);
const MDX_EXTENSIONS = new Set(['.mdx']);
const EDITORIAL_EXTENSIONS = new Set(['.md', '.mdx']);
const STABLE_ID_PATTERN = /^[a-z0-9-]+$/;
const STRUCTURED_COLLECTIONS = Object.freeze({
	'portfolio-profile': { idField: 'profileId', extensions: JSON_EXTENSIONS },
	experience: { idField: 'experienceId', extensions: MDX_EXTENSIONS },
	research: { idField: 'researchId', extensions: JSON_EXTENSIONS },
	projects: { idField: 'projectId', extensions: MDX_EXTENSIONS },
});
const EDITORIAL_COLLECTIONS = /** @type {readonly ('blog' | 'devlog')[]} */ (
	Object.freeze(['blog', 'devlog'])
);

/**
 * @param {string} collectionRoot
 * @param {string} repositoryRoot
 * @param {{ file: string; message: string }[]} issues
 */
function validateLocaleDirectories(collectionRoot, repositoryRoot, issues) {
	if (!existsSync(collectionRoot)) {
		issues.push({
			file: repositoryRelative(collectionRoot, repositoryRoot),
			message: 'localized content collection does not exist',
		});
		return;
	}

	const directories = readdirSync(collectionRoot, { withFileTypes: true })
		.filter(entry => entry.isDirectory())
		.map(entry => entry.name)
		.sort();
	for (const directory of directories) {
		if (!SUPPORTED_LOCALES.includes(directory)) {
			issues.push({
				file: repositoryRelative(path.join(collectionRoot, directory), repositoryRoot),
				message: `unsupported locale directory "${directory}"; supported locales are ${SUPPORTED_LOCALES.join(', ')}`,
			});
		}
	}
	for (const locale of SUPPORTED_LOCALES) {
		if (!directories.includes(locale)) {
			issues.push({
				file: repositoryRelative(path.join(collectionRoot, locale), repositoryRoot),
				message: `required locale directory "${locale}" is missing`,
			});
		}
	}
}

/**
 * @param {string} filePath
 * @param {string} file
 * @param {{ file: string; message: string }[]} issues
 * @returns {Record<string, unknown> | null}
 */
function readStructuredIdentity(filePath, file, issues) {
	const extension = path.extname(filePath);
	if (extension === '.mdx') {
		return readFrontmatterScalars(filePath);
	}

	try {
		const parsed = JSON.parse(readText(filePath));
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			throw new TypeError('root value must be an object');
		}
		return parsed;
	} catch (error) {
		issues.push({
			file,
			message: `invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
		});
		return null;
	}
}

/**
 * @param {string} collection
 * @param {{ idField: string; extensions: Set<string> }} config
 * @param {string} repositoryRoot
 * @param {{ file: string; message: string }[]} issues
 */
function validateStructuredCollection(collection, config, repositoryRoot, issues) {
	const collectionRoot = path.join(repositoryRoot, 'src/content', collection);
	validateLocaleDirectories(collectionRoot, repositoryRoot, issues);
	/** @type {Record<string, Map<string, string>>} */
	const idsByLocale = Object.fromEntries(SUPPORTED_LOCALES.map(locale => [locale, new Map()]));

	for (const filePath of listFiles(collectionRoot, config.extensions)) {
		const relative = normalizePath(path.relative(collectionRoot, filePath));
		const [locale] = relative.split('/');
		const file = repositoryRelative(filePath, repositoryRoot);
		if (!SUPPORTED_LOCALES.includes(locale)) continue;

		const data = readStructuredIdentity(filePath, file, issues);
		if (!data) continue;

		if (data.locale !== locale) {
			issues.push({
				file,
				message: `locale field must be "${locale}" to match its directory, received ${JSON.stringify(data.locale)}`,
			});
		}
		const stableId = data[config.idField];
		if (typeof stableId !== 'string' || !STABLE_ID_PATTERN.test(stableId)) {
			issues.push({
				file,
				message: `${config.idField} must match ${STABLE_ID_PATTERN}, received ${JSON.stringify(stableId)}`,
			});
			continue;
		}

		const previousFile = idsByLocale[locale].get(stableId);
		if (previousFile) {
			issues.push({
				file,
				message: `duplicate ${config.idField} "${stableId}" for locale "${locale}"; first declared in ${previousFile}`,
			});
		} else {
			idsByLocale[locale].set(stableId, file);
		}
	}

	const allIds = [
		...new Set(SUPPORTED_LOCALES.flatMap(locale => [...idsByLocale[locale].keys()])),
	].sort();
	for (const stableId of allIds) {
		for (const locale of SUPPORTED_LOCALES) {
			if (!idsByLocale[locale].has(stableId)) {
				issues.push({
					file: normalizePath(`src/content/${collection}/${locale}`),
					message: `missing ${locale} counterpart for ${config.idField} "${stableId}"`,
				});
			}
		}
	}

	return allIds.length;
}

/**
 * @param {'blog' | 'devlog'} collection
 * @param {string} repositoryRoot
 * @param {{ file: string; message: string }[]} issues
 */
function validateEditorialCollection(collection, repositoryRoot, issues) {
	const collectionRoot = path.join(repositoryRoot, 'src/content', collection);
	validateLocaleDirectories(collectionRoot, repositoryRoot, issues);
	/** @type {Record<string, Map<string, { file: string; draft: boolean }>>} */
	const entriesByLocale = Object.fromEntries(
		SUPPORTED_LOCALES.map(locale => [locale, new Map()])
	);

	for (const filePath of listFiles(collectionRoot, EDITORIAL_EXTENSIONS)) {
		const relative = normalizePath(path.relative(collectionRoot, filePath));
		const [locale] = relative.split('/');
		const file = repositoryRelative(filePath, repositoryRoot);
		if (!SUPPORTED_LOCALES.includes(locale)) continue;

		const frontmatter = readFrontmatterScalars(filePath);
		const translationKey = frontmatter.translationKey;
		if (!translationKey || !STABLE_ID_PATTERN.test(translationKey)) {
			issues.push({
				file,
				message: `translationKey must match ${STABLE_ID_PATTERN}, received ${JSON.stringify(translationKey)}`,
			});
			continue;
		}
		const previous = entriesByLocale[locale].get(translationKey);
		if (previous) {
			issues.push({
				file,
				message: `duplicate translationKey "${translationKey}" for locale "${locale}"; first declared in ${previous.file}`,
			});
			continue;
		}
		entriesByLocale[locale].set(translationKey, {
			file,
			draft: frontmatter.draft === 'true',
		});
	}

	const allowlist = INTENTIONAL_SINGLE_LOCALE_EDITORIAL[collection] ?? {};
	const allKeys = [
		...new Set(SUPPORTED_LOCALES.flatMap(locale => [...entriesByLocale[locale].keys()])),
	].sort();
	for (const translationKey of allKeys) {
		const presentLocales = SUPPORTED_LOCALES.filter(locale =>
			entriesByLocale[locale].has(translationKey)
		);
		if (presentLocales.length === SUPPORTED_LOCALES.length) {
			if (Object.hasOwn(allowlist, translationKey)) {
				issues.push({
					file: `scripts/i18n/config.mjs`,
					message: `stale single-locale allowlist entry "${collection}:${translationKey}" now has all locale counterparts`,
				});
			}
			continue;
		}
		if (!Object.hasOwn(allowlist, translationKey)) {
			const missingLocales = SUPPORTED_LOCALES.filter(
				locale => !presentLocales.includes(locale)
			);
			const sourceFile =
				entriesByLocale[presentLocales[0]]?.get(translationKey)?.file ??
				`src/content/${collection}`;
			issues.push({
				file: sourceFile,
				message: `missing ${missingLocales.join(', ')} editorial counterpart for translationKey "${translationKey}"; document intentional single-language entries in scripts/i18n/config.mjs`,
			});
		}
	}

	for (const translationKey of Object.keys(allowlist)) {
		if (!allKeys.includes(translationKey)) {
			issues.push({
				file: 'scripts/i18n/config.mjs',
				message: `stale single-locale allowlist entry "${collection}:${translationKey}" does not match any editorial entry`,
			});
		}
	}

	return allKeys.length;
}

/**
 * @param {{ rootDir?: string }} [options]
 */
export function validateLocalizedContent({ rootDir = REPOSITORY_ROOT } = {}) {
	/** @type {{ file: string; message: string }[]} */
	const issues = [];
	let structuredIdentities = 0;
	let editorialIdentities = 0;

	for (const [collection, config] of Object.entries(STRUCTURED_COLLECTIONS)) {
		structuredIdentities +=
			validateStructuredCollection(collection, config, rootDir, issues) ?? 0;
	}
	for (const collection of EDITORIAL_COLLECTIONS) {
		editorialIdentities += validateEditorialCollection(collection, rootDir, issues) ?? 0;
	}

	assertNoIssues('i18n:content', issues);
	return `${structuredIdentities} structured and ${editorialIdentities} editorial identity pair(s) validated.`;
}

if (isDirectExecution(import.meta.url)) {
	runValidationCli('i18n:content', () => validateLocalizedContent());
}
