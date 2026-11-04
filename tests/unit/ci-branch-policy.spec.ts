import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');

const ciWorkflow = readSource('.github/workflows/ci.yml');
const codeqlWorkflow = readSource('.github/workflows/codeql.yml');
const mainQualityWorkflow = readSource('.github/workflows/main-quality.yml');
const deployProductionWorkflow = readSource('.github/workflows/deploy-production.yml');
const dependabotConfig = readSource('.github/dependabot.yml');
const deliveryPolicy = readSource('docs/DELIVERY.md');
const protectionPolicy = readSource('.github/BRANCH_PROTECTION.md');
const vercelConfig = JSON.parse(readSource('vercel.json'));

const requiredChecks = [
	'Code Quality & Unit Tests',
	'Build & Bundle Analysis',
	'Playwright Chromium Smoke',
	'Analyze Security',
] as const;

const dependabotBlock = (ecosystem: string): string => {
	const marker = `- package-ecosystem: '${ecosystem}'`;
	const start = dependabotConfig.indexOf(marker);
	const next = dependabotConfig.indexOf('\n    - package-ecosystem:', start + marker.length);

	return start === -1 ? '' : dependabotConfig.slice(start, next === -1 ? undefined : next);
};

describe('single branch main and release-driven delivery policy', () => {
	it('runs pull-request quality and security workflows targeting main', () => {
		expect(ciWorkflow).toContain('branches: [main]');
		expect(codeqlWorkflow).toMatch(/pull_request:\n\s+branches: \[main\]/);
	});

	it('keeps required pull-request workflows reportable for every changed-file shape', () => {
		expect(ciWorkflow).not.toContain('paths-ignore:');
	});

	it('targets ordinary Dependabot version updates at main', () => {
		for (const ecosystem of ['bun', 'github-actions']) {
			const block = dependabotBlock(ecosystem);
			expect(block, ecosystem).not.toBe('');
			expect(block, ecosystem).toContain("target-branch: 'main'");
		}

		expect(dependabotConfig).not.toContain("applies-to: 'security-updates'");
	});

	it('does not restrict pull requests into main by source branch', () => {
		expect(ciWorkflow).not.toContain('name: Promotion Source');
		expect(ciWorkflow).not.toContain('BASE_REF: ${{ github.base_ref }}');
		expect(deliveryPolicy).toContain('Release Please');
		expect(protectionPolicy).not.toContain('Promotion Source');
	});

	it('gates main with the full Main Quality suite pre-merge and delegates deployment to Vercel', () => {
		expect(mainQualityWorkflow).toMatch(/pull_request:\n\s+branches: \[main\]/);
		expect(mainQualityWorkflow).not.toContain('branches: [develop, main]');
		expect(mainQualityWorkflow).not.toMatch(/push:\n\s+branches: \[main\]/);
		expect(vercelConfig.git?.deploymentEnabled).not.toBe(false);
		expect(vercelConfig.buildCommand).toContain('install-resume-assets.sh');
		expect(deliveryPolicy).toContain('Vercel native Git integration');
	});

	it('deploys production only on published releases via GitHub Actions', () => {
		expect(deployProductionWorkflow).toContain('types: [published]');
		expect(deployProductionWorkflow).toContain('vercel deploy --prebuilt --prod');
		expect(deliveryPolicy).toContain(
			'Production deployment is driven exclusively by GitHub Releases.'
		);
	});

	it('documents the real stable checks and removes obsolete protection guidance', () => {
		for (const check of requiredChecks) {
			expect(deliveryPolicy, check).toContain(check);
			expect(protectionPolicy, check).toContain(check);
		}

		expect(deliveryPolicy).toContain(
			'short-lived branch -> main (dev environment) -> release tag -> production'
		);
		expect(protectionPolicy).not.toContain('validate-pr.yml');
		expect(protectionPolicy).toContain(
			'Do not configure deployment status checks as blocking merge requirements.'
		);
	});

	it('documents merge methods and main quality required checks', () => {
		const mainQualityChecks = [
			'Main Build & Unit Quality',
			'Main Chromium Suite',
			'Main Lighthouse',
		] as const;

		for (const check of mainQualityChecks) {
			expect(deliveryPolicy, check).toContain(check);
			expect(protectionPolicy, check).toContain(check);
		}

		expect(deliveryPolicy).toContain('merge commits');
		expect(protectionPolicy).toContain(
			'allow both squash and merge methods at repository level'
		);
	});
});
