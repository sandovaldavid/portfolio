import type { CollectionEntry } from 'astro:content';

export type ResearchContentEntry = CollectionEntry<'research'>;
export type ResearchContent = ResearchContentEntry['data'];
