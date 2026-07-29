import type { CollectionEntry } from 'astro:content';
import type { ExperienceId } from './metadata';

export type ExperienceContentEntry = CollectionEntry<'experience'>;
export type ExperienceContentData = ExperienceContentEntry['data'];

/**
 * Localized professional experience joined with language-neutral metadata.
 */
export interface ExperienceItem {
	experienceId: ExperienceId;
	date: string;
	title: string;
	company: string;
	description: string[];
	technologies: string[];
	startDate: string;
	endDate: string | null;
	isCurrent: boolean;
	featured: boolean;
	link?: string;
}

export type ExperienceList = ExperienceItem[];
