import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const nonEmptyString = z.string().trim().min(1);
const stableContentId = z.string().regex(/^[a-z0-9-]+$/);
const locale = z.enum(['en', 'es']);

const blog = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
	schema: ({ image }) =>
		z.object({
			translationKey: stableContentId,
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			tags: z.array(z.string()).default([]),
			heroImage: image().optional(),
			draft: z.boolean().default(false),
			canonicalUrl: z.url().optional(),
		}),
});

const devlog = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/devlog' }),
	schema: z.object({
		translationKey: stableContentId,
		title: z.string(),
		summary: z.string(),
		pubDate: z.coerce.date(),
		version: z.string(),
		tags: z.array(z.string()).default([]),
	}),
});

const portfolioProfile = defineCollection({
	loader: glob({ pattern: '**/*.json', base: './src/content/portfolio-profile' }),
	schema: z.object({
		profileId: stableContentId,
		locale,
		seo: z.object({
			title: nonEmptyString,
			description: nonEmptyString,
		}),
		summary: nonEmptyString,
		biography: z.array(nonEmptyString).min(3),
		focusAreas: z.array(nonEmptyString).min(1),
		availabilityStatement: nonEmptyString,
		location: nonEmptyString,
		workMode: nonEmptyString,
		researchSummary: nonEmptyString,
		currentRoleSummary: nonEmptyString,
	}),
});

const experience = defineCollection({
	loader: glob({ pattern: '**/*.mdx', base: './src/content/experience' }),
	schema: z.object({
		experienceId: stableContentId,
		locale,
		company: nonEmptyString,
		title: nonEmptyString,
		dateLabel: nonEmptyString,
		summary: nonEmptyString,
		achievements: z.array(nonEmptyString).min(1),
	}),
});

const research = defineCollection({
	loader: glob({ pattern: '**/*.mdx', base: './src/content/research' }),
	schema: z.object({
		researchId: stableContentId,
		locale,
		label: nonEmptyString,
		title: nonEmptyString,
		status: z.enum(['in-progress']),
		institution: nonEmptyString,
		featuredSignals: z.array(nonEmptyString).min(1),
		keywords: z.array(nonEmptyString).min(1),
	}),
});

const projectStatus = z.object({
	lifecycle: nonEmptyString,
	source: nonEmptyString,
	demo: nonEmptyString,
});

const projects = defineCollection({
	loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
	schema: z.object({
		projectId: stableContentId,
		locale,
		title: nonEmptyString,
		description: nonEmptyString,
		category: nonEmptyString,
		imageAlt: nonEmptyString,
		caseStudy: z.object({
			kicker: nonEmptyString,
			status: projectStatus,
		}),
	}),
});

export const collections = { blog, devlog, portfolioProfile, experience, research, projects };
