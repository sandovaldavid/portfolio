import path from 'node:path';
import ts from 'typescript';

/** @type {Readonly<Record<string, number>>} */
export const ARCHITECTURE_LAYERS = Object.freeze({
	pages: 5,
	app: 4,
	widgets: 3,
	features: 2,
	entities: 1,
	shared: 0,
});

const STRICT_SLICE_LAYERS = new Set(['widgets', 'features', 'entities']);
const SOURCE_LAYERS = new Set(Object.keys(ARCHITECTURE_LAYERS));
const KNOWN_FILE_EXTENSIONS = new Set([
	'.astro',
	'.cjs',
	'.css',
	'.gif',
	'.jpeg',
	'.jpg',
	'.js',
	'.json',
	'.md',
	'.mdx',
	'.mjs',
	'.png',
	'.svg',
	'.ts',
	'.tsx',
	'.webp',
]);

const ALIASES = [
	{ alias: '@pages', layer: 'pages', root: 'src/pages', retired: true },
	{ alias: '@app', layer: 'app', root: 'src/app' },
	{ alias: '@widgets', layer: 'widgets', root: 'src/widgets' },
	{ alias: '@features', layer: 'features', root: 'src/features' },
	{ alias: '@entities', layer: 'entities', root: 'src/entities' },
	{ alias: '@shared', layer: 'shared', root: 'src/shared' },
	{ alias: '@components', layer: null, root: 'src/components', retired: true },
	{ alias: '@styles', layer: null, root: 'src/styles', retired: true },
	{ alias: '@assets', layer: null, root: 'src/assets' },
	{ alias: '@content', layer: null, root: 'src/content' },
	{ alias: '@scripts', layer: null, root: 'scripts' },
	{ alias: '@tests', layer: null, root: 'tests' },
];

/**
 * @typedef {{ specifier: string; line: number }} ImportReference
 * @typedef {{ importer: string; specifier: string; rootDir?: string }} ImportValidationInput
 */

/** @param {string} value */
function normalizePath(value) {
	return value.replaceAll(path.sep, '/');
}

/** @param {string} filePath */
export function getLayerFromFile(filePath) {
	const normalized = normalizePath(filePath);
	const match = normalized.match(
		/(?:^|\/)src\/(pages|app|widgets|features|entities|shared)(?:\/|$)/
	);
	return match?.[1] ?? null;
}

/** @param {string} filePath */
export function getSliceFromFile(filePath) {
	const normalized = normalizePath(filePath);
	const segments = normalized.split('/');
	const srcIndex = segments.lastIndexOf('src');
	const layer = srcIndex >= 0 ? segments[srcIndex + 1] : undefined;

	if (!layer || !STRICT_SLICE_LAYERS.has(layer)) {
		return null;
	}

	return segments[srcIndex + 2] ?? null;
}

/** @param {string} specifier */
export function getAliasInfo(specifier) {
	return (
		ALIASES.find(({ alias }) => specifier === alias || specifier.startsWith(`${alias}/`)) ??
		null
	);
}

/** @param {string} specifier @param {string} alias */
function getAliasSegments(specifier, alias) {
	return specifier.slice(alias.length).split('/').filter(Boolean);
}

/** @param {string} source @param {string} filePath */
export function extractImportSpecifiers(source, filePath) {
	const isAstro = filePath.endsWith('.astro');
	const frontmatter = isAstro
		? (source.match(/^\s*---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '')
		: source;
	const lineOffset = isAstro ? 1 : 0;
	const scriptKind = filePath.endsWith('.tsx')
		? ts.ScriptKind.TSX
		: filePath.endsWith('.jsx')
			? ts.ScriptKind.JSX
			: ts.ScriptKind.TS;
	const sourceFile = ts.createSourceFile(
		filePath,
		frontmatter,
		ts.ScriptTarget.Latest,
		true,
		scriptKind
	);
	/** @type {ImportReference[]} */
	const references = [];

	/** @param {ts.Node} node @param {ts.Expression | undefined} moduleSpecifier */
	const addReference = (node, moduleSpecifier) => {
		if (!moduleSpecifier || !ts.isStringLiteralLike(moduleSpecifier)) {
			return;
		}

		const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
		references.push({
			specifier: moduleSpecifier.text,
			line: position.line + 1 + lineOffset,
		});
	};

	/** @param {ts.Node} node */
	const visit = node => {
		if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
			addReference(node, node.moduleSpecifier);
		}

		if (
			ts.isCallExpression(node) &&
			node.expression.kind === ts.SyntaxKind.ImportKeyword &&
			node.arguments.length === 1
		) {
			addReference(node, node.arguments[0]);
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return references;
}

/** @param {ImportValidationInput} input */
export function validateImport({ importer, specifier, rootDir = process.cwd() }) {
	/** @type {string[]} */
	const problems = [];
	const importerLayer = getLayerFromFile(importer);

	if (specifier === '@' || specifier.startsWith('@/')) {
		problems.push('The catch-all @ alias is forbidden; use a semantic layer alias.');
		return problems;
	}

	if (specifier === '@widgets') {
		problems.push(
			'The root @widgets barrel is forbidden; import from a widget slice public API.'
		);
	}

	const aliasInfo = getAliasInfo(specifier);
	if (aliasInfo?.retired) {
		problems.push(`The ${aliasInfo.alias} alias is retired and must not be used.`);
	}

	if (aliasInfo) {
		const segments = getAliasSegments(specifier, aliasInfo.alias);

		if (STRICT_SLICE_LAYERS.has(aliasInfo.layer ?? '') && segments.length !== 1) {
			problems.push(
				`Deep imports into ${aliasInfo.layer} are forbidden; import from @${aliasInfo.layer}/<slice>.`
			);
		}

		if (aliasInfo.layer === 'shared' && (segments.length === 0 || segments.length > 2)) {
			problems.push(
				'Shared imports must target a segment or slice public API such as @shared/ui or @shared/lib/i18n.'
			);
		}

		if (
			importerLayer &&
			aliasInfo.layer &&
			SOURCE_LAYERS.has(aliasInfo.layer) &&
			ARCHITECTURE_LAYERS[aliasInfo.layer] > ARCHITECTURE_LAYERS[importerLayer]
		) {
			problems.push(
				`${importerLayer} cannot import from the higher ${aliasInfo.layer} layer.`
			);
		}

		if (
			importerLayer &&
			aliasInfo.layer === importerLayer &&
			STRICT_SLICE_LAYERS.has(importerLayer)
		) {
			problems.push(
				`Same-layer ${importerLayer} imports are forbidden; extract shared behavior to a lower layer.`
			);
		}
	}

	if (specifier.startsWith('.') && importerLayer) {
		const absoluteTarget = path.resolve(rootDir, path.dirname(importer), specifier);
		const relativeTarget = normalizePath(path.relative(rootDir, absoluteTarget));
		const targetLayer = getLayerFromFile(relativeTarget);

		if (targetLayer && targetLayer !== importerLayer) {
			problems.push(
				'Relative imports cannot cross architecture layers; use a semantic alias.'
			);
		}

		if (
			targetLayer === importerLayer &&
			STRICT_SLICE_LAYERS.has(importerLayer) &&
			getSliceFromFile(relativeTarget) !== getSliceFromFile(importer)
		) {
			problems.push(
				`Relative imports cannot cross ${importerLayer} slices; use a lower-layer abstraction.`
			);
		}
	}

	return problems;
}

/** @param {string} specifier */
export function getAliasCandidates(specifier) {
	const aliasInfo = getAliasInfo(specifier);
	if (!aliasInfo || aliasInfo.retired) {
		return [];
	}

	const segments = getAliasSegments(specifier, aliasInfo.alias);
	const repositoryPath = path.posix.join(aliasInfo.root, ...segments);
	const extension = path.posix.extname(repositoryPath);

	if (KNOWN_FILE_EXTENSIONS.has(extension)) {
		return [repositoryPath];
	}

	return [
		`${repositoryPath}.ts`,
		`${repositoryPath}.tsx`,
		`${repositoryPath}.js`,
		`${repositoryPath}.mjs`,
		`${repositoryPath}.astro`,
		`${repositoryPath}.css`,
		`${repositoryPath}.json`,
		path.posix.join(repositoryPath, 'index.ts'),
		path.posix.join(repositoryPath, 'index.tsx'),
		path.posix.join(repositoryPath, 'index.js'),
		path.posix.join(repositoryPath, 'index.mjs'),
	];
}
