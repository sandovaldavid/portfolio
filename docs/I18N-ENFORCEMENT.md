# Internationalization enforcement

This document owns the executable quality gates for the localization architecture defined in [I18N.md](I18N.md). It documents checks, exact exceptions and contributor diagnostics; it does not redefine content ownership.

## Commands

```bash
bun run check:i18n:catalogs
bun run check:i18n:content
bun run check:i18n:hardcoded
bun run check:i18n

bun run build
bun run check:i18n:routes
bun run test:e2e:smoke
```

`bun run check` includes the source-level catalog, content and hardcoded-copy gates. `bun run check:links` validates generated links and locale routes against fresh `dist` output after `bun run build`.

## Catalog enforcement

`scripts/i18n/check-catalogs.mjs` validates mirrored modules below `src/shared/config/i18n/locales/{locale}/`.

It rejects:

- unsupported locale directories;
- modules present in only one locale;
- case-insensitive module-path collisions;
- duplicate JSON keys;
- missing English or Spanish keys;
- empty values;
- non-scalar leaf values;
- HTML inside catalog strings;
- modules not registered by `catalog.ts`.

Diagnostics identify the locale module, key and source line when available.

## Structured and editorial content enforcement

`scripts/i18n/check-content.mjs` complements Astro Content Collection schemas.

For profile, experience, research and projects it verifies:

- only supported locale directories exist;
- each entry locale matches its directory;
- stable IDs use lowercase kebab-case;
- identities are unique inside a locale;
- every required stable ID has English and Spanish counterparts.

For blog and devlog it verifies:

- every entry has a valid `translationKey`;
- translation identities are unique per locale;
- missing counterparts are rejected unless explicitly documented as intentionally single-language.

The current editorial exception is the unpublished English `draft-rss-test` fixture. Exceptions require an exact collection/key and concrete reason; stale entries fail.

## Hardcoded-copy enforcement

`scripts/i18n/check-hardcoded.mjs` scans production `.astro`, `.ts` and `.tsx` files outside canonical locale catalogs, content entries and assets.

It rejects:

- literal visible phrases;
- literal user-facing accessibility attributes;
- literal DOM text and accessibility sinks;
- local bilingual `copy`, `labels`, `messages` or `translations` maps;
- locale ternaries selecting complete messages.

The scanner intentionally ignores URLs, locale metadata such as `en_US`, CSS classes, source-code commands and single-token technical identities.

### Exact intentional allowlist

`scripts/i18n/config.mjs` may allow only an exact `file` + `value` entry with a non-empty reason. It is reserved for proper names, official product/company names and genuinely decorative non-linguistic values.

Broad directory exclusions, generic regular expressions and unexplained phrases are prohibited. Stale entries fail. Real UI copy must move to its catalog or Content Collection.

There is no migration-debt baseline. Every detected hardcoded phrase fails immediately.

## Legacy-runtime absence

`tests/unit/i18n/legacy-removal.spec.ts` protects the final architecture by asserting that production does not contain or expose:

- monolithic `locales/en.json` or `locales/es.json` files;
- flattened dictionary modules;
- `useTranslations()` or `useTranslationsList()`;
- mixed scalar/array translation contracts;
- `getLangFromUrl()` or `getLocalizedPath()`;
- direct locale JSON imports outside `catalog.ts`.

Do not replace a removed compatibility path with another adapter.

## Generated-route enforcement

`scripts/i18n/check-routes.mjs` reads built HTML from `dist` and verifies:

- the representative bilingual route matrix exists;
- `404.html` exists;
- `<html lang>` matches each route;
- canonical URLs are self-referential;
- every emitted `hreflang` target exists;
- `x-default` resolves to the verified English route;
- every rendered language-picker target exists;
- Spanish pages exclude the versioned English-only phrase policy.

The matrix includes home, About, Atena, Components, Research, Skills, projects, project detail, blog, blog detail, devlog and devlog detail. Missing editorial counterparts remain valid only when the UI renders them unavailable and omits fabricated alternates.

## Browser regression matrix

`tests/e2e/i18n-enforcement.spec.ts` runs through `bun run test:e2e:smoke` against the production preview.

It validates:

- active locale and route response;
- self-referential canonical URLs;
- English, Spanish and `x-default` alternates;
- language-picker targets;
- known English-only phrases absent from Spanish output;
- localized static 404 behavior;
- localized headings and no cross-language presentation on the former Atena, Skills and Components legacy route pairs.

## Contributor workflow

When changing localized content or routes:

1. update the canonical English and Spanish owners together;
2. run the focused source gate;
3. run `bun run check` and `bun run test:unit:ci`;
4. run `bun run build` and `bun run check:links`;
5. run `bun run test:e2e:smoke`;
6. inspect the complete diff and generated route behavior.

Do not bypass a failure with a broad allowlist, fallback locale or replacement compatibility runtime. A useful diagnostic identifies the file and missing locale, namespace, key, stable ID, route or prohibited literal.
