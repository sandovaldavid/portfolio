import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');
const readJson = <T>(path: string): T => JSON.parse(readSource(path)) as T;

interface VercelHeaderEntry {
	key: string;
	value: string;
}

interface VercelHeaderRule {
	source: string;
	headers: VercelHeaderEntry[];
}

interface VercelRedirectRule {
	source: string;
	destination: string;
	permanent: boolean;
}

interface VercelConfig {
	headers?: VercelHeaderRule[];
	redirects?: VercelRedirectRule[];
	rewrites?: unknown[];
}

describe('Vercel security headers, redirects and external link safety', () => {
	it('defines global HTTP security headers and protects resume provenance metadata', () => {
		const config = readJson<VercelConfig>('vercel.json');
		const globalRule = config.headers?.find(rule => rule.source === '/(.*)');
		const manifestRule = config.headers?.find(rule => rule.source === '/resume/manifest.json');

		expect(globalRule).toBeDefined();
		const headerMap = Object.fromEntries(
			(globalRule?.headers ?? []).map(entry => [entry.key, entry.value])
		);

		expect(headerMap['X-Content-Type-Options']).toBe('nosniff');
		expect(headerMap['X-Frame-Options']).toBe('DENY');
		expect(headerMap['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
		expect(headerMap['Permissions-Policy']).toContain('camera=()');
		expect(headerMap['Permissions-Policy']).toContain('focus-without-user-activation=()');
		expect(headerMap['Cross-Origin-Opener-Policy']).toBe('same-origin');
		expect(headerMap['Strict-Transport-Security']).toContain('max-age=');
		expect(headerMap['Content-Security-Policy-Report-Only']).toContain("object-src 'none'");
		expect(headerMap['Content-Security-Policy-Report-Only']).not.toContain('frame-ancestors');

		expect(manifestRule).toBeDefined();
		expect(manifestRule?.headers).toContainEqual({
			key: 'X-Robots-Tag',
			value: 'noindex, nofollow',
		});
	});

	it('redirects /links to the canonical Link Hub and /atena to the experience case study', () => {
		const config = readJson<VercelConfig>('vercel.json');

		expect(config.rewrites).toBeUndefined();
		expect(config.redirects).toContainEqual({
			source: '/links',
			destination: 'https://hub.sandovaldavid.com',
			permanent: true,
		});
		expect(config.redirects).toContainEqual({
			source: '/atena',
			destination: '/experience/atena-software-engineer',
			permanent: true,
		});
		expect(config.redirects).toContainEqual({
			source: '/es/atena',
			destination: '/es/experience/atena-software-engineer',
			permanent: true,
		});
	});

	it('escapes < in JSON-LD script blocks and enforces noopener noreferrer on external links', () => {
		const layout = readSource('src/app/layouts/Layout.astro');
		const linkInline = readSource('src/shared/ui/link-inline/LinkInline.astro');
		const recruiterHud = readSource('src/widgets/recruiter-hud/ui/RecruiterHUD.astro');

		expect(layout).toContain("JSON.stringify(schema).replaceAll('<', '\\\\u003c')");
		expect(layout).not.toContain('set:html={JSON.stringify(');
		expect(linkInline).toContain(
			"const resolvedRel = target === '_blank' ? (rel ?? 'noopener noreferrer') : rel;"
		);
		expect(linkInline).toContain("{target === '_blank' && newTabLabel &&");
		expect(recruiterHud).toContain("target={external ? '_blank' : undefined}");
		expect(recruiterHud).toContain("rel={external ? 'noopener noreferrer' : undefined}");
	});

	it('prohibits inline onclick handlers and enforces separated webmanifest icon purposes', () => {
		const notFound = readSource('src/pages/404.astro');
		const button = readSource('src/shared/ui/button/Button.astro');
		const manifest = readJson<{ icons?: Array<{ purpose?: string }> }>(
			'public/site.webmanifest'
		);

		expect(notFound).not.toContain('onclick=');
		expect(button).not.toContain('onclick');
		expect(manifest.icons?.some(icon => icon.purpose?.includes('any maskable'))).toBe(false);
	});
});
