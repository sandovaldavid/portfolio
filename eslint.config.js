import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

const generatedFiles = [
	'**/node_modules/**',
	'**/dist/**',
	'**/.astro/**',
	'**/.vercel/**',
	'**/coverage/**',
	'**/playwright-report/**',
	'**/test-results/**',
	'**/bundle-analysis/**',
	'**/.lighthouseci/**',
	'**/.cache/**',
	'**/.docker/**',
	'**/*.min.js',
	'test-results.json',
	'junit-results.xml',
];

const typescriptRules = {
	...typescript.configs.recommended.rules,
	'no-undef': 'off',
	'no-unused-vars': 'off',
	'@typescript-eslint/no-explicit-any': 'warn',
	'@typescript-eslint/no-unused-vars': [
		'error',
		{
			argsIgnorePattern: '^_',
			varsIgnorePattern: '^_',
		},
	],
	'prefer-const': 'error',
	'no-var': 'error',
};

export default [
	{
		ignores: generatedFiles,
	},
	{
		files: ['**/*.{js,mjs}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: globals.nodeBuiltin,
		},
		rules: {
			...js.configs.recommended.rules,
			'prefer-const': 'error',
			'no-var': 'error',
		},
	},
	{
		files: ['**/*.cjs'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'commonjs',
			globals: globals.node,
		},
		rules: {
			...js.configs.recommended.rules,
			'prefer-const': 'error',
			'no-var': 'error',
		},
	},
	{
		files: ['src/**/*.{js,mjs}', 'scripts/capture-screenshots.mjs'],
		languageOptions: {
			globals: globals.browser,
		},
	},
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
			globals: globals.nodeBuiltin,
		},
		plugins: {
			'@typescript-eslint': typescript,
		},
		rules: {
			...js.configs.recommended.rules,
			...typescriptRules,
		},
	},
	{
		files: ['src/**/*.{ts,tsx}'],
		languageOptions: {
			globals: globals.browser,
		},
	},
	...astro.configs.recommended,
	{
		files: ['**/*.astro'],
		languageOptions: {
			parserOptions: {
				parser: typescriptParser,
			},
			globals: {
				...globals.browser,
				...globals.nodeBuiltin,
			},
		},
		plugins: {
			'@typescript-eslint': typescript,
		},
		rules: typescriptRules,
	},
];
