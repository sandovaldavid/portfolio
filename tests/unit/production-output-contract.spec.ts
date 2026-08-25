import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { validateProductionOutput } from '../../scripts/check-production-output.mjs';

const fixtures: string[] = [];

function createDist(files: Record<string, string>): string {
	const root = mkdtempSync(path.join(tmpdir(), 'portfolio-production-output-'));
	fixtures.push(root);
	for (const [relativePath, content] of Object.entries(files)) {
		const filePath = path.join(root, 'dist', relativePath);
		mkdirSync(path.dirname(filePath), { recursive: true });
		writeFileSync(filePath, content);
	}
	return root;
}

afterEach(() => {
	for (const fixture of fixtures.splice(0)) {
		rmSync(fixture, { recursive: true, force: true });
	}
});

describe('production output contract', () => {
	it('accepts a production dist without drafts or development-only project routes', () => {
		const root = createDist({ 'index.html': '<html></html>' });

		expect(() => validateProductionOutput({ rootDir: root })).not.toThrow();
	});

	it('rejects draft and development-only project routes leaked into production', () => {
		const root = createDist({
			'blog/_draft-rss-test/index.html': '<html></html>',
			'projects/project-detail-fixture/index.html': '<html></html>',
			'es/projects/ml-ai-project-fixture/index.html': '<html></html>',
		});

		expect(() => validateProductionOutput({ rootDir: root })).toThrowError(
			/development-only route\(s\) leaked into dist/[\s\S]*\/blog\/_draft-rss-test[\s\S]*\/projects\/project-detail-fixture[\s\S]*\/es\/projects\/ml-ai-project-fixture/
		);
	});
});
