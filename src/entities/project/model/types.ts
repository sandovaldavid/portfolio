import type { ImageMetadata } from 'astro';
import type { CollectionEntry } from 'astro:content';
import type { Technology } from '@shared/config/technology';
import type {
	ProjectDemoAccess,
	ProjectId,
	ProjectLifecycle,
	ProjectSourceAccess,
} from './metadata';

export type ProjectContentEntry = CollectionEntry<'projects'>;
export type ProjectContentData = ProjectContentEntry['data'];

/**
 * Architecture evidence rendered by the legacy project case-study fallback.
 */
export interface CaseStudyArchitecture {
	/** Accessible caption explaining the diagram and its current scope */
	caption: string;
	/** Browser application and frontend responsibility */
	client: string;
	/** Identity provider and authentication boundary */
	identity: string;
	/** HTTP application and business-rule boundary */
	api: string;
	/** Implemented business modules owned by the API */
	modules: string;
	/** Durable data store and persistence responsibility */
	database: string;
	/** Supporting runtime processes */
	processes: string;
}

/**
 * Repository or demo source used to substantiate a case-study claim.
 */
export interface CaseStudySource {
	sourceId: string;
	label: string;
	access: string;
	href?: string;
}

/**
 * Optional evidence package for flagship case studies.
 * This remains the detailed source-of-truth layer even when a concise
 * recruiter-facing presentation is rendered above it.
 */
export interface CaseStudyEvidence {
	statusLabel: string;
	status: string;
	statusDetail: string;
	implementedLabel: string;
	implemented: string[];
	plannedLabel: string;
	planned: string[];
	architectureLabel: string;
	architecture: CaseStudyArchitecture;
	securityLabel: string;
	security: string[];
	testingLabel: string;
	testing: string[];
	deploymentLabel: string;
	deployment: string[];
	limitationsLabel: string;
	limitations: string[];
	sourcesLabel: string;
	sources: CaseStudySource[];
}

/**
 * Recruiter-facing lifecycle, access and limitation summary required for every project.
 * Proportional evidence contract: unlike `CaseStudyEvidence`, this is mandatory and concise.
 */
export interface CaseStudyStatus {
	lifecycleLabel: string;
	lifecycle: string;
	sourceLabel: string;
	source: string;
	demoLabel: string;
	demo: string;
	limitationsLabel: string;
	limitations: string[];
}

export interface CaseStudyPresentationBlock {
	label: string;
	title: string;
	body: string;
}

export interface CaseStudyPresentationLearning extends CaseStudyPresentationBlock {}

/**
 * Optional concise display layer for the current Figma v2 case-study template.
 * It never replaces the detailed case-study/evidence fields; it selects and
 * summarizes verified content for the first recruiter-facing reading pass.
 */
export interface CaseStudyPresentation {
	kicker: string;
	description: string;
	status: {
		lifecycle: string;
		source: string;
		demo: string;
	};
	narrative: {
		problem: CaseStudyPresentationBlock;
		approach: CaseStudyPresentationBlock;
		tradeoffs: CaseStudyPresentationBlock;
		outcome: CaseStudyPresentationBlock;
	};
	evidenceTitle: string;
	verified: CaseStudyPresentationBlock;
	boundaries: CaseStudyPresentationBlock;
	learningsTitle: string;
	learnings: CaseStudyPresentationLearning[];
}

/**
 * Localized case-study content for a portfolio project.
 */
export interface CaseStudy {
	problem: string;
	approach: string;
	tradeoffs: string;
	outcome: string;
	learnings: string[];
	timeline: string;
	role: string;
	status: CaseStudyStatus;
	evidence?: CaseStudyEvidence;
	presentation?: CaseStudyPresentation;
}

/**
 * Localized project content joined with language-neutral technical metadata.
 */
export interface ProjectItem {
	projectId: ProjectId;
	slug: string;
	title: string;
	description: string;
	category: string;
	imageAlt: string;
	link?: string;
	github?: string;
	image: ImageMetadata;
	tags: Technology[];
	featured: boolean;
	lifecycle: ProjectLifecycle;
	sourceAccess: ProjectSourceAccess;
	demoAccess: ProjectDemoAccess;
	caseStudy: CaseStudy;
}

export type ProjectList = ProjectItem[];