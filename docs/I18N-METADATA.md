# Localized metadata and accessibility contract

This document defines how localized routes expose SEO, social, RSS, structured-data and assistive metadata. It extends the ownership rules in [I18N.md](I18N.md) without changing the routing contract.

## Ownership

Metadata has the same single-owner rule as visible content.

| Metadata category                                                            | Canonical owner                                         |
| ---------------------------------------------------------------------------- | ------------------------------------------------------- |
| Site-wide title, description, person role/description and RSS discovery copy | `src/shared/config/i18n/locales/{locale}/metadata.json` |
| Reusable accessible names and image alternatives                             | granular UI catalogs such as `accessibility.json`       |
| Profile page title and description                                           | `portfolio-profile` content entry                       |
| Project title, description and image alternative                             | localized project content entry                         |
| Blog/devlog title, summary, dates and tags                                   | localized editorial entry                               |
| URLs, social profiles, email and technology identifiers                      | language-neutral `siteConfig` or entity metadata        |
| Canonical, alternate, Open Graph, Twitter and JSON-LD assembly               | `src/app/layouts/Layout.astro`                          |

Do not duplicate localized title or description text in `siteConfig`. Brand names, repository URLs, technologies and stable IDs remain language-neutral.

## Layout page types

Routes identify their semantic family through the typed `pageType` layout property:

| `pageType` | JSON-LD type         | Typical owner          |
| ---------- | -------------------- | ---------------------- |
| `website`  | `WebSite` only       | ordinary static route  |
| `profile`  | `ProfilePage`        | About/profile content  |
| `project`  | `SoftwareSourceCode` | project content entry  |
| `blog`     | `BlogPosting`        | blog entry             |
| `devlog`   | `TechArticle`        | devlog entry           |
| `research` | `ScholarlyArticle`   | research route/content |

Dynamic routes pass their canonical localized content title as `breadcrumbLabel`. `Layout.astro` reuses that value for JSON-LD `name` and article `headline`, while the separate `title` prop remains free to include SEO suffixes such as the content family and author name. This prevents machine-readable content titles from inheriting presentation-only title decorations without duplicating the localized value.

Project routes pass `project.imageAlt`; editorial routes pass the entry title as the social image alternative. Blog and devlog routes pass publication dates, and blog routes pass an optional modification date.

## Canonical and alternate URLs

- The canonical URL is self-referential and uses the current localized pathname.
- `hreflang="en"`, `hreflang="es"` and `x-default` are emitted only for routes present in the verified localized path map.
- English remains unprefixed and Spanish remains below `/es`.
- `og:locale:alternate` is emitted only when an actual counterpart exists.
- Link checks and browser tests request representative alternate targets and reject broken routes.

## Open Graph and Twitter

Every route emits localized:

- title and description;
- image alternative text;
- `og:locale` and, when available, `og:locale:alternate`;
- matching Twitter title, description, image and image alternative.

Article families additionally emit publication and modification timestamps when the owning content provides them.

## Structured data

All structured page schemas include:

- the active `inLanguage` value;
- a self-referential URL and `@id`;
- localized name and description;
- a stable reference to the shared `Person` entity;
- an image object with a localized caption where applicable.

The shared `Person` and `WebSite` schemas use localized descriptions and job titles from the metadata catalog. Proper names, official technologies, profile URLs and country codes are not translated.

## RSS

The English and Spanish feeds use the `metadata` catalog for feed title and description. Each feed declares its language explicitly:

- `/rss.xml` contains `<language>en</language>` and English entries;
- `/es/rss.xml` contains `<language>es</language>` and Spanish entries.

Every HTML page advertises both feeds with localized discovery titles and explicit `hreflang` values.

## Accessibility

Visible and non-visible strings follow the same locale source. This includes:

- skip links;
- navigation/dialog/control labels;
- social and project image alternatives;
- mailto subject text;
- screen-reader-only status text.

The recruiter HUD and CLI terminal use the localized `recruiter.emailSubject` value rather than an English-only `siteConfig` field.

## Regression coverage

- `tests/unit/i18n/metadata.spec.ts` enforces ownership and route contracts.
- `tests/e2e/metadata-localization.spec.ts` validates built English/Spanish metadata, canonical and alternate URLs, accessible text, JSON-LD families and RSS separation.
- The metadata browser suite is part of `bun run test:e2e:smoke`.

Run the canonical implementation gates from [TESTING.md](TESTING.md) before merging.
