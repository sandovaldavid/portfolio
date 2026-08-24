/**
 * MDX chart props are JavaScript template literals, so a Mermaid label written
 * with `\n` reaches the renderer as a physical line break. Normalize only line
 * breaks that occur inside quoted node labels before splitting statements.
 */
export function normalizeQuotedDiagramLineBreaks(value: string, diagramTitle: string): string {
	let normalized = '';
	let inQuote = false;
	let escaped = false;

	for (const char of value.replaceAll('\r\n', '\n')) {
		if (char === '"' && !escaped) {
			inQuote = !inQuote;
		}

		if (char === '\n' && inQuote) {
			normalized += '\\n';
			escaped = false;
			continue;
		}

		normalized += char;
		if (char === '\\' && !escaped) {
			escaped = true;
		} else {
			escaped = false;
		}
	}

	if (inQuote) {
		throw new Error(`Unterminated quoted node label in diagram "${diagramTitle}".`);
	}

	return normalized;
}
