import CaseStudyCard from './CaseStudyCard.astro';
import CaseStudyGrid from './CaseStudyGrid.astro';
import CaseStudySection from './CaseStudySection.astro';
import EvidenceBlock from './EvidenceBlock.astro';
import MermaidDiagram from './MermaidDiagram.astro';
import ProjectGallery from './ProjectGallery.astro';
import ProjectResources from './ProjectResources.astro';
import ProjectVideo from './ProjectVideo.astro';

/** Approved component surface available to localized project MDX entries. */
export const projectCaseStudyComponents = {
	CaseStudyCard,
	CaseStudyGrid,
	CaseStudySection,
	EvidenceBlock,
	MermaidDiagram,
	ProjectGallery,
	ProjectResources,
	ProjectVideo,
} as const;
