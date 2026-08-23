export { PROJECT_METADATA, PROJECT_TECHNOLOGIES, isProjectId } from './metadata';
export type {
	ProjectDemoAccess,
	ProjectId,
	ProjectLifecycle,
	ProjectResourceKind,
	ProjectSourceAccess,
	ProjectTechnologyId,
} from './metadata';
export { getProjectBySlug, getProjectDetailBySlug, getProjectsData } from './queries';
export type {
	CaseStudy,
	CaseStudyStatus,
	ProjectContentData,
	ProjectContentEntry,
	ProjectDetail,
	ProjectItem,
	ProjectList,
} from './types';
