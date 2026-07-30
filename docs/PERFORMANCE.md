# Performance budgets

The portfolio protects user-facing performance with deterministic route-level budgets and Lighthouse audits. The repository does not use total `dist/` size as a user-experience proxy.

## Representative routes

The gate covers equivalent English and Spanish recruiter journeys:

- `/` and `/es/` — landing and selected evidence;
- `/about` and `/es/about` — professional background;
- `/projects` and `/es/projects` — project evidence;
- `/blog` and `/es/blog` — long-form engineering content.

Lighthouse additionally audits representative article detail pages through `config/lighthouse/lighthouserc.json`.

## Measured metrics

`bun run performance:check` reads generated HTML from `dist/` and measures assets referenced directly by each route:

- **JavaScript parsed bytes:** uncompressed emitted JavaScript, which approximates parser/compile work.
- **JavaScript transfer bytes:** deterministic gzip size of those scripts.
- **CSS transfer bytes:** deterministic gzip size of route stylesheets.
- **Largest image:** the largest directly referenced image or image preload.
- **Font preload count:** explicit `font` preloads in route HTML.
- **Critical request count:** the HTML document plus unique scripts, stylesheets, font preloads and images.

The thresholds live in `config/performance-budgets.json`. Reports are written to `performance-report/route-budgets.json` and `performance-report/route-budgets.md` and uploaded by CI.

These are build-artifact measurements, not field telemetry. Gzip estimates are reproducible across CI runs but do not claim exact CDN transfer bytes. Lighthouse remains the browser-level performance gate.

## Baseline and policy

The initial baseline was derived from the final green build of PR #122. Budgets include a small explicit margin above the measured values:

- JavaScript parsed: 36 KiB per representative route;
- JavaScript gzip: 12 KiB;
- CSS gzip: 22 KiB;
- one font preload;
- route-specific image and request limits.

A budget increase requires an explanation in the pull request. Update the threshold only after identifying the asset responsible and confirming that the added cost is justified.

## Resource-loading decisions

### Selective prefetch

Global `prefetchAll` is disabled. Only the likely recruiter journey is marked with `data-astro-prefetch="hover"`: selected work, blog and about. Experience and research anchors do not trigger speculative route fetches. Playwright verifies the policy in English and Spanish.

### Fonts

All five self-hosted families remain because each has active UI usage:

- Press Start 2P — occasional display accents;
- VT323 — primary headings and brand display;
- Silkscreen — tags and retro metadata;
- Share Tech Mono — gaming-style supporting text;
- JetBrains Mono — body and interface copy.

Only VT323 is preloaded because it appears immediately in headings and the brand. Other fonts use `font-display: swap` and load when their rendered content requires them.

### Bundle visualization

Normal builds do not create a Rollup treemap. Run the explicit audit command when investigating composition:

```bash
bun run bundle:visualize
```

The scheduled audit enables the same `ANALYZE_BUNDLE=true` path. `bun run bundle:analyze` remains an informational emitted-file inventory; route budgets are the blocking performance gate.
