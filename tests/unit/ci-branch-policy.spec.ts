import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');

const ciWorkflow = readSource('.github/workflows/ci.yml');
const codeqlWorkflow = readSource('.github/workflows/codeql.yml');
const previewWorkflow = readSource('.github/workflows/deploy-preview.yml');
const mainQualityWorkflow = readSource('.github/workflows/main-quality.yml');
const productionWorkflow = readSource('.github/workflows/deploy-production.yml');
const ciPolicy = readSource('docs/CI.md');
const deliveryPolicy = readSource('docs/DELIVERY.md');
const protectionPolicy = readSource('.github/BRANCH_PROTECTION.md');

const requiredChecks = [
	'Code Quality & Commits',
	'Unit Tests (Vitest)',
	'Build & Bundle Analysis',
	'Playwright Chromium Smoke',
	'Analyze Security',
] as const;

describe('develop integration and main promotion policy', () => {
	it('runs pull-request quality, security and preview workflows for both bases', () => {
		expect(ciWorkflow).toContain('branches: [develop, main]');
		expect(codeqlWorkflow).toMatch(/pull_request:\n\s+branches: \[develop, main\]/);
		expect(previewWorkflow).toContain('branches: [develop, main]');
	});

	it('does not restrict pull requests into main by source branch', () => {
		expect(ciWorkflow).not.toContain('name: Promotion Source');
		expect(ciWorkflow).not.toContain('BASE_REF: ${{ github.base_ref }}');
		expect(deliveryPolicy).toContain('Release Please');
		expect(protectionPolicy).not.toContain('Promotion Source');
	});

	it('keeps post-merge quality and production restricted to main', () => {
		expect(mainQualityWorkflow).toMatch(/push:\n\s+branches: \[main\]/);
		expect(mainQualityWorkflow).not.toContain('branches: [develop, main]');
		expect(productionWorkflow).toContain('workflows: [Main Quality]');
		expect(productionWorkflow).toContain('branches: [main]');
		expect(productionWorkflow).toContain("github.event.workflow_run.head_branch == 'main'");
	});

	it('documents the real stable checks and removes obsolete protection guidance', () => {
		for (const check of requiredChecks) {
			expect(ciPolicy, check).toContain(check);
			expect(protectionPolicy, check).toContain(check);
		}

		expect(deliveryPolicy).toContain('short-lived branch -> develop -> main -> production');
		expect(protectionPolicy).not.toContain('validate-pr.yml');
		expect(protectionPolicy).toContain(
			'Do not configure `Deploy to Vercel Production` as a required pull-request check.'
		);
	});
});
