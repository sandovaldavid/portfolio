# Portfolio Retro color inventory

This document owns the current production inventory for the `portfolio-v1` color architecture. Figma remains the authority for designed intent; `src/app/styles/colors.css` is the authority for implemented behavior; Cortex-L7 owns durable decisions, investigation history and handoffs.

## Canonical architecture

```text
Figma sRGB reference + documented canonical OKLCH
  -> production OKLCH primitive
    -> shared semantic alias
      -> Portfolio channel alias
        -> component role or maintained utility
          -> Astro and TypeScript consumer
```

Production primitives use the canonical OKLCH values copied from the Figma Identity System in its documented sRGB working gamut. The hexadecimal values in comments and tests are provenance references, not an alternative production palette.

## Portfolio channel contract

| Responsibility      | Canonical roles                                                                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Canvas and surfaces | `channel-background-canvas`, `channel-surface-default`, `channel-surface-highlight`                                                                             |
| Content             | `channel-content-strong`, `channel-content-default`, `channel-content-muted`                                                                                    |
| Edges               | `channel-edge-default`, `channel-edge-subtle`                                                                                                                   |
| Accents             | `channel-accent-primary`, `channel-accent-primary-hover`, `channel-accent-secondary`                                                                            |
| Status              | `channel-status-online`, `channel-status-success`, `channel-status-warning`, `channel-status-error`                                                             |
| Terminal            | `channel-portfolio-terminal-background`, `surface`, `surface-raised`, `content`, `content-muted`, `cyan`, `cyan-bright`, `phosphor`, `grid`, `warning`, `error` |
| Components          | `button-*`, `logo-*`, `theme-*`, header effect roles and `shadow-retro-*`                                                                                       |

The cyan terminal values alias the dark-mode Identity Core primary primitives. Phosphor is a scoped Figma primitive for terminal and online-state expression. Neither creates a second brand palette.

## Production inventory

| Classification          | Location                                                                     | Previous usage                                                       | Current contract                                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `Migrated`              | `src/app/styles/colors.css`                                                  | HEX ramps, incomplete semantic layer and no Channel Theme layer      | Figma-derived OKLCH primitives, semantic aliases, Portfolio channel aliases, component roles and compatibility aliases   |
| `Migrated`              | `src/shared/ui/button/button.css`                                            | Primary ramp utilities and literal offset shadows                    | Button component roles and `--shadow-retro-*`; light/dark default and hover pairs are contrast-gated                     |
| `Migrated`              | `src/widgets/header/ui/BrandLogo.astro`                                      | Primary ramp utilities and literal glitch colors                     | Logo roles; approved dark bracket base maps to Identity Core `primary-400-light`; reduced-motion fallback retained       |
| `Migrated`              | `src/widgets/header/ui/Header.astro`                                         | Raw RGB/RGBA scroll effects and direct active-link ramp class        | Header effect tokens and channel accent role                                                                             |
| `Migrated`              | `src/app/layouts/Layout.astro`                                               | Stale non-canonical `theme-color` metadata literal                   | Removed duplicate metadata color so browser chrome no longer owns an ungoverned palette value                            |
| `Migrated`              | `src/widgets/recruiter-hud/ui/RecruiterHUD.astro`                            | Primary/neutral ramp utilities                                       | Button, channel surface, content and edge roles                                                                          |
| `Migrated`              | `src/features/theme-toggle/ui/ThemeToggle.astro`                             | Neutral ramp utilities                                               | Theme component roles and channel content roles                                                                          |
| `Migrated`              | `src/features/splash-screen/ui/SplashScreen.astro`                           | Terminal literals and primary ramp hover                             | Named terminal and button roles                                                                                          |
| `Migrated`              | `src/features/cli-terminal/ui/CLITerminalCatalog.astro`                      | Terminal literals, raw status utilities and literal glow             | Named terminal/status roles and `--shadow-terminal-glow`                                                                 |
| `Migrated`              | `src/features/cli-terminal/model/runtime.ts`                                 | Dynamically generated raw color utilities                            | Static named terminal/status utilities                                                                                   |
| `Migrated`              | `src/pages/404.astro`                                                        | Neutral canvas and primary ramp composition                          | Portfolio channel canvas and accent aliases                                                                              |
| `Intentional exception` | `src/assets/**`                                                              | Vendor-owned or exported artwork colors                              | Preserve source artwork fidelity; assets are not component token APIs                                                    |
| `Intentional exception` | `src/app/styles/print.css`                                                   | Black/white print-output literals                                    | Preserve deterministic print output; excluded from runtime color-token enforcement                                       |
| `Historical`            | Frozen audit and report records                                              | Point-in-time literals and findings                                  | Preserve as evidence; do not treat as current implementation guidance                                                    |
| `Follow-up`             | Remaining governed ramp utilities in low-risk editorial/decorative consumers | Direct Tailwind ramp utilities backed by the canonical primitive map | Migrate opportunistically to narrower roles when the owning component changes; do not broaden issue #186 into a redesign |

## Provenance and duplicate policy

Every production primitive in `colors.css` includes its approved sRGB reference beside the canonical OKLCH authoring value. Automated unit tests assert the full primitive map, layer order, unique custom-property declarations and the absence of raw HEX/RGB/HSL/OKLCH literals in runtime consumers.

The only equal primitive value retained intentionally is Figma's separate `color/retro/phosphor` and `color/terminal/success` provenance. Consumer code still reaches these through semantic or channel aliases.

## Contrast contract

The primary interactive pairs are fixed at:

- Light default: `#0A5CD6` with white content, above WCAG AA for normal text.
- Light hover: `#0044CC` with white content, above WCAG AA for normal text.
- Dark default: `#00B0FF` with `#020408` content, above WCAG AA for normal text.
- Dark hover: `#00D8FF` with `#020408` content, above WCAG AA for normal text.

Text-bearing elements must preserve accessible computed contrast throughout their complete rendered state. Do not animate opacity on an entire text badge; animate a separate decorative indicator instead. Small terminal metadata uses full cyan or the `channel-portfolio-terminal-content-muted` role rather than opacity modifiers.

Unit tests validate the reference contrast ratios. Browser tests compare computed component colors against resolved CSS custom properties in English/light and Spanish/dark routes, avoiding assumptions about whether a browser serializes OKLCH as `oklch()` or `rgb()`.

## Validation and evidence

Run:

```bash
bun run check
bun run test:unit:ci
bun run build
bun run test:e2e:smoke
bun run screenshots:design-system
```

The pull-request workflow builds the exact base and head revisions and uploads a `portfolio-retro-color-evidence` before/after artifact for:

- English light desktop home;
- Spanish dark desktop home;
- English dark mobile home;
- light 404;
- dark CLI terminal;
- dark retro splash.

The smoke suite also verifies resolved roles, button hover contrast behavior, terminal keyboard behavior, splash dismissal, mobile focus handling, English/Spanish routes and serious/critical Axe violations. Existing `focus-visible` and `prefers-reduced-motion` behavior remains mandatory. Scrollable terminal output remains keyboard-focusable because an `aria-live` region does not by itself provide Safari keyboard access.

## Change rule

Before adding a color to a component:

1. reuse an existing component role;
2. otherwise reuse a Portfolio channel alias;
3. otherwise reuse a shared semantic role;
4. add a primitive only when Figma defines the approved visual value and no current primitive represents it;
5. copy the documented canonical OKLCH value rather than converting it independently;
6. document every remaining exception in this inventory.
