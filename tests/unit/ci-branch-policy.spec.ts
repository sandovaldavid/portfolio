import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');

const ciWorkflow = readSource('.github/workflows/ci.yml');
const codeqlWorkflow = readSource('.github/workflows/codeql.yml');
const previewWorkflow = readSource('.github/workflows/deploy-preview.yml');
const mainQualityWorkflow = readSource('.github/workflows/main-quality.yml');
const productionWorkflow = readSource('.github/workflows/deploy-production.yml');
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

	it('gates main with the full Main Quality suite pre-merge and deploys directly on push', () => {
		expect(mainQualityWorkflow).toMatch(/pull_request:\n\s+branches: \[main\]/);
		expect(mainQualityWorkflow).not.toContain('branches: [develop, main]');
		expect(mainQualityWorkflow).not.toMatch(/push:\n\s+branches: \[main\]/);
		expect(productionWorkflow).toMatch(/push:\n\s+branches: \[main\]/);
		expect(productionWorkflow).not.toContain('workflows: [Main Quality]');
		expect(productionWorkflow).toContain("github.event_name == 'push'");
	});

	it('documents the real stable checks and removes obsolete protection guidance', () => {
		for (const check of requiredChecks) {
			expect(deliveryPolicy, check).toContain(check);
			expect(protectionPolicy, check).toContain(check);
		}

		expect(deliveryPolicy).toContain('short-lived branch -> develop -> main -> production');
		expect(protectionPolicy).not.toContain('validate-pr.yml');
		expect(protectionPolicy).toContain(
			'Do not configure `Deploy to Vercel Production` as a required pull-request check.'
		);
	});

	it('documents merge commits for main promotions and their extra required checks', () => {
		const mainQualityChecks = [
			'Main Build & Unit Quality',
			'Main Chromium Suite',
			'Main Lighthouse',
		] as const;

		for (const check of mainQualityChecks) {
			expect(deliveryPolicy, check).toContain(check);
			expect(protectionPolicy, check).toContain(check);
		}

		expect(deliveryPolicy).toContain('real merge commit');
		expect(protectionPolicy).toContain(
			'allow both squash and merge methods at repository level'
		);
	});
});
