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

/** Concise localized status rendered in the shared Project Detail hero. */
export interface CaseStudyStatus {
	lifecycle: string;
	source: string;
	demo: string;
}

/**
 * Shared frontmatter contract for every project detail.
 * The unique narrative, evidence, diagrams and learnings live in the MDX body.
 */
export interface CaseStudy {
	kicker: string;
	status: CaseStudyStatus;
}

/** Localized project content joined with language-neutral technical metadata. */
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

/** Detail-page payload keeps the renderable content entry separate from the entity DTO. */
export interface ProjectDetail {
	project: ProjectItem;
	entry: ProjectContentEntry;
}

export type ProjectList = ProjectItem[];
