# Astro + FSD Patterns

## File Naming Conventions

### Component Files

- Use PascalCase: `Badge.astro`, `ThemeToggle.astro`
- Match directory name: `badge/Badge.astro`, `theme-toggle/ThemeToggle.astro`

### Type Files

- Use lowercase with `.ts`: `types.ts`, `data.ts`, `config.ts`

### Index Files

- Always `index.ts` (not .astro) for Public APIs

## Component Structure

### Shared UI Component Template

```astro
---
// shared/ui/badge/Badge.astro
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'span'> {
	title: string;
	icon?: ImageMetadata;
}

const { title, icon, class: className, ...rest } = Astro.props;
---

<span class:list={['badge', className]} {...rest}>
	{icon && <img src={icon.src} alt={title} />}
	{title}
</span>

<style>
	.badge {
		/* Styles here */
	}
</style>
```

### Entity Model Template

```typescript
// entities/project/model/types.ts
export interface Project {
	id: string;
	title: string;
	description: string;
	link?: string;
	technologies: Technology[];
}

export type ProjectsByLanguage = {
	[lang: string]: Project[];
};
```

```typescript
// entities/project/model/data.ts
import type { ProjectsByLanguage } from './types';
import { TECHNOLOGIES } from '@entities/technology';

export const PROJECTS: ProjectsByLanguage = {
	es: [
		{
			id: 'project-1',
			title: 'Mi Proyecto',
			description: 'Descripción...',
			technologies: [TECHNOLOGIES.REACT, TECHNOLOGIES.TYPESCRIPT],
		},
	],
	en: [
		// English projects...
	],
};
```

```typescript
// entities/project/index.ts (Public API)
export { PROJECTS } from './model/data';
export type { Project, ProjectsByLanguage } from './model/types';
```

### Feature Component Template

```astro
---
// features/theme-toggle/ui/ThemeToggle.astro
import type { ThemeToggleProps } from '../model/types';

interface Props extends ThemeToggleProps {}
---

<button id="theme-toggle" aria-label="Toggle theme">
	<!-- UI here -->
</button>

<script>
	// Client-side logic
	const themeToggle = document.getElementById('theme-toggle');

	themeToggle?.addEventListener('click', () => {
		const theme = localStorage.getItem('theme') === 'dark' ? 'light' : 'dark';
		localStorage.setItem('theme', theme);
		document.documentElement.classList.toggle('dark');
	});
</script>

<style>
	/* Styles */
</style>
```

### Widget Component Template

```astro
---
// widgets/header/ui/Header.astro
import { ThemeToggle } from '@features/theme-toggle';
import { LanguagePicker } from '@features/language-picker';
import { getI18N } from '@shared/lib/i18n';

const { currentLocale } = Astro;
const i18n = getI18N({ currentLocale });
---

<header>
	<nav>
		<!-- Navigation -->
	</nav>
	<ThemeToggle />
	<LanguagePicker {currentLocale} />
</header>

<script>
	// Widget-specific client-side logic (e.g., mobile menu, scroll effects)
</script>

<style>
	/* Styles */
</style>
```

## Public API Patterns

### Simple Export (UI-only)

```typescript
// shared/ui/badge/index.ts
export { default as Badge } from './Badge.astro';
```

### Complex Export (with types and data)

```typescript
// entities/project/index.ts
export { PROJECTS } from './model/data';
export type { Project, ProjectsByLanguage } from './model/types';
export { getProjectById } from './lib/utils';
```

### Barrel Export (multiple components)

```typescript
// shared/ui/index.ts
export { default as Badge } from './badge';
export { default as LinkButton } from './link-button';
export { default as SectionContainer } from './section-container';
export { default as Avatar } from './avatar';
```

## i18n Integration

### In Entities

```typescript
// entities/experience/model/data.ts
import type { ExperienceKey } from './types';

export function getExperiences(t: (key: string) => string): Experience[] {
	const experienceKeys: ExperienceKey[] = ['work1', 'work2'];

	return experienceKeys.map(key => ({
		title: t(`experience.${key}.title`),
		company: t(`experience.${key}.company`),
		description: t(`experience.${key}.description`),
	}));
}
```

### In Widgets

```astro
---
// widgets/hero/ui/Hero.astro
import { getI18N } from '@shared/lib/i18n';

const { currentLocale } = Astro;
const i18n = getI18N({ currentLocale });
---

<section>
	<h1>{i18n.SEO_TITLE}</h1>
	<p>{i18n.SEO_DESCRIPTION}</p>
</section>
```

## Image Handling

### Local Images (optimized by Astro)

```astro
---
import { Image } from 'astro:assets';
import profileImage from '@shared/assets/profile.jpg';
---

<Image src={profileImage} alt="Profile" width={200} height={200} loading="lazy" />
```

### Dynamic Images from Props

```astro
---
import type { ImageMetadata } from 'astro';

interface Props {
	icon: ImageMetadata;
	title: string;
}

const { icon, title } = Astro.props;
---

<img src={icon.src} alt={title} width="24" height="24" />
```

## Client-Side Scripts

### Widget with Multiple Instances

```astro
---
// features/theme-toggle/ui/ThemeToggle.astro
const uniqueId = `theme-toggle-${Math.random().toString(36).substr(2, 9)}`;
---

<button id={uniqueId} class="theme-toggle-btn"> Toggle Theme </button>

<script>
	// Use class selector for multiple instances
	document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
		btn.addEventListener('click', () => {
			// Logic here
		});
	});
</script>
```

### Widget with Singleton Pattern

```astro
---
// widgets/header/ui/Header.astro
---

<header id="main-header">
	<!-- Content -->
</header>

<script>
	const header = document.getElementById('main-header');

	// IntersectionObserver for scroll effects
	const observer = new IntersectionObserver(entries => {
		entries.forEach(entry => {
			if (!entry.isIntersecting) {
				header?.classList.add('scrolled');
			}
		});
	});

	observer.observe(document.body);
</script>
```

## TypeScript Best Practices

### Extending HTML Attributes

```typescript
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'button'> {
	variant?: 'primary' | 'secondary';
	size?: 'sm' | 'md' | 'lg';
}
```

### Using class:list

```astro
---
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'div'> {
	variant?: 'primary' | 'secondary';
}

const { class: className, variant = 'primary', ...rest } = Astro.props;
---

<div
	class:list={[
		'base-class',
		variant === 'primary' && 'primary-variant',
		variant === 'secondary' && 'secondary-variant',
		className,
	]}
	{...rest}
>
	<slot />
</div>
```

## Common Patterns

### Internal Components in Widgets

```
widgets/
└── experience/
    ├── ui/
    │   ├── Experience.astro       # Main widget (exported)
    │   └── components/
    │       └── ExperienceItem.astro  # Internal only
    └── index.ts                   # Only exports Experience
```

```typescript
// widgets/experience/index.ts
export { default as Experience } from './ui/Experience.astro';
// ExperienceItem is NOT exported - internal use only
```

### Data with i18n

```typescript
// entities/badge/model/data.ts
import type { BadgesByLanguage } from './types';

export const BADGES: BadgesByLanguage = {
	es: [{ id: 'badge-1', title: 'Badge ES' }],
	en: [{ id: 'badge-1', title: 'Badge EN' }],
};
```

### Shared Configuration

```typescript
// shared/config/site.ts
export const SITE_CONFIG = {
	title: 'Portfolio',
	description: 'My portfolio website',
	author: 'Developer Name',
	social: {
		github: 'https://github.com/user',
		linkedin: 'https://linkedin.com/in/user',
	},
};
```

```typescript
// shared/config/index.ts
export { SITE_CONFIG } from './site';
export { I18N_CONFIG } from './i18n';
```
