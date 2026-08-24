import type { ImageMetadata } from 'astro';
import { TAGS } from '@shared/config/technology';

import yukidokeImg from '@assets/projects/project-11-yukidoke.svg';
import kiokuImg from '@assets/projects/project-12-kioku.svg';
import campusMapImg from '@assets/projects/project-08-campus-map.webp';
import madaiImg from '@assets/projects/project-10-MAD-AI.webp';
import fluentreadsImg from '@assets/projects/project-09-fluentreads.webp';
import auctionsImg from '@assets/projects/project-02-auctions.webp';

export const PROJECT_TECHNOLOGIES = {
	angular: TAGS.ANGULAR,
	typescript: TAGS.TYPESCRIPT,
	rxjs: TAGS.RXJS,
	csharp: TAGS.CSHARP,
	postgresql: TAGS.POSTGRESQL,
	tailwind: TAGS.TAILWIND,
	cloudinary: TAGS.CLOUDINARY,
	nextjs: TAGS.NEXTJS,
	javascript: TAGS.JAVASCRIPT,
	mysql: TAGS.MYSQL,
	django: TAGS.DJANGO,
	python: TAGS.PYTHON,
	astro: TAGS.ASTRO,
	react: TAGS.REACT,
	bootstrap: TAGS.BOOTSTRAP,
	markdown: TAGS.MARKDOWN,
} as const;

export type ProjectTechnologyId = keyof typeof PROJECT_TECHNOLOGIES;

/** Recruiter-facing lifecycle classification, verified against repository activity. */
export type ProjectLifecycle = 'active' | 'maintained' | 'experimental' | 'archived' | 'deprecated';
/** Whether the project's source is publicly inspectable. */
export type ProjectSourceAccess = 'public' | 'private';
/** What kind of demo evidence, if any, is publicly reachable. */
export type ProjectDemoAccess = 'live' | 'preview' | 'video' | 'screenshots' | 'unavailable';
/** Optional public resources that add evidence beyond the source repository and demo. */
export type ProjectResourceKind = 'docs' | 'package' | 'related';

interface ProjectMetadata {
	slug: string;
	image: ImageMetadata;
	technologyIds: readonly ProjectTechnologyId[];
	featured: boolean;
	order: number;
	lifecycle: ProjectLifecycle;
	sourceAccess: ProjectSourceAccess;
	demoAccess: ProjectDemoAccess;
	link?: string;
	github?: string;
	resources?: Partial<Record<ProjectResourceKind, string>>;
}

const projectMetadata = {
	yukidoke: {
		slug: 'yukidoke',
		image: yukidokeImg,
		technologyIds: ['angular', 'typescript', 'rxjs', 'csharp', 'postgresql'],
		featured: true,
		order: 50,
		lifecycle: 'active',
		sourceAccess: 'private',
		demoAccess: 'unavailable',
	},
	kioku: {
		slug: 'kioku',
		github: 'https://github.com/sandovaldavid/kioku',
		image: kiokuImg,
		technologyIds: ['csharp', 'markdown'],
		featured: true,
		order: 45,
		lifecycle: 'active',
		sourceAccess: 'public',
		demoAccess: 'unavailable',
		resources: {
			docs: 'https://kioku.sandovaldavid.com',
			package: 'https://www.nuget.org/packages/kioku-mcp-server',
			related: 'https://github.com/sandovaldavid/kioku-obsidian',
		},
	},
	'campus-map': {
		slug: 'campus-map',
		github: 'https://github.com/sandovaldavid/unp-campus-map',
		image: campusMapImg,
		technologyIds: ['tailwind', 'cloudinary', 'nextjs', 'javascript', 'mysql'],
		featured: true,
		order: 40,
		lifecycle: 'maintained',
		sourceAccess: 'public',
		demoAccess: 'unavailable',
	},
	'mad-ai': {
		slug: 'mad-ai',
		github: 'https://github.com/sandovaldavid/MAD-AI',
		image: madaiImg,
		technologyIds: ['angular', 'tailwind', 'typescript', 'rxjs'],
		featured: true,
		order: 30,
		lifecycle: 'maintained',
		sourceAccess: 'public',
		demoAccess: 'unavailable',
	},
	fluentreads: {
		slug: 'fluentreads',
		link: 'https://fluentreads.vercel.app',
		github: 'https://github.com/sandovaldavid/fluentreads',
		image: fluentreadsImg,
		technologyIds: ['astro', 'react', 'tailwind', 'typescript'],
		featured: false,
		order: 20,
		lifecycle: 'maintained',
		sourceAccess: 'public',
		demoAccess: 'live',
	},
	auctions: {
		slug: 'auctions',
		github: 'https://github.com/sandovaldavid/auctions',
		image: auctionsImg,
		technologyIds: ['django', 'python', 'bootstrap', 'javascript', 'postgresql'],
		featured: false,
		order: 10,
		lifecycle: 'maintained',
		sourceAccess: 'public',
		demoAccess: 'unavailable',
	},
} as const satisfies Record<string, ProjectMetadata>;

export type ProjectId = keyof typeof projectMetadata;
export const PROJECT_METADATA: Record<ProjectId, ProjectMetadata> = projectMetadata;

export function isProjectId(value: string): value is ProjectId {
	return value in PROJECT_METADATA;
}
