import { MermaidDiagram } from '@shared/ui/rich-content';
import EvaluationCriteria from './EvaluationCriteria.astro';
import ResearchSection from './ResearchSection.astro';

/** Approved research-specific composition surface available to localized research MDX entries. */
export const researchMdxComponents = {
	EvaluationCriteria,
	MermaidDiagram,
	ResearchSection,
} as const;
