import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPOSITORY_ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
export const SUPPORTED_LOCALES = Object.freeze(['en', 'es']);

/** @typedef {{ file: string; message: string }} ValidationIssue */

export class I18nValidationError extends Error {
	/**
	 * @param {string} scope
	 * @param {ValidationIssue[]} issues
	 */
	constructor(scope, issues) {
		const details = issues.map(issue => `- ${issue.file}: ${issue.message}`).join('\n');
		super(`[${scope}] ${issues.length} problem(s) found:\n${details}`);
		this.name = 'I18nValidationError';
		this.scope = scope;
		this.issues = issues;
	}
}

/** @param {string} value */
export function normalizePath(value) {
	return value.replaceAll(path.sep, '/');
}

/**
 * @param {string} filePath
 * @param {string} [rootDir]
 */
export function repositoryRelative(filePath, rootDir = REPOSITORY_ROOT) {
	return normalizePath(path.relative(rootDir, filePath));
}

/**
 * @param {string} rootDir
 * @param {ReadonlySet<string>} extensions
 * @returns {string[]}
 */
export function listFiles(rootDir, extensions) {
	if (!existsSync(rootDir)) return [];

	return readdirSync(rootDir, { withFileTypes: true })
		.flatMap(entry => {
			const entryPath = path.join(rootDir, entry.name);
			if (entry.isDirectory()) return listFiles(entryPath, extensions);
			return extensions.has(path.extname(entry.name)) ? [entryPath] : [];
		})
		.sort((left, right) => normalizePath(left).localeCompare(normalizePath(right)));
}

/** @param {string} filePath */
export function readText(filePath) {
	return readFileSync(filePath, 'utf8');
}

/**
 * @param {string} source
 * @param {number} offset
 */
export function lineAt(source, offset) {
	return source.slice(0, offset).split('\n').length;
}

/**
 * @param {string} scope
 * @param {ValidationIssue[]} issues
 */
export function assertNoIssues(scope, issues) {
	if (issues.length > 0) throw new I18nValidationError(scope, issues);
}

/**
 * @param {string} importMetaUrl
 */
export function isDirectExecution(importMetaUrl) {
	const entry = process.argv[1];
	return Boolean(entry && path.resolve(entry) === fileURLToPath(importMetaUrl));
}

/**
 * @param {string} scope
 * @param {() => string} validation
 */
export function runValidationCli(scope, validation) {
	try {
		const summary = validation();
		console.log(`[${scope}] ${summary}`);
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		process.exitCode = 1;
	}
}

/**
 * @param {string} filePath
 * @returns {Record<string, string>}
 */
export function readFrontmatterScalars(filePath) {
	const source = readText(filePath);
	const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---/);
	if (!frontmatter) return {};

	/** @type {Record<string, string>} */
	const values = {};
	for (const line of frontmatter[1].split('\n')) {
		const match = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*?)\s*$/);
		if (!match) continue;
		values[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
	}
	return values;
}
