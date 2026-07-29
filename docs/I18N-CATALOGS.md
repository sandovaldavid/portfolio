# Granular UI catalog implementation

This document describes the supported scalar UI catalog API. Ownership rules for all localized content remain in [I18N.md](I18N.md).

## Scope

The catalog owns short reusable strings and page presentation labels. It does not own domain records or long-form narrative.

- Profile, experience, research and projects use schema-validated localized Content Collections.
- Blog and devlog bodies remain localized editorial collections paired by `translationKey`.
- URLs, assets, ordering, feature flags and technology IDs remain language-neutral TypeScript data.
- There is no monolithic dictionary or mixed `string | string[]` translator.

## Mirrored module layout

```text
src/shared/config/i18n/locales/{locale}/
├── accessibility.json
├── breadcrumbs.json
├── cli.json
├── common.json
├── errors.json
├── footer.json
├── metadata.json
├── navigation.json
├── recruiter.json
├── splash.json
├── theme.json
├── pages/
│   ├── atena.json
│   ├── blog.json
│   ├── components.json
│   ├── devlog.json
│   ├── research.json
│   └── skills.json
└── sections/
    ├── about.json
    ├── badges.json
    ├── experience.json
    ├── hero.json
    ├── projects.json
    ├── research.json
    ├── tech-stack.json
    └── vision.json
```

English and Spanish must have identical module paths and key sets. Every leaf value is a non-empty plain string. The English catalog provides the inferred compile-time shape, and Spanish must satisfy that shape.

## Production consumers

Granular catalogs own presentation text for:

- desktop and mobile navigation;
- language, theme, recruiter and resume controls;
- accessibility labels, breadcrumbs and metadata;
- footer, contact sidebar, splash screen and 404 page;
- CLI terminal labels and runtime messages;
- home sections;
- project cards and case-study labels;
- blog and devlog indexes/details;
- Atena, Skills, Components and Research pages.

Components receive a locale or scoped namespace and own behavior, interpolation, markup and styling. They must not define a second English/Spanish message map.

Structured values are loaded separately through entity APIs. For example, `pages.research` owns headings and actions, while `@entities/research` owns the thesis narrative, metrics, pipeline and architecture records.

## Public API

`src/shared/config/i18n/catalog.ts` exports:

- `translateUi(locale, key)`;
- `createUiTranslator(locale)`;
- `getUiCatalog(locale)`;
- `getUiCatalogNamespace(locale, namespace)`;
- `createScopedUiTranslator(locale, namespace)`;
- `validateUiCatalogs()`;
- inferred catalog and scoped-key types;
- `MissingUiTranslationError`.

Example:

```ts
import { createScopedUiTranslator, Language } from '@shared/config/i18n';

const tBlog = createScopedUiTranslator(Language.SPANISH, 'pages.blog');
const heading = tBlog('heading');
```

Missing or empty values throw. The API never returns the requested key and never falls back from Spanish to English.

## Localized structured content

### Portfolio profile

```text
src/content/portfolio-profile/{en,es}/profile.json
```

Loaded through `@entities/profile`. The catalog retains only headings, controls and accessibility text.

### Experience

```text
src/content/experience/{en,es}/<experience-id>.json
```

Loaded through `@entities/experience` and joined to language-neutral metadata by `experienceId`. Atena detail pages reuse this source instead of maintaining page-local achievements.

### Research

```text
src/content/research/{en,es}/<research-id>.json
```

Loaded through `@entities/research`. Entries own narrative, metrics, pipeline steps, architecture and engineered features. `pages.research` owns only page labels, metadata and actions.

### Projects

```text
src/content/projects/{en,es}/<project-id>.json
```

Loaded through `@entities/project` and joined to language-neutral metadata by `projectId`.

### Editorial entries

```text
src/content/blog/{en,es}/<article>.mdx
src/content/devlog/{en,es}/<entry>.md
```

Bodies remain outside the UI catalog. Page chrome uses `pages.blog` and `pages.devlog`; translated counterparts are resolved through stable `translationKey` values.

## Adding a module or key

1. Choose one cohesive domain.
2. Add the same module path and semantic camelCase key to `en` and `es`.
3. Store a complete scalar string without HTML.
4. Import both modules into `catalog.ts`.
5. Register the namespace in `UI_CATALOG_MODULES`.
6. Resolve dynamic values in the consumer with the shared interpolation helper when necessary.
7. Run catalog, repository and browser gates.

```bash
bun run check:i18n:catalogs
bun run check
bun run test:unit:ci
bun run build
bun run check:links
bun run test:e2e:smoke
```

## Prohibited compatibility patterns

Do not add or restore:

- `locales/en.json` or `locales/es.json`;
- flattened dictionary exports;
- `useTranslations()` or `useTranslationsList()`;
- mixed scalar/array translation contracts;
- direct locale JSON imports outside `catalog.ts`;
- component-specific parallel translators;
- local bilingual copy maps.

The absence of these paths and symbols is protected by unit tests and the hardcoded-copy gate.
