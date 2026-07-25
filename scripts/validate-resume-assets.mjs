#!/usr/bin/env node
// @ts-check

import { createHash } from 'node:crypto';
import {
	closeSync,
	constants,
	fstatSync,
	openSync,
	readFileSync,
	readdirSync,
	statSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXPECTED_SOURCE_REPOSITORY = 'sandovaldavid/resume';
const EXPECTED_FILES = Object.freeze({
	en: 'david-sandoval-resume.pdf',
	es: 'david-sandoval-resume-es.pdf',
});
const MANIFEST_FILENAME = 'manifest.json';
const MINIMUM_PDF_BYTES = 10_000;
const PDF_EOF_WINDOW_BYTES = 2_048;
const SHA_PATTERN = /^[0-9a-f]{40}$/;

export class ResumeAssetValidationError extends Error {
	/** @param {string} message */
	constructor(message) {
		super(message);
		this.name = 'ResumeAssetValidationError';
	}
}

/** @param {unknown} value */
function isRecord(value) {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** @param {boolean} condition @param {string} message */
function assertContract(condition, message) {
	if (!condition) throw new ResumeAssetValidationError(message);
}

/** @param {Buffer} content */
function sha256(content) {
	return createHash('sha256').update(content).digest('hex');
}

/**
 * Open, inspect and read one immutable file descriptor so validation never
 * checks one path entry and then reads a replacement.
 *
 * @param {string} file
 * @param {string} description
 */
function readRegularFile(file, description) {
	/** @type {number | undefined} */
	let descriptor;

	try {
		descriptor = openSync(file, constants.O_RDONLY | constants.O_NOFOLLOW);
		const metadata = fstatSync(descriptor);
		assertContract(metadata.isFile(), `${description} must be a regular file: ${file}`);

		return {
			content: readFileSync(descriptor),
			metadata,
		};
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'ELOOP') {
			throw new ResumeAssetValidationError(
				`${description} must not be a symbolic link: ${file}`
			);
		}
		throw error;
	} finally {
		if (descriptor !== undefined) closeSync(descriptor);
	}
}

/** @param {string} file @param {string} locale */
function validatePdf(file, locale) {
	const { content, metadata } = readRegularFile(file, `${locale} resume`);
	assertContract(
		metadata.size > MINIMUM_PDF_BYTES,
		`${locale} resume must exceed ${MINIMUM_PDF_BYTES} bytes`
	);
	assertContract(
		content.subarray(0, 5).toString('ascii') === '%PDF-',
		`${locale} resume has an invalid PDF signature`
	);
	assertContract(
		content
			.subarray(Math.max(0, content.length - PDF_EOF_WINDOW_BYTES))
			.includes(Buffer.from('%%EOF')),
		`${locale} resume is missing an EOF marker near the end of the file`
	);

	return {
		filename: path.basename(file),
		bytes: metadata.size,
		sha256: sha256(content),
	};
}

/**
 * Validate the isolated canonical resume artifact directory.
 *
 * @param {string} directory
 */
export function validateResumeAssets(directory) {
	const absoluteDirectory = path.resolve(directory);
	const directoryMetadata = statSync(absoluteDirectory);
	assertContract(
		directoryMetadata.isDirectory(),
		`resume asset path must be a directory: ${absoluteDirectory}`
	);

	const expectedEntries = [...Object.values(EXPECTED_FILES), MANIFEST_FILENAME].sort();
	const actualEntries = readdirSync(absoluteDirectory).sort();
	assertContract(
		JSON.stringify(actualEntries) === JSON.stringify(expectedEntries),
		`resume asset directory must contain exactly ${expectedEntries.join(', ')}; found ${actualEntries.join(', ') || '(empty)'}`
	);

	const manifestPath = path.join(absoluteDirectory, MANIFEST_FILENAME);
	const { content: manifestContent } = readRegularFile(manifestPath, 'manifest');

	let manifest;
	try {
		manifest = JSON.parse(manifestContent.toString('utf8'));
	} catch (error) {
		const detail = error instanceof Error ? error.message : String(error);
		throw new ResumeAssetValidationError(`manifest.json must contain valid JSON: ${detail}`);
	}

	assertContract(isRecord(manifest), 'manifest.json root must be an object');
	assertContract(
		manifest.sourceRepository === EXPECTED_SOURCE_REPOSITORY,
		`manifest sourceRepository must be ${EXPECTED_SOURCE_REPOSITORY}`
	);
	assertContract(
		typeof manifest.sourceCommit === 'string' && SHA_PATTERN.test(manifest.sourceCommit),
		'manifest sourceCommit must be a 40-character lowercase Git SHA'
	);
	assertContract(isRecord(manifest.files), 'manifest files must be an object');
	assertContract(
		manifest.files.en === EXPECTED_FILES.en,
		`manifest files.en must be ${EXPECTED_FILES.en}`
	);
	assertContract(
		manifest.files.es === EXPECTED_FILES.es,
		`manifest files.es must be ${EXPECTED_FILES.es}`
	);

	const files = {
		en: validatePdf(path.join(absoluteDirectory, EXPECTED_FILES.en), 'English'),
		es: validatePdf(path.join(absoluteDirectory, EXPECTED_FILES.es), 'Spanish'),
	};

	return {
		directory: absoluteDirectory,
		sourceRepository: manifest.sourceRepository,
		sourceCommit: manifest.sourceCommit,
		files,
	};
}

function main() {
	const directory = process.argv[2] ?? '.resume-assets/public/resume';
	try {
		const report = validateResumeAssets(directory);
		console.log(`[resume-assets] source: ${report.sourceRepository}@${report.sourceCommit}`);
		for (const [locale, file] of Object.entries(report.files)) {
			console.log(
				`[resume-assets] ${locale}: ${file.filename} (${file.bytes} bytes, sha256 ${file.sha256})`
			);
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`[resume-assets] validation failed: ${message}`);
		process.exitCode = 1;
	}
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
	main();
}
