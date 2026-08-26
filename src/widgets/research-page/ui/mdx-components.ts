import { MermaidDiagram } from '@shared/ui/rich-content';
import EvaluationCriteria from './EvaluationCriteria.astro';
import ResearchEvidenceColumn from './ResearchEvidenceColumn.astro';
import ResearchEvidenceLayout from './ResearchEvidenceLayout.astro';
import ResearchSection from './ResearchSection.astro';

/** Approved research-specific composition surface available to localized research MDX entries. */
export const researchMdxComponents = {
	EvaluationCriteria,
	MermaidDiagram,
	ResearchEvidenceColumn,
	ResearchEvidenceLayout,
	ResearchSection,
} as const;
