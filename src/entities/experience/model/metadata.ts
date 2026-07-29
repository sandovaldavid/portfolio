export const EXPERIENCE_TECHNOLOGIES = {
	'dotnet-8': '.NET 8',
	'clean-architecture': 'Clean Architecture',
	cqrs: 'CQRS',
	'angular-19': 'Angular 19',
	signals: 'Signals',
	zoneless: 'Zoneless',
	'standalone-components': 'Standalone Components',
	'lazy-loading': 'Lazy Loading',
	'unit-testing': 'Unit Testing',
	angular: 'Angular',
	typescript: 'TypeScript',
	wordpress: 'WordPress',
	ecommerce: 'E-commerce',
	'responsive-design': 'Responsive Design',
	java: 'Java',
	'spring-boot': 'Spring Boot',
	react: 'React',
	foxpro: 'FoxPro',
	'systems-migration': 'Systems Migration',
	'systems-administration': 'Systems Administration',
	infrastructure: 'Infrastructure',
	troubleshooting: 'Troubleshooting',
} as const;

export type ExperienceTechnologyId = keyof typeof EXPERIENCE_TECHNOLOGIES;

interface ExperienceMetadata {
	startDate: string;
	endDate: string | null;
	isCurrent: boolean;
	order: number;
	featured: boolean;
	technologyIds: readonly ExperienceTechnologyId[];
	evidenceUrl?: string;
}

const experienceMetadata = {
	'atena-software-engineer': {
		startDate: '2026-01',
		endDate: null,
		isCurrent: true,
		order: 30,
		featured: true,
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
