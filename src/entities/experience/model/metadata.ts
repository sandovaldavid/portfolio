export type ExperienceTechnologyKind = 'technology' | 'architecture' | 'practice' | 'capability';
export type ExperienceTechnologyIconKey =
	'dotnet' | 'angular' | 'typescript' | 'java' | 'react' | 'mysql';
export type ExperiencePresentation = 'systems' | 'product' | 'operations';

export interface ExperienceTechnology {
	label: string;
	kind: ExperienceTechnologyKind;
	iconKey?: ExperienceTechnologyIconKey;
}

export const EXPERIENCE_TECHNOLOGIES = {
	'dotnet-8': { label: '.NET 8', kind: 'technology', iconKey: 'dotnet' },
	'entity-framework-core': {
		label: 'Entity Framework Core',
		kind: 'technology',
		iconKey: 'dotnet',
	},
	'sql-server': { label: 'SQL Server', kind: 'technology' },
	'clean-architecture': { label: 'Clean Architecture', kind: 'architecture' },
	cqrs: { label: 'CQRS', kind: 'architecture' },
	'angular-19': { label: 'Angular 19', kind: 'technology', iconKey: 'angular' },
	signals: { label: 'Signals', kind: 'technology', iconKey: 'angular' },
	zoneless: { label: 'Zoneless', kind: 'practice' },
	'standalone-components': { label: 'Standalone Components', kind: 'practice' },
	'lazy-loading': { label: 'Lazy Loading', kind: 'practice' },
	'unit-testing': { label: 'Unit Testing', kind: 'practice' },
	'ci-cd': { label: 'CI/CD', kind: 'practice' },
	'typed-api-contracts': {
		label: 'Typed API Contracts',
		kind: 'practice',
		iconKey: 'typescript',
	},
	angular: { label: 'Angular', kind: 'technology', iconKey: 'angular' },
	typescript: { label: 'TypeScript', kind: 'technology', iconKey: 'typescript' },
	wordpress: { label: 'WordPress', kind: 'technology' },
	ecommerce: { label: 'E-commerce', kind: 'capability' },
	'responsive-design': { label: 'Responsive Design', kind: 'practice' },
	'seo-metadata': { label: 'SEO Metadata', kind: 'practice' },
	figma: { label: 'Figma', kind: 'technology' },
	java: { label: 'Java', kind: 'technology', iconKey: 'java' },
	'spring-boot': { label: 'Spring Boot', kind: 'technology' },
	react: { label: 'React', kind: 'technology', iconKey: 'react' },
	mysql: { label: 'MySQL', kind: 'technology', iconKey: 'mysql' },
	foxpro: { label: 'FoxPro', kind: 'technology' },
	'systems-migration': { label: 'Systems Migration', kind: 'capability' },
	'legacy-migration-assessment': {
		label: 'Legacy Migration Assessment',
		kind: 'capability',
	},
	'systems-administration': { label: 'Systems Administration', kind: 'capability' },
	infrastructure: { label: 'Infrastructure Support', kind: 'capability' },
	networking: { label: 'VLAN / Subnetting', kind: 'capability' },
	'backup-recovery': { label: 'Backup & Recovery', kind: 'capability' },
	troubleshooting: { label: 'Troubleshooting', kind: 'capability' },
} as const satisfies Record<string, ExperienceTechnology>;

export type ExperienceTechnologyId = keyof typeof EXPERIENCE_TECHNOLOGIES;

interface ExperienceMetadata {
	startDate: string;
	endDate: string | null;
	isCurrent: boolean;
	order: number;
	featured: boolean;
	presentation: ExperiencePresentation;
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
		presentation: 'systems',
		domain: 'FINTECH',
		technologyIds: [
			'dotnet-8',
			'entity-framework-core',
			'angular-19',
			'signals',
			'typescript',
			'sql-server',
			'typed-api-contracts',
			'unit-testing',
			'ci-cd',
		],
	},
	'chirasoft-fullstack-developer': {
		startDate: '2025-03',
		endDate: '2025-06',
		isCurrent: false,
		order: 20,
		featured: false,
		presentation: 'product',
		technologyIds: [
			'angular-19',
			'typescript',
			'java',
			'spring-boot',
			'wordpress',
			'figma',
			'ecommerce',
			'responsive-design',
			'seo-metadata',
		],
	},
	'municipality-piura-software-developer': {
		startDate: '2024-06',
		endDate: '2024-12',
		isCurrent: false,
		order: 10,
		featured: false,
		presentation: 'operations',
		technologyIds: [
			'infrastructure',
			'networking',
			'backup-recovery',
			'troubleshooting',
			'foxpro',
			'react',
			'mysql',
			'legacy-migration-assessment',
		],
	},
} as const;

export type ExperienceId = keyof typeof experienceMetadata;
export const EXPERIENCE_METADATA: Record<ExperienceId, ExperienceMetadata> = experienceMetadata;

export function isExperienceId(value: string): value is ExperienceId {
	return value in EXPERIENCE_METADATA;
}
