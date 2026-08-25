import { describe, expect, it } from 'vitest';
import {
	getMermaidDirection,
	normalizeMermaidAuthoring,
	prepareMermaidChart,
} from '../../src/widgets/project-case-study/model/diagram';

describe('Mermaid case-study authoring adapter', () => {
	it('converts physical newlines inside quoted labels to Mermaid Markdown Strings', () => {
		const chart = `flowchart LR
Web["Angular 22
routes · signal stores"] --> API[".NET 10
household rules"]
API --> DB["PostgreSQL 16"]`;

		expect(normalizeMermaidAuthoring(chart, 'test diagram')).toBe(
			'flowchart LR\nWeb["`Angular 22\nroutes · signal stores`"] --> API["`.NET 10\nhousehold rules`"]\nAPI --> DB["PostgreSQL 16"]'
		);
	});

	it('normalizes CRLF while retaining native Mermaid statement boundaries', () => {
		const chart = 'flowchart TD\r\nA["first\r\nsecond"] --> B["done"]';

		expect(normalizeMermaidAuthoring(chart, 'windows diagram')).toBe(
			'flowchart TD\nA["`first\nsecond`"] --> B["done"]'
		);
		expect(getMermaidDirection(chart)).toBe('TD');
	});

	it('rejects unterminated quoted labels with the diagram title', () => {
		expect(() =>
			normalizeMermaidAuthoring('flowchart LR\nA["broken\nlabel]', 'broken diagram')
		).toThrow('Unterminated quoted Mermaid label in diagram "broken diagram".');
	});

	it('injects accessible metadata and semantic tone classes without parsing graph layout', () => {
		const prepared = prepareMermaidChart(
			'flowchart LR\nClient["Client"] --> Server["Server"]',
			'Runtime boundary',
			'A client reaches the server.\nThe server owns the boundary.',
			{ Client: 'brand', Server: 'info' }
		);

		expect(prepared).toContain('accTitle: Runtime boundary');
		expect(prepared).toContain(
			'accDescr: A client reaches the server. The server owns the boundary.'
		);
		expect(prepared).toContain('class Client portfolio-tone-brand;');
		expect(prepared).toContain('class Server portfolio-tone-info;');
		expect(prepared).toContain('Client["Client"] --> Server["Server"]');
	});

	it('rejects semantic tone injection outside flowcharts and unsafe node ids', () => {
		expect(() =>
			prepareMermaidChart(
				'sequenceDiagram\nAlice->>Bob: Hello',
				'Sequence',
				'Sequence test',
				{
					Alice: 'brand',
				}
			)
		).toThrow('Semantic node tones are supported only for Mermaid flowcharts');

		expect(() =>
			prepareMermaidChart('flowchart LR\nA --> B', 'Unsafe', 'Unsafe test', {
				'A;class B injected': 'danger',
			})
		).toThrow('Unsafe Mermaid node id');
	});
});
