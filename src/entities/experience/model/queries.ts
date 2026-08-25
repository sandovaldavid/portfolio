import { getCollection } from 'astro:content';
import type { Language } from '@shared/config/i18n';
import {
	EXPERIENCE_METADATA,
	EXPERIENCE_TECHNOLOGIES,
	isExperienceId,
	type ExperienceId,
} from './metadata';
import type {
	ExperienceContentEntry,
	ExperienceDetail,
	ExperienceItem,
	ExperienceList,
} from './types';

interface LocalizedExperienceItem extends ExperienceItem {
	locale: 'en' | 'es';
}

function toExperienceItem(entry: ExperienceContentEntry): LocalizedExperienceItem {
	const { experienceId, locale, company, title, dateLabel, summary, achievements } = entry.data;

	if (!isExperienceId(experienceId)) {
		throw new Error(`Missing language-neutral metadata for experience "${experienceId}".`);
	}

	const metadata = EXPERIENCE_METADATA[experienceId];
	const domain = metadata.domain ? { domain: metadata.domain } : {};
	const organization = metadata.organizationUrl
		? { organizationUrl: metadata.organizationUrl }
		: {};
	const evidence = metadata.evidenceUrl ? { link: metadata.evidenceUrl } : {};

	return {
		experienceId,
		date: dateLabel,
		title,
		company,
		summary,
		description: [...achievements],
		technologies: metadata.technologyIds.map(id => ({ ...EXPERIENCE_TECHNOLOGIES[id] })),
		presentation: metadata.presentation,
		startDate: metadata.startDate,
		endDate: metadata.endDate,
		isCurrent: metadata.isCurrent,
		featured: metadata.featured,
		locale,
		...domain,
		...organization,
		...evidence,
	};
}

async function getLocalizedExperienceEntries(lang: Language): Promise<ExperienceContentEntry[]> {
	return getCollection('experience', ({ data }) => data.locale === lang);
}

function buildExperienceList(entries: ExperienceContentEntry[], lang: Language): ExperienceList {
	const seen = new Set<string>();
	const experience = entries.map(entry => {
		if (seen.has(entry.data.experienceId)) {
			throw new Error(
				`Duplicate experience ID "${entry.data.experienceId}" for locale "${lang}".`
			);
		}
		seen.add(entry.data.experienceId);

		const item = toExperienceItem(entry);
		if (item.locale !== lang) {
			throw new Error(
				`Experience locale mismatch: requested "${lang}", received "${item.locale}".`
			);
		}

		const { locale: _locale, ...localizedItem } = item;
		return localizedItem;
	});

	const expectedIds = Object.keys(EXPERIENCE_METADATA) as ExperienceId[];
	const missingIds = expectedIds.filter(experienceId => !seen.has(experienceId));
	if (missingIds.length > 0) {
		throw new Error(
			`Missing experience content for locale "${lang}": ${missingIds.join(', ')}.`
		);
	}

	return experience.sort(
		(left, right) =>
			EXPERIENCE_METADATA[right.experienceId].order -
			EXPERIENCE_METADATA[left.experienceId].order
	);
}

export async function getExperienceData(lang: Language): Promise<ExperienceList> {
	const entries = await getLocalizedExperienceEntries(lang);
	return buildExperienceList(entries, lang);
}

export async function getExperienceDetailBySlug(
	lang: Language,
	slug: string
): Promise<ExperienceDetail | undefined> {
	if (!isExperienceId(slug)) return undefined;

	const entries = await getLocalizedExperienceEntries(lang);
	const entry = entries.find(candidate => candidate.data.experienceId === slug);
	if (!entry) return undefined;

	const experience = buildExperienceList(entries, lang);
	const currentIndex = experience.findIndex(item => item.experienceId === slug);
	if (currentIndex < 0) return undefined;

	return {
		experience: experience[currentIndex],
		entry,
		previous: experience[currentIndex + 1],
		next: experience[currentIndex - 1],
	};
}
