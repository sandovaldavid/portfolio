import AngularIcon from '@assets/technologies/Angular.astro';
import AstroIcon from '@assets/technologies/AstroIcon.astro';
import CSharpIcon from '@assets/technologies/CSharp.astro';
import DotNetIcon from '@assets/technologies/DotNet.astro';
import GitHubActionsIcon from '@assets/technologies/GitHubActions.astro';
import PlaywrightIcon from '@assets/technologies/Playwright.astro';
import PostgreSQLIcon from '@assets/technologies/PostgreSQL.astro';
import TypeScriptIcon from '@assets/technologies/TypeScript.astro';
import type { Technology } from './types';

export type CoreStackTechnology = Pick<Technology, 'name' | 'icon'>;

/**
 * Curated technologies surfaced as the portfolio's current core stack.
 * Kept separate from TAGS so project taxonomy and recruiter-facing emphasis
 * can evolve independently without duplicating icon/name pairs in widgets.
 */
export const CORE_STACK = [
	{ name: '.NET', icon: DotNetIcon },
	{ name: 'C#', icon: CSharpIcon },
	{ name: 'Angular', icon: AngularIcon },
	{ name: 'TypeScript', icon: TypeScriptIcon },
	{ name: 'Astro', icon: AstroIcon },
	{ name: 'PostgreSQL', icon: PostgreSQLIcon },
	{ name: 'Playwright', icon: PlaywrightIcon },
	{ name: 'GitHub Actions', icon: GitHubActionsIcon },
] as const satisfies readonly CoreStackTechnology[];
