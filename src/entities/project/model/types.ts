import type { ImageMetadata } from 'astro';
import type { CollectionEntry } from 'astro:content';
import type { Technology } from '@shared/config/technology';
import type { ProjectId } from './metadata';

export type ProjectContentEntry = CollectionEntry<'projects'>;
export type ProjectContentData = ProjectContentEntry['data'];

/**
 * Architecture evidence rendered by the project case-study widget.
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
	evidence?: CaseStudyEvidence;
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
	caseStudy: CaseStudy;
}

export type ProjectList = ProjectItem[];
