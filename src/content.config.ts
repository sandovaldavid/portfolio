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
	loader: glob({ pattern: '**/*.json', base: './src/content/experience' }),
	schema: z.object({
		experienceId: stableContentId,
		locale,
		company: nonEmptyString,
		title: nonEmptyString,
		dateLabel: nonEmptyString,
		achievements: z.array(nonEmptyString).min(1),
	}),
});

const research = defineCollection({
	loader: glob({ pattern: '**/*.json', base: './src/content/research' }),
	schema: z.object({
		researchId: stableContentId,
		locale,
		label: nonEmptyString,
		title: nonEmptyString,
		problem: nonEmptyString,
		hypothesis: nonEmptyString,
		approach: nonEmptyString,
		dataset: nonEmptyString,
		status: nonEmptyString,
		institution: nonEmptyString,
		keywords: z.array(nonEmptyString).min(1),
		metrics: z.object({
			accuracy: nonEmptyString,
			f1: nonEmptyString,
			auc: nonEmptyString,
			loss: nonEmptyString,
		}),
		pipelineSteps: z.array(nonEmptyString).min(1),
		architecture: z
			.array(
				z.object({
					label: nonEmptyString,
					value: nonEmptyString,
				})
			)
			.min(1),
		engineeredFeatures: z.array(nonEmptyString).min(1),
		currentStatus: nonEmptyString,
	}),
});

const projectEvidence = z.object({
	statusLabel: nonEmptyString,
	status: nonEmptyString,
	statusDetail: nonEmptyString,
	implementedLabel: nonEmptyString,
	implemented: z.array(nonEmptyString).min(1),
	plannedLabel: nonEmptyString,
	planned: z.array(nonEmptyString).min(1),
	architectureLabel: nonEmptyString,
	architecture: z.object({
		caption: nonEmptyString,
		client: nonEmptyString,
		identity: nonEmptyString,
		api: nonEmptyString,
		modules: nonEmptyString,
		database: nonEmptyString,
		processes: nonEmptyString,
	}),
	securityLabel: nonEmptyString,
	security: z.array(nonEmptyString).min(1),
	testingLabel: nonEmptyString,
	testing: z.array(nonEmptyString).min(1),
	deploymentLabel: nonEmptyString,
	deployment: z.array(nonEmptyString).min(1),
	limitationsLabel: nonEmptyString,
	limitations: z.array(nonEmptyString).min(1),
	sourcesLabel: nonEmptyString,
	sources: z
		.array(
			z.object({
				sourceId: stableContentId,
				label: nonEmptyString,
				access: nonEmptyString,
			})
		)
		.min(1),
});

const projects = defineCollection({
	loader: glob({ pattern: '**/*.json', base: './src/content/projects' }),
	schema: z.object({
		projectId: stableContentId,
		locale,
		title: nonEmptyString,
		description: nonEmptyString,
		category: nonEmptyString,
		imageAlt: nonEmptyString,
		caseStudy: z.object({
			problem: nonEmptyString,
			approach: nonEmptyString,
			tradeoffs: nonEmptyString,
			outcome: nonEmptyString,
			learnings: z.array(nonEmptyString).min(1),
			timeline: nonEmptyString,
			role: nonEmptyString,
			evidence: projectEvidence.optional(),
		}),
	}),
});

export const collections = { blog, devlog, portfolioProfile, experience, research, projects };
