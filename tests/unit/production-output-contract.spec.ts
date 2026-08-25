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

		let error: unknown;
		try {
			validateProductionOutput({ rootDir: root });
		} catch (caught) {
			error = caught;
		}

		expect(error).toBeInstanceOf(Error);
		const message = error instanceof Error ? error.message : '';
		expect(message).toContain('development-only route(s) leaked into dist:');
		expect(message).toContain('/blog/_draft-rss-test');
		expect(message).toContain('/projects/project-detail-fixture');
		expect(message).toContain('/es/projects/ml-ai-project-fixture');
	});
});
