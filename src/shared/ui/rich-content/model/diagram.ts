export type DiagramTone = 'brand' | 'info' | 'success' | 'secondary' | 'warning' | 'danger';

const flowchartHeaderPattern = /^\s*(?:flowchart|graph)\s+(LR|RL|TB|TD|BT)\s*$/i;
const safeNodeIdPattern = /^[A-Za-z0-9_-]+$/;

function normalizeAccessibleLine(value: string): string {
	return value.replace(/\s+/g, ' ').trim();
}

/**
 * MDX chart props are JavaScript template literals, so a Mermaid label authored
 * with `\n` reaches the component as a physical line break. Mermaid's Markdown
 * Strings are the native way to preserve those explicit line breaks without
 * maintaining a custom graph parser or layout engine.
 */
export function normalizeMermaidAuthoring(value: string, diagramTitle: string): string {
	const input = value.replaceAll('\r\n', '\n');
	let normalized = '';
	let quoted = '';
	let inQuote = false;
	let escaped = false;

	for (const char of input) {
		if (char === '"' && !escaped) {
			if (inQuote) {
				normalized += quoted.includes('\n') ? `"\`${quoted}\`"` : `"${quoted}"`;
				quoted = '';
				inQuote = false;
			} else {
				inQuote = true;
			}
			escaped = false;
			continue;
		}

		if (inQuote) quoted += char;
		else normalized += char;

		if (char === '\\' && !escaped) escaped = true;
		else escaped = false;
	}

	if (inQuote) {
		throw new Error(`Unterminated quoted Mermaid label in diagram "${diagramTitle}".`);
	}

	return normalized.trim();
}

export function getMermaidDirection(chart: string): string {
	const firstLine = chart.replaceAll('\r\n', '\n').trimStart().split('\n', 1)[0] ?? '';
	return firstLine.match(flowchartHeaderPattern)?.[1]?.toUpperCase() ?? 'AUTO';
}

export function prepareMermaidChart(
	chart: string,
	title: string,
	description: string,
	tones: Partial<Record<string, DiagramTone>> = {}
): string {
	const normalized = normalizeMermaidAuthoring(chart, title);
	const lines = normalized.split('\n');
	const header = lines.shift()?.trim();
	if (!header) throw new Error(`Diagram "${title}" has no Mermaid definition.`);

	const toneEntries = Object.entries(tones);
	if (toneEntries.length > 0 && !flowchartHeaderPattern.test(header)) {
		throw new Error(
			`Semantic node tones are supported only for Mermaid flowcharts: "${title}".`
		);
	}

	const toneClasses = toneEntries.map(([nodeId, tone]) => {
		if (!safeNodeIdPattern.test(nodeId)) {
			throw new Error(`Unsafe Mermaid node id "${nodeId}" in diagram "${title}".`);
		}
		return `class ${nodeId} portfolio-tone-${tone};`;
	});

	return [
		header,
		`accTitle: ${normalizeAccessibleLine(title)}`,
		`accDescr: ${normalizeAccessibleLine(description)}`,
		...lines,
		...toneClasses,
	]
		.filter(Boolean)
		.join('\n');
}
