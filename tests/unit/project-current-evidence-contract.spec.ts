import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(path, 'utf8');
const project = (locale: 'en' | 'es', id: string): string =>
	read(`src/content/projects/${locale}/${id}.mdx`);

describe('audited current project evidence', () => {
	it('keeps Kioku on the current tagged release and public evidence resources', () => {
		const en = project('en', 'kioku');
		const metadata = read('src/entities/project/model/metadata.ts');

		expect(en).toContain('STABLE 3.1.2 + DEVELOPMENT');
		expect(en).not.toContain('STABLE 2.3.0');
		expect(en).toContain('SPEC → PLAN → SESSION');
		expect(metadata).toContain("docs: 'https://kioku.sandovaldavid.com'");
		expect(metadata).toContain("package: 'https://www.nuget.org/packages/kioku-mcp-server'");
	});

	it('keeps Yukidoke as an active private-source V1 beta without production claims', () => {
		const en = project('en', 'yukidoke');
		const metadata = read('src/entities/project/model/metadata.ts');
		const block = metadata.match(/yukidoke: \{([\s\S]*?)\n\t\},\n\tkioku:/)?.[1] ?? '';

		expect(en).toContain('ACTIVE · V1 BETA / CROSS-REPO HARDENING');
		expect(en).toContain('Angular 22');
		expect(en).toContain('.NET 10');
		expect(en).toContain('PostgreSQL 16');
		expect(en).not.toMatch(/production[- ]ready/i);
		expect(block).toContain("sourceAccess: 'private'");
		expect(block).toContain("demoAccess: 'unavailable'");
	});

	it('describes Campus Map as the shipped Next.js 16 directory rather than an unshipped geospatial map', () => {
		const en = project('en', 'campus-map');

		expect(en).toContain('NEXT.JS 16 CODEBASE');
		expect(en).toContain('NEXT.JS 16 · REACT 19 · TAILWIND 4');
		expect(en).toContain('THE INTERACTIVE MAP IS NOT PRESENTED AS SHIPPED');
		expect(en).not.toContain('geolocation engine');
		expect(en).not.toContain('reduced from days to minutes');
	});

	it('distinguishes MAD AI public client evidence from its private Django API', () => {
		const en = project('en', 'mad-ai');
		const metadata = read('src/entities/project/model/metadata.ts');

		expect(en).toContain('PUBLIC CLIENT · PRIVATE API');
		expect(en).toContain('Django 5.2.3');
		expect(en).toContain('Django REST Framework 3.16.0');
		expect(en).toContain('NO WEBSOCKET OR PRODUCTION-READINESS CLAIM');
		expect(en).toContain('Older portfolio copy described Django Channels/WebSockets');
		expect(metadata).toContain("sourceAccess: 'mixed'");
	});

	it('keeps FluentReads aligned with its current static storefront manifest and boundaries', () => {
		const en = project('en', 'fluentreads');

		expect(en).toContain('Astro **7.0.6**');
		expect(en).toContain('React **19.2.7**');
		expect(en).toContain('Tailwind CSS **4.3.2**');
		expect(en).toContain('NO DATABASE, AUTH OR ONLINE PAYMENT GATEWAY');
		expect(en).not.toMatch(/95\+ Performance|100 Accessibility/);
	});

	it('keeps Auctions on current server-rendered wiring and labels analytics without realtime claims', () => {
		const en = project('en', 'auctions');

		expect(en).toContain('AuctionAnalytics');
		expect(en).toContain('PANDAS · PLOTLY · SCIKIT-LEARN ANALYTICS MODULE');
		expect(en).toContain('NO CURRENT DRF OR WEBSOCKET CLAIM');
		expect(en).toContain(
			'do not expose DRF or Django Channels as the active application surface'
		);
		expect(en).toContain('does not call the current implementation concurrency-safe');
	});

	it('keeps the audited evidence boundaries mirrored in Spanish', () => {
		expect(project('es', 'kioku')).toContain('ESTABLE 3.1.2 + DESARROLLO');
		expect(project('es', 'yukidoke')).toContain('BETA V1 / HARDENING CROSS-REPO');
		expect(project('es', 'campus-map')).toContain('CODEBASE NEXT.JS 16');
		expect(project('es', 'mad-ai')).toContain('CLIENTE PÚBLICO · API PRIVADA');
		expect(project('es', 'fluentreads')).toContain('Astro **7.0.6**');
		expect(project('es', 'auctions')).toContain('SIN CLAIM ACTUAL DE DRF O WEBSOCKETS');
	});
});
