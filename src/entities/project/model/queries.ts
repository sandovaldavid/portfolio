import { getCollection } from 'astro:content';
import type { Language } from '@shared/config/i18n';
import { PROJECT_METADATA, PROJECT_TECHNOLOGIES, isProjectId, type ProjectId } from './metadata';
import type { ProjectContentEntry, ProjectDetail, ProjectItem, ProjectList } from './types';

function toProjectItem(entry: ProjectContentEntry): ProjectItem {
	const { projectId, title, description, category, imageAlt, caseStudy } = entry.data;

	if (!isProjectId(projectId)) {
		throw new Error(`Missing language-neutral metadata for project "${projectId}".`);
	}

	const metadata = PROJECT_METADATA[projectId];
	const link = metadata.link ? { link: metadata.link } : {};
	const github = metadata.github ? { github: metadata.github } : {};

	return {
		projectId,
		slug: metadata.slug,
		title,
		description,
		category,
		imageAlt,
		image: metadata.image,
		tags: metadata.technologyIds.map(id => PROJECT_TECHNOLOGIES[id]),
		featured: metadata.featured,
		lifecycle: metadata.lifecycle,
		sourceAccess: metadata.sourceAccess,
		demoAccess: metadata.demoAccess,
		caseStudy: {
			kicker: caseStudy.kicker,
			status: { ...caseStudy.status },
		},
		...link,
		...github,
	};
}

async function getLocalizedProjectEntries(lang: Language): Promise<ProjectContentEntry[]> {
	const entries = await getCollection('projects', ({ data }) => data.locale === lang);
	const seen = new Set<string>();

	for (const entry of entries) {
		if (entry.data.locale !== lang) {
			throw new Error(
				`Project locale mismatch: requested "${lang}", received "${entry.data.locale}".`
			);
		}

		if (seen.has(entry.data.projectId)) {
			throw new Error(`Duplicate project ID "${entry.data.projectId}" for locale "${lang}".`);
		}
		seen.add(entry.data.projectId);
	}

	const expectedIds = Object.keys(PROJECT_METADATA) as ProjectId[];
	const missingIds = expectedIds.filter(projectId => !seen.has(projectId));
	if (missingIds.length > 0) {
		throw new Error(`Missing project content for locale "${lang}": ${missingIds.join(', ')}.`);
	}

	return entries;
}

export async function getProjectsData(lang: Language): Promise<ProjectList> {
	const entries = await getLocalizedProjectEntries(lang);
	return entries
		.map(toProjectItem)
		.sort(
			(left, right) =>
				PROJECT_METADATA[right.projectId].order - PROJECT_METADATA[left.projectId].order
		);
}

export async function getProjectDetailBySlug(
	lang: Language,
	slug: string
): Promise<ProjectDetail | undefined> {
	const entries = await getLocalizedProjectEntries(lang);
	const entry = entries.find(candidate => {
		const projectId = candidate.data.projectId;
		return isProjectId(projectId) && PROJECT_METADATA[projectId].slug === slug;
	});
	return entry ? { project: toProjectItem(entry), entry } : undefined;
}

export async function getProjectBySlug(
	lang: Language,
	slug: string
): Promise<ProjectItem | undefined> {
	const detail = await getProjectDetailBySlug(lang, slug);
	return detail?.project;
}
