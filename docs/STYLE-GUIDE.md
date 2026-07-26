# Portfolio visual and token guide

This document defines the maintained visual contract implemented by `portfolio-v1`. The portfolio is a Portfolio Retro channel of David Sandoval's personal Identity System; it is not a separate brand.

## Token ownership

`src/app/styles/colors.css` owns the production token graph:

```text
Identity Core primitives
  -> shared semantic roles
    -> Portfolio Retro channel aliases
      -> component roles and maintained utilities
        -> components
```

Use the narrowest stable role available. Components must not treat raw hexadecimal values or palette ramp steps as their public styling API.

## Typography

| Role                   | Token or utility         | Use                                         |
| ---------------------- | ------------------------ | ------------------------------------------- |
| Body and UI            | `font-sans`              | Default interface and long-form copy        |
| Terminal and code      | `font-mono`, `font-code` | CLI, source excerpts and technical metadata |
| Pixel display          | `font-pixel`             | Very short, high-emphasis labels only       |
| Pixel display, cleaner | `font-pixel-clean`       | Logo and compact retro headings             |
| Retro tag              | `font-retro-tag`         | Small editorial labels                      |
| Gaming mono            | `font-gaming-mono`       | Restricted decorative or terminal details   |

Pixel fonts are a channel treatment. They must not replace readable body typography or make David's identity depend on a game aesthetic.

## Color layers

### Identity Core primitives

The primary and neutral ramps remain implementation primitives. They represent reusable values, not direct component contracts.

### Shared semantic roles

- `semantic-background-canvas`
- `semantic-surface-default`, `semantic-surface-highlight`
- `semantic-content-strong`, `semantic-content-default`, `semantic-content-muted`
- `semantic-edge-default`, `semantic-edge-subtle`
- `semantic-accent-primary`, `semantic-accent-primary-hover`, `semantic-accent-secondary`
- `semantic-status-success`, `semantic-status-warning`, `semantic-status-error`

### Portfolio Retro channel aliases

Use these for channel-level composition:

- `channel-background-canvas`
- `channel-surface-default`, `channel-surface-highlight`
- `channel-content-strong`, `channel-content-default`, `channel-content-muted`
- `channel-edge-default`, `channel-edge-subtle`
- `channel-accent-primary`, `channel-accent-primary-hover`, `channel-accent-secondary`
- `channel-status-online`, `channel-status-success`, `channel-status-warning`, `channel-status-error`

The terminal family is explicitly namespaced under `channel-portfolio-terminal-*`. Cyan and phosphor values are restricted Portfolio Retro accents, not additional personal-brand primaries.

### Component roles

Reusable interactive components consume component roles such as:

- `button-primary-background`, `button-primary-background-hover`, `button-primary-content`;
- `button-secondary-background`, `button-secondary-background-hover`, `button-secondary-content`;
- `button-border`, `button-focus`;
- `logo-content`, `logo-primary`, `logo-primary-hover`, `logo-effect-*`;
- `theme-control-*`, `theme-menu-*`, `theme-option-*`.

## Primary buttons

The shared button implementation is `src/shared/ui/button/button.css`.

- Light hover: `#0044CC` with white content, approximately `7.78:1` contrast.
- Dark hover: `#7CC7FB` with `#020408` content, approximately `11.16:1` contrast.
- Offset depth uses `--shadow-retro-xs` through `--shadow-retro-3xl`; do not add literal `box-shadow` values to button variants.
- Focus uses the dedicated button focus role and preserves a visible offset from the current canvas.

## Logo

The header logo identifies David; it does not act as a separate mascot or product identity.

- Base content uses `logo-content`.
- Prompt/accent uses `logo-primary`.
- The approved dark logo base resolves to `#3B82F6`, not the previous `#1E40AF` ramp step.
- Glitch colors are isolated as logo effect roles.
- Typing, pulse and glitch effects must stop under `prefers-reduced-motion: reduce`.

## Surfaces, edges and status

Use channel surface/content/edge roles for ordinary panels and layout. Use status roles only when the color communicates state. Do not use a success or phosphor value as a generic decorative replacement for the primary accent.

The maintained compatibility utilities (`bg-surface`, `text-content-*`, `border-edge-*`) resolve through the channel aliases. New or substantially edited components should prefer the explicit `channel-*` or component roles.

## Terminal channel

The CLI and retro splash use the named terminal family:

- background and raised surfaces;
- content and muted content;
- cyan and bright cyan accents;
- phosphor status/output accent;
- warning and error states;
- terminal grid and glow effects.

Raw `#00B0FF`, `#00D8FF` and `#00FF88` values are allowed only in the governed primitive declarations or vendor-owned artwork. They are prohibited in terminal consumers.

## Retro shadows and spacing

Retro shadows use the `shadow-retro-*` utilities backed by tokenized hard offsets. The scale is intentional and should remain visually discrete rather than blurred.

Spacing follows the 4-pixel grid exposed through `--space-*`. Tailwind spacing utilities may be used when they align with that grid.

## Light and dark modes

The document root owns `color-scheme`. Every new component must be checked in:

- light mode;
- dark mode;
- English and Spanish routes;
- desktop and mobile widths;
- keyboard focus;
- reduced-motion mode when animation is present.

Do not assume a `dark:` override is sufficient when a named role already resolves the mode difference.

## Accessibility

- Normal text and interactive labels must meet WCAG AA contrast.
- Focus indicators must remain visible against the current canvas and surface.
- Color must not be the only carrier of status or action.
- Motion effects require a reduced-motion fallback.
- The PR smoke suite blocks serious and critical Axe violations.

## Inventory and exceptions

[Portfolio Retro color inventory](design-system/portfolio-retro-color-inventory.md) classifies migrated consumers, intentional vendor/asset exceptions, historical records and bounded follow-up work. Update that inventory whenever an exception is added, removed or reclassified.

## Validation

```bash
bun run check
bun run test:unit:ci
bun run build
bun run test:e2e:smoke
bun run screenshots:design-system
```

The pull-request workflow publishes before/after evidence from the exact base and head revisions. A missing or skipped run is not a passing visual validation.
