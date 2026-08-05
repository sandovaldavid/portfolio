# Brand asset synchronization

The active repository and package name are `sandovaldavid/portfolio` and `portfolio`.
The historical name `portfolio-v1` still appears in older Identity System and repository
history. It is not treated as the current project name, but it remains documented as
provenance instead of being silently rewritten.

## Sources of truth

- Figma file: `David Sandoval Brand Identity System`
- File key: `sHPP8DGCfZ370Oc2oKGNPH`
- Logo usage: node `6:7`
- Logo components: node `6:8`
- Color System: node `6:4`
- Typography: node `6:5`

## Export mapping

- `public/brand/logo-primary-light.svg`: Primary Light, node `15:2`.
- `public/brand/logo-primary-dark.svg`: Primary Dark, node `16:2`.
- `public/brand/project-mark-light.svg`: Project Mark / Square / Light, node `19:24`.
- `public/brand/project-mark-dark.svg`: Project Mark / Square / Dark, node `19:35`.
- `public/brand/favicon-16-light.svg`: Favicon / 16 / Light, node `20:38`.
- `public/brand/favicon-16-dark.svg`: Favicon / 16 / Dark, node `20:49`.
- `public/brand/favicon-32-light.svg`: Favicon / 32 / Light, node `20:60`.
- `public/brand/favicon-32-dark.svg`: Favicon / 32 / Dark, node `20:71`.
- `public/brand/favicon-64-light.svg`: Favicon / 64 / Light, node `20:82`.
- `public/brand/favicon-64-dark.svg`: Favicon / 64 / Dark, node `20:93`.
- `public/brand/watermark-light.svg`: Watermark Light, node `21:95`.
- `public/brand/watermark-dark.svg`: Watermark Dark, node `21:106`.

`public/favicon.svg` preserves the approved 64 px geometry and resolves the light or dark
palette using `prefers-color-scheme`. `public/favicon.ico` is the legacy browser fallback.
The prerendered PNG app icons are raster derivatives of the approved square project mark.

The Open Graph cards are prerendered channel derivatives because the Identity System currently
has no dedicated Open Graph component. They preserve the approved logo geometry, JetBrains Mono
name hierarchy, Silkscreen label role, and canonical light/dark colors. The dark card is the
stable default metadata image because the portfolio currently defaults to dark mode; the light
card remains available for channels that require a light surface.

## Typography contract

- Inter 400/500: body, secondary text, and captions.
- JetBrains Mono 500/700: subheadings, page titles, and the hero display name.
- Fira Code 400: code-oriented editorial content.
- Press Start 2P, VT323, and Share Tech Mono: scoped Portfolio Retro theme roles.
- Silkscreen 400/700: controlled editorial labels.

Critical local faces use `font-display: swap`. The hero name uses JetBrains Mono 700 with the
Identity System display proportions: 72 px at the large breakpoint, 80 px line height, and
approximately -2 px tracking.

The UI color implementation remains in `src/app/styles/colors.css`. Its OKLCH primitives and
semantic/channel aliases match the approved Figma references. Raster generation uses the
immutable sRGB export snapshot in `src/assets/brand/export-palette.ts`; that file is governed
artwork data for OG/PWA rendering, not an alternative UI token system.
