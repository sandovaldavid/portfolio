import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const mode = process.argv[2];
const supportedModes = new Set(['--check', '--write']);

if (!supportedModes.has(mode)) {
	console.error('Usage: node scripts/format-tracked-files.mjs --check|--write');
	process.exit(2);
}

const rootResult = spawnSync('git', ['rev-parse', '--show-toplevel'], {
	encoding: 'utf8',
});

if (rootResult.status !== 0) {
	process.stderr.write(rootResult.stderr);
	process.exit(rootResult.status ?? 1);
}

const repositoryRoot = rootResult.stdout.trim();
process.chdir(repositoryRoot);

const filesResult = spawnSync('git', ['ls-files', '-z'], {
	encoding: 'utf8',
	maxBuffer: 10 * 1024 * 1024,
});

if (filesResult.status !== 0) {
	process.stderr.write(filesResult.stderr);
	process.exit(filesResult.status ?? 1);
}

const trackedFiles = filesResult.stdout
	.split('\0')
	.filter(Boolean)
	.filter(file => {
		try {
			return existsSync(file) && !lstatSync(file).isSymbolicLink();
		} catch {
			return false;
		}
	});

if (trackedFiles.length === 0) {
	console.log('No tracked files available for Prettier.');
	process.exit(0);
}

const prettierCli = resolve(repositoryRoot, 'node_modules/prettier/bin/prettier.cjs');

if (!existsSync(prettierCli)) {
	console.error('Prettier is not installed. Run bun install --frozen-lockfile first.');
	process.exit(1);
}

const batchSize = 100;

for (let index = 0; index < trackedFiles.length; index += batchSize) {
	const batch = trackedFiles.slice(index, index + batchSize);
	const prettierResult = spawnSync(
		process.execPath,
		[prettierCli, mode, '--ignore-unknown', '--ignore-path', '.prettierignore', '--', ...batch],
		{ stdio: 'inherit' }
	);

	if (prettierResult.error) {
		console.error(prettierResult.error.message);
		process.exit(1);
	}

	if (prettierResult.status !== 0) {
		if (mode === '--check' && batch.includes('tests/e2e/brand-identity.spec.ts')) {
			spawnSync(
				process.execPath,
				[
					prettierCli,
					'--write',
					'--ignore-path',
					'.prettierignore',
					'tests/e2e/brand-identity.spec.ts',
				],
				{ stdio: 'inherit' }
			);
			console.log('--- BEGIN FORMATTED BRAND IDENTITY TEST ---');
			console.log(readFileSync('tests/e2e/brand-identity.spec.ts', 'utf8'));
			console.log('--- END FORMATTED BRAND IDENTITY TEST ---');
		}
		process.exit(prettierResult.status ?? 1);
	}
}
