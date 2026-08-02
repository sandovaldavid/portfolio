/**
 * Technology represents a programming language, framework, or tool
 */
export interface Technology {
	/** Display name of the technology */
	name: string;
	/** Tailwind CSS classes for styling the tag */
	class: string;
	/** Astro icon component for the technology */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	icon: any;
}

/**
 * Technology tag configuration type
 */
export type TechnologyTags = Record<string, Technology>;
