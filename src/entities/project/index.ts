export { PROJECT_METADATA, PROJECT_TECHNOLOGIES, isProjectId } from './model/metadata';
export type {
	ProjectDemoAccess,
	ProjectId,
	ProjectLifecycle,
	ProjectRepository,
	ProjectResourceKind,
	ProjectSourceAccess,
	ProjectTechnologyId,
} from './model/metadata';
export { getProjectBySlug, getProjectDetailBySlug, getProjectsData } from './model/queries';
export type {
	CaseStudy,
	CaseStudyStatus,
	ProjectContentData,
	ProjectContentEntry,
	ProjectDetail,
	ProjectItem,
	ProjectList,
} from './model/types';
export { default as ProjectCard } from './ui/ProjectCard.astro';
