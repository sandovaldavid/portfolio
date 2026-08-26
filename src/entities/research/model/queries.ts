import { getEntry } from 'astro:content';
import { Language } from '@shared/config/i18n';
import type { ResearchContent, ResearchContentEntry } from './types';

const RESEARCH_ENTRY_ID: Record<Language, string> = {
	[Language.ENGLISH]: 'en/oss-abandonment-bilstm',
	[Language.SPANISH]: 'es/oss-abandonment-bilstm',
};

const RESEARCH_ID = 'oss-abandonment-bilstm';

export async function getResearchEntry(lang: Language): Promise<ResearchContentEntry> {
	const research = await getEntry('research', RESEARCH_ENTRY_ID[lang]);

	if (!research) {
		throw new Error(`Missing research content for locale "${lang}".`);
	}

	if (research.data.locale !== lang) {
		throw new Error(
			`Research locale mismatch: requested "${lang}", received "${research.data.locale}".`
		);
	}

	if (research.data.researchId !== RESEARCH_ID) {
		throw new Error(
			`Unexpected research identity "${research.data.researchId}" for locale "${lang}".`
		);
	}

	return research;
}

export async function getResearchContent(lang: Language): Promise<ResearchContent> {
	return (await getResearchEntry(lang)).data;
}
