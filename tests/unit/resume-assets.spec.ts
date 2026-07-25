import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
	ResumeAssetValidationError,
	validateResumeAssets,
} from '../../scripts/validate-resume-assets.mjs';

const SOURCE_COMMIT = 'a'.repeat(40);
const ENGLISH_FILENAME = 'david-sandoval-resume.pdf';
const SPANISH_FILENAME = 'david-sandoval-resume-es.pdf';

const createPdf = (options: { signature?: string; bytes?: number; eof?: boolean } = {}): Buffer => {
	const signature = options.signature ?? '%PDF-1.7\n';
	const bytes = options.bytes ?? 12_000;
	const eof = options.eof ?? true;
	const ending = eof ? '\n%%EOF\n' : '\nmissing-eof\n';
	const padding = Math.max(0, bytes - Buffer.byteLength(signature) - Buffer.byteLength(ending));
	return Buffer.from(`${signature}${'0'.repeat(padding)}${ending}`);
};

const replaceWithSymlink = (file: string, content: Buffer | string): void => {
	const target = path.join(path.dirname(path.dirname(file)), `${path.basename(file)}.target`);
	writeFileSync(target, content);
	rmSync(file);
	symlinkSync(target, file);
};

const createFixture = (
	overrides: {
		manifest?: unknown;
		english?: Buffer;
		spanish?: Buffer;
		extraFile?: boolean;
		englishSymlink?: boolean;
		manifestSymlink?: boolean;
	} = {}
): string => {
	const root = mkdtempSync(path.join(tmpdir(), 'portfolio-resume-assets-'));
	const directory = path.join(root, 'public', 'resume');
	mkdirSync(directory, { recursive: true });

	const manifest =
		overrides.manifest ??
		({
			sourceRepository: 'sandovaldavid/resume',
			sourceCommit: SOURCE_COMMIT,
			files: {
				en: ENGLISH_FILENAME,
				es: SPANISH_FILENAME,
			},
		} as const);

	const englishPath = path.join(directory, ENGLISH_FILENAME);
	const manifestPath = path.join(directory, 'manifest.json');
	writeFileSync(englishPath, overrides.english ?? createPdf());
	writeFileSync(path.join(directory, SPANISH_FILENAME), overrides.spanish ?? createPdf());
	writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
	if (overrides.extraFile) writeFileSync(path.join(directory, 'unexpected.txt'), 'unexpected');
	if (overrides.englishSymlink) replaceWithSymlink(englishPath, createPdf());
	if (overrides.manifestSymlink) {
		replaceWithSymlink(manifestPath, JSON.stringify(manifest, null, 2));
	}

	return directory;
};

describe('canonical resume asset validation', () => {
	it('accepts the isolated bilingual payload and reports provenance and digests', () => {
		const directory = createFixture();

		const report = validateResumeAssets(directory);

		expect(report.sourceRepository).toBe('sandovaldavid/resume');
		expect(report.sourceCommit).toBe(SOURCE_COMMIT);
		expect(report.files.en.filename).toBe(ENGLISH_FILENAME);
		expect(report.files.es.filename).toBe(SPANISH_FILENAME);
		expect(report.files.en.bytes).toBeGreaterThan(10_000);
		expect(report.files.en.sha256).toMatch(/^[0-9a-f]{64}$/);
	});

	it('rejects extra files so the public asset directory stays isolated', () => {
		expect(() => validateResumeAssets(createFixture({ extraFile: true }))).toThrow(
			'exactly david-sandoval-resume-es.pdf, david-sandoval-resume.pdf, manifest.json'
		);
	});

	it.each([
		['English PDF', { englishSymlink: true }],
		['manifest', { manifestSymlink: true }],
	])('rejects a symbolic link for the %s', (_name, overrides) => {
		expect(() => validateResumeAssets(createFixture(overrides))).toThrow(
			'must not be a symbolic link'
		);
	});

	it.each([
		['invalid signature', createPdf({ signature: 'not-a-pdf\n' }), 'invalid PDF signature'],
		['undersized PDF', createPdf({ bytes: 5_000 }), 'must exceed 10000 bytes'],
		['missing EOF', createPdf({ eof: false }), 'missing an EOF marker'],
	])('rejects an English artifact with %s', (_name, english, expectedMessage) => {
		expect(() => validateResumeAssets(createFixture({ english }))).toThrow(expectedMessage);
	});

	it.each([
		[
			'wrong source repository',
			{
				sourceRepository: 'example/resume',
				sourceCommit: SOURCE_COMMIT,
				files: { en: ENGLISH_FILENAME, es: SPANISH_FILENAME },
			},
			'manifest sourceRepository',
		],
		[
			'invalid source commit',
			{
				sourceRepository: 'sandovaldavid/resume',
				sourceCommit: 'main',
				files: { en: ENGLISH_FILENAME, es: SPANISH_FILENAME },
			},
			'manifest sourceCommit',
		],
		[
			'wrong public filename',
			{
				sourceRepository: 'sandovaldavid/resume',
				sourceCommit: SOURCE_COMMIT,
				files: { en: 'resume.pdf', es: SPANISH_FILENAME },
			},
			'manifest files.en',
		],
	])('rejects a manifest with %s', (_name, manifest, expectedMessage) => {
		expect(() => validateResumeAssets(createFixture({ manifest }))).toThrow(expectedMessage);
	});

	it('uses a dedicated error type for actionable contract failures', () => {
		try {
			validateResumeAssets(createFixture({ english: createPdf({ signature: 'invalid\n' }) }));
			throw new Error('expected validation to fail');
		} catch (error) {
			expect(error).toBeInstanceOf(ResumeAssetValidationError);
		}
	});
});
