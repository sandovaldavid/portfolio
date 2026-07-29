import type { ImageMetadata } from 'astro';
import { TAGS } from '@shared/config/technology';

import yukidokeImg from '@assets/projects/project-11-yukidoke.svg';
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
} as const;

export type ProjectTechnologyId = keyof typeof PROJECT_TECHNOLOGIES;

interface ProjectMetadata {
	slug: string;
	image: ImageMetadata;
	technologyIds: readonly ProjectTechnologyId[];
	featured: boolean;
	order: number;
	link?: string;
	github?: string;
	evidenceSourceUrls?: Readonly<Record<string, string>>;
}

const projectMetadata = {
	yukidoke: {
		slug: 'yukidoke',
		image: yukidokeImg,
		technologyIds: ['angular', 'typescript', 'rxjs', 'csharp', 'postgresql'],
		featured: true,
		order: 50,
		evidenceSourceUrls: {
			'yukidoke-web': 'https://github.com/sandovaldavid/yukidoke-web',
			'yukidoke-api': 'https://github.com/sandovaldavid/yukidoke-api',
		},
	},
	'campus-map': {
		slug: 'campus-map',
		link: 'https://mapa-unp.sandovaldavid.com',
		github: 'https://github.com/sandovaldavid/unp-campus-map',
		image: campusMapImg,
		technologyIds: ['tailwind', 'cloudinary', 'nextjs', 'javascript', 'mysql'],
		featured: true,
		order: 40,
	},
	'mad-ai': {
		slug: 'mad-ai',
		github: 'https://github.com/sandovaldavid/MAD-AI',
		image: madaiImg,
		technologyIds: [
			'angular',
			'tailwind',
			'typescript',
			'rxjs',
			'django',
			'python',
			'postgresql',
		],
		featured: true,
		order: 30,
	},
	fluentreads: {
		slug: 'fluentreads',
		link: 'https://fluentreads.vercel.app',
		github: 'https://github.com/sandovaldavid/fluentreads',
		image: fluentreadsImg,
		technologyIds: ['astro', 'react', 'tailwind', 'typescript'],
		featured: false,
		order: 20,
	},
	auctions: {
		slug: 'auctions',
		link: 'https://auctions.sandovaldavid.com',
		github: 'https://github.com/sandovaldavid/auctions',
		image: auctionsImg,
		technologyIds: ['django', 'python', 'bootstrap', 'javascript', 'postgresql'],
		featured: false,
		order: 10,
	},
} as const satisfies Record<string, ProjectMetadata>;

export type ProjectId = keyof typeof projectMetadata;
export const PROJECT_METADATA: Record<ProjectId, ProjectMetadata> = projectMetadata;

export function isProjectId(value: string): value is ProjectId {
	return value in PROJECT_METADATA;
}
