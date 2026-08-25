import type { CollectionEntry } from 'astro:content';
import type { ExperienceId, ExperienceTechnology } from './metadata';

export type ExperienceContentEntry = CollectionEntry<'experience'>;

/**
 * Localized professional experience joined with language-neutral metadata.
 */
export interface ExperienceItem {
	experienceId: ExperienceId;
	date: string;
	title: string;
	company: string;
	summary: string;
	description: string[];
	technologies: ExperienceTechnology[];
	startDate: string;
	endDate: string | null;
	isCurrent: boolean;
	featured: boolean;
	domain?: string;
	link?: string;
}

export interface ExperienceDetail {
	experience: ExperienceItem;
	entry: ExperienceContentEntry;
	previous?: ExperienceItem;
	next?: ExperienceItem;
}

export type ExperienceList = ExperienceItem[];
