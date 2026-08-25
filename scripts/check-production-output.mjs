import { existsSync } from 'node:fs';
import path from 'node:path';
import { isDirectExecution, REPOSITORY_ROOT, runValidationCli } from './i18n/shared.mjs';

export const FORBIDDEN_PRODUCTION_ROUTES = Object.freeze([
	'/blog/_draft-rss-test',
	'/projects/project-detail-fixture',
	'/projects/fullstack-project-fixture',
	'/projects/frontend-project-fixture',
	'/projects/ml-ai-project-fixture',
	'/es/projects/project-detail-fixture',
	'/es/projects/fullstack-project-fixture',
	'/es/projects/frontend-project-fixture',
	'/es/projects/ml-ai-project-fixture',
]);

/**
 * @param {string} route
 * @param {string} distDir
 */
function routeArtifact(route, distDir) {
	const relative = route.replace(/^\//, '');
	return path.join(distDir, relative, 'index.html');
}

/**
 * @param {{ rootDir?: string; distDir?: string }} [options]
 */
export function validateProductionOutput({
	rootDir = REPOSITORY_ROOT,
	distDir = path.join(rootDir, 'dist'),
} = {}) {
	if (!existsSync(distDir)) {
		throw new Error('[production-output] generated output is missing; run bun run build first');
	}

	const leakedRoutes = FORBIDDEN_PRODUCTION_ROUTES.filter(route =>
		existsSync(routeArtifact(route, distDir))
	);

	if (leakedRoutes.length > 0) {
		const details = leakedRoutes.map(route => `- ${route}`).join('\n');
		throw new Error(
			`[production-output] ${leakedRoutes.length} development-only route(s) leaked into dist:\n${details}`
		);
	}

	return `${FORBIDDEN_PRODUCTION_ROUTES.length} development-only route contract(s) excluded from production output.`;
}

if (isDirectExecution(import.meta.url)) {
	runValidationCli('production-output', () => validateProductionOutput());
}
