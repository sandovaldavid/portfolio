import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(path, 'utf8');
const project = (locale: 'en' | 'es', id: string): string =>
	read(`src/content/projects/${locale}/${id}.mdx`);

describe('current project evidence contracts', () => {
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

	it(
		'describes Campus Map as the shipped Next.js 16 directory while keeping mapping on the roadmap',
		() => {
			const en = project('en', 'campus-map');

			expect(en).toContain('MAINTAINED · NEXT.JS 16 CODEBASE');
			expect(en).toContain('NEXT.JS 16 · REACT 19 · TAILWIND 4');
			expect(en).toContain('INTERACTIVE MAPPING REMAINS FUTURE WORK');
			expect(en).toContain('Interactive geospatial navigation remains future product work');
			expect(en).not.toContain('THE INTERACTIVE MAP IS NOT PRESENTED AS SHIPPED');
			expect(en).not.toContain('geolocation engine');
			expect(en).not.toContain('reduced from days to minutes');
		}
	);

	it('distinguishes MAD AI public client evidence from its private Django API', () => {
		const en = project('en', 'mad-ai');
		const metadata = read('src/entities/project/model/metadata.ts');

		expect(en).toContain('PUBLIC CLIENT · PRIVATE API');
		expect(en).toContain('Django 5.2.3');
		expect(en).toContain('Django REST Framework 3.16.0');
		expect(en).toContain('REQUEST/RESPONSE REST IS THE CURRENT TRANSPORT');
		expect(en).toContain('does not include Django Channels');
		expect(en).not.toContain('NO WEBSOCKET OR PRODUCTION-READINESS CLAIM');
		expect(en).not.toContain('Older portfolio copy described Django Channels/WebSockets');
		expect(metadata).toContain("sourceAccess: 'mixed'");
	});

	it(
		'keeps FluentReads aligned with its current static storefront manifest and boundaries',
		() => {
			const en = project('en', 'fluentreads');

			expect(en).toContain('Astro **7.0.6**');
			expect(en).toContain('React **19.2.7**');
			expect(en).toContain('Tailwind CSS **4.3.2**');
			expect(en).toContain('NO DATABASE, AUTH OR ONLINE PAYMENT GATEWAY');
			expect(en).not.toMatch(/95\+ Performance|100 Accessibility/);
		}
	);

	it(
		'keeps Auctions on current server-rendered wiring with explicit analytics and concurrency boundaries',
		() => {
			const en = project('en', 'auctions');

			expect(en).toContain('AuctionAnalytics');
			expect(en).toContain('PANDAS · PLOTLY · SCIKIT-LEARN ANALYTICS');
			expect(en).toContain('BID VALIDATION IS NOT A CONCURRENCY GUARANTEE');
			expect(en).toContain('REST API AND WEBSOCKET EXPERIMENTS ARE OUTSIDE THE CURRENT FLOW');
			expect(en).toContain('DRF and Django Channels are not part of the active user-facing');
			expect(en).not.toContain('PANDAS · PLOTLY · SCIKIT-LEARN ANALYTICS MODULE');
			expect(en).not.toContain('NO CURRENT DRF OR WEBSOCKET CLAIM');
			expect(en).not.toContain('does not call the current implementation concurrency-safe');
		}
	);

	it(
		'keeps canonical project boundaries aligned in Spanish without requiring translation parity',
		() => {
			const kioku = project('es', 'kioku');
			const yukidoke = project('es', 'yukidoke');
			const campusMap = project('es', 'campus-map');
			const madAi = project('es', 'mad-ai');
			const fluentReads = project('es', 'fluentreads');
			const auctions = project('es', 'auctions');

			expect(kioku).toContain('ESTABLE 3.1.2 + DESARROLLO');
			expect(yukidoke).toContain('ACTIVO · BETA V1 / ENDURECIMIENTO ENTRE REPOSITORIOS');
			expect(campusMap).toContain('MANTENIDO · NEXT.JS 16');
			expect(campusMap).toContain('EL MAPA INTERACTIVO CONTINÚA COMO TRABAJO FUTURO');
			expect(madAi).toContain('CLIENTE PÚBLICO · API PRIVADA');
			expect(madAi).toContain('REST REQUEST/RESPONSE ES EL TRANSPORTE ACTUAL');
			expect(fluentReads).toContain('Astro **7.0.6**');
			expect(auctions).toContain('PANDAS · PLOTLY · SCIKIT-LEARN');
			expect(auctions).toContain('VALIDAR LA PUJA NO GARANTIZA CONCURRENCIA');
			expect(auctions).toContain(
				'LOS EXPERIMENTOS REST Y WEBSOCKET ESTÁN FUERA DEL FLUJO ACTUAL'
			);
		}
	);
});
