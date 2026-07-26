# Portfolio Retro color inventory

This document owns the production inventory for the `portfolio-v1` color architecture. It separates the reusable Identity Core from the Portfolio Retro channel and records every intentional exception that remains outside semantic aliases.

## Canonical architecture

```text
Identity Core primitives
  -> shared semantic roles
    -> Portfolio Retro channel aliases
      -> component roles and maintained utilities
        -> Astro and TypeScript consumers
```

`src/app/styles/colors.css` is the canonical implementation. Components must consume the narrowest stable role available. A raw ramp step or hexadecimal value is not a component API.

## Channel aliases

| Responsibility      | Canonical roles                                                                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Canvas and surfaces | `channel-background-canvas`, `channel-surface-default`, `channel-surface-highlight`                                                                             |
| Content             | `channel-content-strong`, `channel-content-default`, `channel-content-muted`                                                                                    |
| Edges               | `channel-edge-default`, `channel-edge-subtle`                                                                                                                   |
| Accents             | `channel-accent-primary`, `channel-accent-primary-hover`, `channel-accent-secondary`                                                                            |
| Status              | `channel-status-online`, `channel-status-success`, `channel-status-warning`, `channel-status-error`                                                             |
| Terminal            | `channel-portfolio-terminal-background`, `surface`, `surface-raised`, `content`, `content-muted`, `cyan`, `cyan-bright`, `phosphor`, `grid`, `warning`, `error` |
| Components          | `button-*`, `logo-*`, `theme-*`                                                                                                                                 |

`#00B0FF`, `#00D8FF` and `#00FF88` are governed Portfolio Retro primitives. The phosphor green remains a restricted terminal/status accent; it is not a second primary brand color.

## Production inventory

| Classification          | Location                                                                             | Previous usage                                             | Current contract                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `Migrated`              | `src/shared/ui/button/button.css`                                                    | Primary ramp utilities and literal offset shadows          | Button component roles and `--shadow-retro-*`                                            |
| `Migrated`              | `src/widgets/header/ui/BrandLogo.astro`                                              | Primary ramp utilities and literal glitch colors           | Logo roles; approved dark base `#3B82F6`; reduced-motion fallback                        |
| `Migrated`              | `src/widgets/recruiter-hud/ui/RecruiterHUD.astro`                                    | Primary/neutral ramp utilities                             | Button, channel surface, content and edge roles                                          |
| `Migrated`              | `src/features/theme-toggle/ui/ThemeToggle.astro`                                     | Neutral ramp utilities                                     | Theme component roles and channel content roles                                          |
| `Migrated`              | `src/features/splash-screen/ui/SplashScreen.astro`                                   | Terminal hex values and primary ramp hover                 | Named terminal and button roles                                                          |
| `Migrated`              | `src/features/cli-terminal/ui/CLITerminalCatalog.astro`                              | Terminal hex values, raw status utilities and literal glow | Named terminal/status roles and `--shadow-terminal-glow`                                 |
| `Migrated`              | `src/features/cli-terminal/model/runtime.ts`                                         | Dynamically generated raw color utilities                  | Static named terminal/status utilities                                                   |
| `Migrated`              | `src/pages/404.astro`                                                                | Neutral canvas and primary ramp composition                | Channel canvas and accent aliases                                                        |
| `Intentional exception` | `src/assets/technologies/React.astro` and other technology artwork                   | Vendor-owned brand colors such as React cyan               | Preserve source-brand fidelity; these values are asset content, not UI tokens            |
| `Intentional exception` | Image, illustration and Open Graph assets                                            | Embedded pixels or SVG artwork colors                      | Governed by the asset source; not converted into CSS component tokens                    |
| `Historical`            | `docs/reports/**` and frozen audit records                                           | Point-in-time raw values and findings                      | Preserve as evidence; do not treat as current implementation guidance                    |
| `Follow-up`             | Remaining decorative gradient combinations outside the migrated high-impact surfaces | Tailwind ramp composition with no content/status meaning   | Review only when the owning component changes; do not broaden issue #186 into a redesign |

## Contrast contract

The primary interactive hover pair is fixed at:

- Light mode: `#0044CC` with white content, approximately `7.78:1`.
- Dark mode: `#7CC7FB` with `#020408` content, approximately `11.16:1`.

Both exceed WCAG AA `4.5:1` for normal text. Automated unit and browser tests enforce the pair and verify the computed hover result in English/light and Spanish/dark routes.

## Validation and evidence

Run:

```bash
bun run check
bun run test:unit:ci
bun run build
bun run test:e2e:smoke
bun run screenshots:design-system
```

The pull-request workflow creates a `portfolio-retro-color-evidence` artifact containing before/after captures from the exact pull-request base and head for:

- English light desktop home;
- Spanish dark desktop home;
- English dark mobile home;
- light 404;
- dark CLI terminal;
- dark retro splash.

The smoke suite also verifies computed colors, contrast, terminal keyboard behavior, splash dismissal, English/Spanish routes and serious/critical Axe violations. Existing focus-visible and `prefers-reduced-motion` behavior remains mandatory.

## Change rule

Before adding a color to a component:

1. reuse an existing component role;
2. otherwise reuse a Portfolio Retro channel alias;
3. otherwise reuse a shared semantic role;
4. add a primitive only when no current primitive represents the approved visual value;
5. document every remaining exception in this inventory.
