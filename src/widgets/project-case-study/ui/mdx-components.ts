import { MermaidDiagram } from '@shared/ui/rich-content';
import CaseStudyCard from './CaseStudyCard.astro';
import CaseStudyGrid from './CaseStudyGrid.astro';
import CaseStudySection from './CaseStudySection.astro';
import EvidenceBlock from './EvidenceBlock.astro';
import ProjectGallery from './ProjectGallery.astro';
import ProjectVideo from './ProjectVideo.astro';

/** Approved project-specific composition surface available to localized project MDX entries. */
export const projectCaseStudyComponents = {
	CaseStudyCard,
	CaseStudyGrid,
	CaseStudySection,
	EvidenceBlock,
	MermaidDiagram,
	ProjectGallery,
	ProjectVideo,
} as const;
