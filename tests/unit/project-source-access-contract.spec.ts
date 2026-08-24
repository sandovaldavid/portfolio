import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');

describe('project source-access evidence contract', () => {
	it('models MAD AI as a mixed public-client/private-api project', () => {
		const metadata = readSource('src/entities/project/model/metadata.ts');
		const madAiBlock =
			metadata.match(/'mad-ai': \{([\s\S]*?)\n\t\},\n\tfluentreads:/)?.[1] ?? '';

		expect(metadata).toContain(
			"export type ProjectSourceAccess = 'public' | 'private' | 'mixed'"
		);
		expect(madAiBlock).toContain("sourceAccess: 'mixed'");
		expect(madAiBlock).toContain("github: 'https://github.com/sandovaldavid/MAD-AI'");
	});

	it('keeps public resource links available for the public side of mixed projects', () => {
		const shell = readSource('src/widgets/project-case-study/ui/ProjectCaseStudy.astro');
		const resources = readSource('src/widgets/project-case-study/ui/ProjectResources.astro');

		expect(shell).toContain("project.sourceAccess !== 'private'");
		expect(resources).toContain("metadata.sourceAccess !== 'private'");
	});
});
