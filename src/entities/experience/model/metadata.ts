export type ExperienceTechnologyKind = 'technology' | 'architecture' | 'practice' | 'capability';
export type ExperienceTechnologyIconKey = 'dotnet' | 'angular' | 'typescript' | 'java' | 'react';

export interface ExperienceTechnology {
	label: string;
	kind: ExperienceTechnologyKind;
	iconKey?: ExperienceTechnologyIconKey;
}

export const EXPERIENCE_TECHNOLOGIES = {
	'dotnet-8': { label: '.NET 8', kind: 'technology', iconKey: 'dotnet' },
	'clean-architecture': { label: 'Clean Architecture', kind: 'architecture' },
	cqrs: { label: 'CQRS', kind: 'architecture' },
	'angular-19': { label: 'Angular 19', kind: 'technology', iconKey: 'angular' },
	signals: { label: 'Signals', kind: 'technology', iconKey: 'angular' },
	zoneless: { label: 'Zoneless', kind: 'practice' },
	'standalone-components': { label: 'Standalone Components', kind: 'practice' },
	'lazy-loading': { label: 'Lazy Loading', kind: 'practice' },
	'unit-testing': { label: 'Unit Testing', kind: 'practice' },
	angular: { label: 'Angular', kind: 'technology', iconKey: 'angular' },
	typescript: { label: 'TypeScript', kind: 'technology', iconKey: 'typescript' },
	wordpress: { label: 'WordPress', kind: 'technology' },
	ecommerce: { label: 'E-commerce', kind: 'capability' },
	'responsive-design': { label: 'Responsive Design', kind: 'practice' },
	java: { label: 'Java', kind: 'technology', iconKey: 'java' },
	'spring-boot': { label: 'Spring Boot', kind: 'technology' },
	react: { label: 'React', kind: 'technology', iconKey: 'react' },
	foxpro: { label: 'FoxPro', kind: 'technology' },
	'systems-migration': { label: 'Systems Migration', kind: 'capability' },
	'systems-administration': { label: 'Systems Administration', kind: 'capability' },
	infrastructure: { label: 'Infrastructure', kind: 'capability' },
	troubleshooting: { label: 'Troubleshooting', kind: 'capability' },
} as const satisfies Record<string, ExperienceTechnology>;

export type ExperienceTechnologyId = keyof typeof EXPERIENCE_TECHNOLOGIES;

interface ExperienceMetadata {
	startDate: string;
	endDate: string | null;
	isCurrent: boolean;
	order: number;
	featured: boolean;
	technologyIds: readonly ExperienceTechnologyId[];
	domain?: string;
	evidenceUrl?: string;
}

const experienceMetadata = {
	'atena-software-engineer': {
		startDate: '2026-01',
		endDate: null,
		isCurrent: true,
		order: 30,
		featured: true,
		domain: 'FINTECH',
		technologyIds: [
			'dotnet-8',
			'clean-architecture',
			'cqrs',
			'angular-19',
			'signals',
			'zoneless',
			'standalone-components',
			'lazy-loading',
			'unit-testing',
		],
	},
	'chirasoft-fullstack-developer': {
		startDate: '2025-05',
		endDate: '2025-07',
		isCurrent: false,
		order: 20,
		featured: false,
		technologyIds: [
			'angular',
			'typescript',
			'wordpress',
			'ecommerce',
			'responsive-design',
			'java',
			'spring-boot',
		],
	},
	'municipality-piura-software-developer': {
		startDate: '2024-06',
		endDate: '2024-10',
		isCurrent: false,
		order: 10,
		featured: false,
		technologyIds: [
			'react',
			'foxpro',
			'systems-migration',
			'systems-administration',
			'infrastructure',
			'troubleshooting',
		],
	},
} as const;

export type ExperienceId = keyof typeof experienceMetadata;
export const EXPERIENCE_METADATA: Record<ExperienceId, ExperienceMetadata> = experienceMetadata;

export function isExperienceId(value: string): value is ExperienceId {
	return value in EXPERIENCE_METADATA;
}
