import { existsSync, readdirSync, readFileSync } from 'node:fs';
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

export const FORBIDDEN_PUBLIC_COPY_PATTERNS = Object.freeze([
	/public reviewer/i,
	/recruiter can inspect/i,
	/recruiter-facing live deployment/i,
	/owner-verifiable context/i,
	/independently inspectable public evidence/i,
	/this portfolio (?:therefore )?(?:does not|makes no)/i,
	/portfolio copy should/i,
	/a case study should/i,
	/revisor público no puede/i,
	/reclutador puede inspeccionar/i,
	/despliegue en vivo para reclutadores/i,
	/contexto verificable por el propietario/i,
	/evidencia pública inspeccionable/i,
	/el portafolio (?:por ello )?no (?:afirma|expone)/i,
	/el copy del portafolio debe/i,
	/un caso de estudio debe/i,
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
 * @param {string} directory
 */
function collectHtmlFiles(directory) {
	const files = [];
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) files.push(...collectHtmlFiles(fullPath));
		else if (entry.isFile() && entry.name.endsWith('.html')) files.push(fullPath);
	}
	return files;
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

	const copyLeaks = [];
	for (const htmlPath of collectHtmlFiles(distDir)) {
		const html = readFileSync(htmlPath, 'utf8');
		for (const pattern of FORBIDDEN_PUBLIC_COPY_PATTERNS) {
			if (pattern.test(html)) {
				copyLeaks.push(`${path.relative(distDir, htmlPath)} :: ${pattern}`);
			}
		}
	}

	if (copyLeaks.length > 0) {
		throw new Error(
			`[production-output] ${copyLeaks.length} internal editorial phrase(s) leaked into public HTML:\n${copyLeaks.map(item => `- ${item}`).join('\n')}`
		);
	}

	return `${FORBIDDEN_PRODUCTION_ROUTES.length} development-only route contract(s) and ${FORBIDDEN_PUBLIC_COPY_PATTERNS.length} public-copy guardrail(s) validated.`;
}

if (isDirectExecution(import.meta.url)) {
	runValidationCli('production-output', () => validateProductionOutput());
}
