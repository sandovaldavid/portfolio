import { describe, expect, it } from 'vitest';
import { normalizeQuotedDiagramLineBreaks } from '../../src/widgets/project-case-study/model/diagram';

describe('normalizeQuotedDiagramLineBreaks', () => {
	it('preserves statement boundaries while escaping physical newlines inside quoted labels', () => {
		const chart = `flowchart LR
Web["Angular 22
routes · signal stores"] --> API[".NET 10
household rules"]
API --> DB["PostgreSQL 16"]`;

		expect(normalizeQuotedDiagramLineBreaks(chart, 'test diagram')).toBe(
			'flowchart LR\nWeb["Angular 22\\nroutes · signal stores"] --> API[".NET 10\\nhousehold rules"]\nAPI --> DB["PostgreSQL 16"]'
		);
	});

	it('normalizes CRLF without changing quoted label semantics', () => {
		const chart = 'flowchart TD\r\nA["first\r\nsecond"] --> B["done"]';

		expect(normalizeQuotedDiagramLineBreaks(chart, 'windows diagram')).toBe(
			'flowchart TD\nA["first\\nsecond"] --> B["done"]'
		);
	});

	it('rejects unterminated quoted labels with the diagram title', () => {
		expect(() =>
			normalizeQuotedDiagramLineBreaks('flowchart LR\nA["broken\nlabel]', 'broken diagram')
		).toThrow('Unterminated quoted node label in diagram "broken diagram".');
	});
});
