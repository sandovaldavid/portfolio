import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import {
	assertNoIssues,
	isDirectExecution,
	lineAt,
	listFiles,
	normalizePath,
	readText,
	REPOSITORY_ROOT,
	repositoryRelative,
	runValidationCli,
	SUPPORTED_LOCALES,
} from './shared.mjs';

const JSON_EXTENSIONS = new Set(['.json']);

/** @param {import('typescript').PropertyName} name */
function propertyName(name) {
	if (ts.isStringLiteralLike(name) || ts.isIdentifier(name) || ts.isNumericLiteral(name)) {
		return name.text;
	}
	return name.getText();
}

/**
 * @param {string} filePath
 * @param {string} repositoryRoot
 * @param {import('./shared.mjs').ValidationIssue[]} issues
 */
function inspectCatalogFile(filePath, repositoryRoot, issues) {
	const sourceText = readText(filePath);
	const sourceFile = ts.parseJsonText(filePath, sourceText);
	const statement = sourceFile.statements.find(ts.isExpressionStatement);
	const file = repositoryRelative(filePath, repositoryRoot);
	/** @type {string[]} */
	const leafKeys = [];

	if (!statement || !ts.isObjectLiteralExpression(statement.expression)) {
		issues.push({ file, message: 'catalog module must contain one JSON object at its root' });
		return leafKeys;
	}

	/**
	 * @param {import('typescript').Expression} node
	 * @param {string} prefix
	 */
	function visit(node, prefix) {
		if (ts.isStringLiteralLike(node)) {
			if (node.text.trim().length === 0) {
				issues.push({
					file: `${file}:${lineAt(sourceText, node.getStart(sourceFile))}`,
					message: `translation "${prefix}" is empty`,
				});
			}
			if (/<\/?[a-z][^>]*>/i.test(node.text)) {
				issues.push({
					file: `${file}:${lineAt(sourceText, node.getStart(sourceFile))}`,
					message: `translation "${prefix}" contains HTML; catalogs must remain plain text`,
				});
			}
			leafKeys.push(prefix);
			return;
		}

		if (!ts.isObjectLiteralExpression(node)) {
			issues.push({
				file: `${file}:${lineAt(sourceText, node.getStart(sourceFile))}`,
				message: `translation "${prefix}" must be a scalar string`,
			});
			return;
		}

		const names = new Map();
		for (const property of node.properties) {
			if (!ts.isPropertyAssignment(property)) {
				issues.push({
					file: `${file}:${lineAt(sourceText, property.getStart(sourceFile))}`,
					message: 'catalog entries must be JSON property assignments',
				});
				continue;
			}

			const name = propertyName(property.name);
			const key = prefix ? `${prefix}.${name}` : name;
			const previousLine = names.get(name);
			const currentLine = lineAt(sourceText, property.name.getStart(sourceFile));
			if (previousLine) {
				issues.push({
					file: `${file}:${currentLine}`,
					message: `duplicate key "${key}"; first declared on line ${previousLine}`,
				});
			} else {
				names.set(name, currentLine);
			}
			visit(property.initializer, key);
		}
	}

	visit(statement.expression, '');
	return leafKeys.sort();
}

/**
 * @param {{ rootDir?: string }} [options]
 */
export function validateCatalogs({ rootDir = REPOSITORY_ROOT } = {}) {
	const localeRoot = path.join(rootDir, 'src/shared/config/i18n/locales');
	const catalogSourcePath = path.join(rootDir, 'src/shared/config/i18n/catalog.ts');
	/** @type {import('./shared.mjs').ValidationIssue[]} */
	const issues = [];

	if (!existsSync(localeRoot)) {
		issues.push({
			file: repositoryRelative(localeRoot, rootDir),
			message: 'locale catalog root does not exist',
		});
		assertNoIssues('i18n:catalogs', issues);
	}

	const localeDirectories = readdirSync(localeRoot, { withFileTypes: true })
		.filter(entry => entry.isDirectory())
		.map(entry => entry.name)
		.sort();
	for (const locale of localeDirectories) {
		if (!SUPPORTED_LOCALES.includes(locale)) {
			issues.push({
				file: repositoryRelative(path.join(localeRoot, locale), rootDir),
				message: `unsupported locale directory "${locale}"; supported locales are ${SUPPORTED_LOCALES.join(', ')}`,
			});
		}
	}
	for (const locale of SUPPORTED_LOCALES) {
		if (!localeDirectories.includes(locale)) {
			issues.push({
				file: repositoryRelative(path.join(localeRoot, locale), rootDir),
				message: `required locale directory "${locale}" is missing`,
			});
		}
	}

	/** @type {Record<string, string[]>} */
	const modulesByLocale = {};
	for (const locale of SUPPORTED_LOCALES) {
		const localeDirectory = path.join(localeRoot, locale);
		modulesByLocale[locale] = listFiles(localeDirectory, JSON_EXTENSIONS).map(filePath =>
			normalizePath(path.relative(localeDirectory, filePath))
		);
	}

	const englishModules = modulesByLocale.en ?? [];
	const spanishModules = modulesByLocale.es ?? [];
	const allModules = [...new Set([...englishModules, ...spanishModules])].sort();
	for (const modulePath of allModules) {
		for (const locale of SUPPORTED_LOCALES) {
			if (!(modulesByLocale[locale] ?? []).includes(modulePath)) {
				issues.push({
					file: normalizePath(`src/shared/config/i18n/locales/${locale}/${modulePath}`),
					message: `missing module mirrored from the other locale: "${modulePath}"`,
				});
			}
		}
	}

	const normalizedModules = new Map();
	for (const modulePath of allModules) {
		const normalized = modulePath.toLocaleLowerCase('en-US');
		const previous = normalizedModules.get(normalized);
		if (previous && previous !== modulePath) {
			issues.push({
				file: normalizePath(`src/shared/config/i18n/locales/en/${modulePath}`),
				message: `module path collides case-insensitively with "${previous}"`,
			});
		} else {
			normalizedModules.set(normalized, modulePath);
		}
	}

	let totalKeys = 0;
	for (const modulePath of allModules) {
		/** @type {Record<string, string[]>} */
		const keysByLocale = {};
		for (const locale of SUPPORTED_LOCALES) {
			const filePath = path.join(localeRoot, locale, modulePath);
			if (!existsSync(filePath)) continue;
			keysByLocale[locale] = inspectCatalogFile(filePath, rootDir, issues);
		}

		const englishKeys = keysByLocale.en ?? [];
		const spanishKeys = keysByLocale.es ?? [];
		totalKeys += englishKeys.length;
		for (const key of [...new Set([...englishKeys, ...spanishKeys])].sort()) {
			if (!englishKeys.includes(key)) {
				issues.push({
					file: normalizePath(`src/shared/config/i18n/locales/en/${modulePath}`),
					message: `missing key "${key}" present in Spanish`,
				});
			}
			if (!spanishKeys.includes(key)) {
				issues.push({
					file: normalizePath(`src/shared/config/i18n/locales/es/${modulePath}`),
					message: `missing key "${key}" present in English`,
				});
			}
		}
	}

	if (!existsSync(catalogSourcePath)) {
		issues.push({
			file: repositoryRelative(catalogSourcePath, rootDir),
			message: 'typed catalog registry is missing',
		});
	} else {
		const catalogSource = readText(catalogSourcePath);
		for (const modulePath of allModules) {
			for (const locale of SUPPORTED_LOCALES) {
				const importPath = `./locales/${locale}/${modulePath}`;
				if (!catalogSource.includes(importPath)) {
					issues.push({
						file: repositoryRelative(catalogSourcePath, rootDir),
						message: `catalog module is not registered: "${importPath}"`,
					});
				}
			}
		}
	}

	assertNoIssues('i18n:catalogs', issues);
	return `${allModules.length} mirrored module(s) and ${totalKeys} English key(s) validated.`;
}

if (isDirectExecution(import.meta.url)) {
	runValidationCli('i18n:catalogs', () => validateCatalogs());
}
