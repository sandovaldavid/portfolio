# Avatar component

## Purpose

`Avatar` is a generic Shared UI component for local or remote profile images. It owns rendering, dimensions and presentation only; localized alternative text must be resolved by the feature, widget or page that consumes it.

## Location

```text
src/shared/ui/avatar/Avatar.astro
```

## Props

| Prop    | Type                                                   | Default | Required | Description                                          |
| ------- | ------------------------------------------------------ | ------: | :------: | ---------------------------------------------------- |
| `src`   | `string`                                               |       — |   Yes    | Local path or remote image URL                       |
| `alt`   | `string`                                               |       — |   Yes    | Accessible alternative text supplied by the consumer |
| `size`  | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'responsive'` |  `'md'` |    No    | Supported semantic size                              |
| `class` | `string`                                               |       — |    No    | Additional utility classes                           |

## Size reference

| Size         | Base dimensions | Typical use                            |
| ------------ | --------------: | -------------------------------------- |
| `xs`         |      32 × 32 px | Dense lists and compact controls       |
| `sm`         |      48 × 48 px | Cards and secondary identity           |
| `md`         |      96 × 96 px | Default profile presentation           |
| `lg`         |    192 × 192 px | Prominent profile sections             |
| `xl`         |    256 × 256 px | Large profile views                    |
| `responsive` |      Responsive | Layout-controlled profile presentation |

## Basic usage

```astro
---
import { Avatar } from '@shared/ui';
---

<Avatar src="/profile/perfil.webp" alt="David Sandoval" size="lg" />
```

## Localized usage

Resolve the locale in the upper layer and pass the final scalar string to `Avatar`:

```astro
---
import { createScopedUiTranslator, getLanguageFromLocale } from '@shared/config/i18n';
import { interpolate } from '@shared/lib/i18n';
import { Avatar } from '@shared/ui';

const lang = getLanguageFromLocale(Astro.currentLocale);
const tAccessibility = createScopedUiTranslator(lang, 'accessibility');
const alt = interpolate(tAccessibility('profileImageAlt'), { name: 'David Sandoval' });
---

<Avatar src="/profile/perfil.webp" {alt} size="lg" />
```

The owning catalog module must contain the mirrored English and Spanish scalar key. `Avatar` must not import locale files or create its own translator.

## Image behavior

- Local paths (`/`, `./`, `../`) use Astro's `<Image>` component.
- Remote URLs use a standard `<img>` element.
- Explicit dimensions and a square aspect ratio prevent layout shift.
- The component uses the portfolio's square retro border and shadow treatment.

## Accessibility

- `alt` is required.
- Decorative avatars should receive an intentionally empty `alt` from the caller.
- Consumer code owns the correct localized description and any dynamic interpolation.

## FSD contract

- Layer: `shared/ui`.
- No domain or user-specific data ownership.
- No direct i18n catalog imports.
- No business logic.
- Exported through `src/shared/ui/index.ts`.

## Anti-patterns

Do not hardcode portfolio identity or localized copy inside the shared component:

```astro
<!-- Wrong: shared component owns domain copy -->
<img alt="David Sandoval - Software Engineer" />
```

Pass resolved data from an upper layer instead:

```astro
<Avatar src={profileImage} alt={localizedAlt} />
```
