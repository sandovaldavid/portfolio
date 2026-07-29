---
translationKey: phase-3-complete
title: 'v1.4.0-beta — Phase 3: Backlog Complete'
summary: 'SVGO optimization, structured data (BreadcrumbList/ScholarlyArticle), spacing design tokens, print stylesheet, image optimization, project case studies, and developer devlog.'
pubDate: 2026-06-28
version: '1.4.0-beta'
tags: ['release', 'sprint']
---

## Phase 3 (June 28)

Final phase of the initial audit backlog: performance optimization, content enrichment, and documentation.

## Completed

- **P3-5**: Enabled svgoOptimizer for future SVG assets
- **P3-6**: Auto-generated BreadcrumbList JSON-LD on all inner pages; ScholarlyArticle on research pages
- **P3-4**: CSP: cancelled — incompatible with Astro ClientRouter for View Transitions
- **P3-7**: Added pixel-grid spacing tokens (--space-1 through --space-24), retro shadow scale, and print stylesheet for clean resume output
- **P3-1**: Project case study pages (boss-fight themed) with dedicated [slug] routes per project
- **P3-2**: Devlog (patch notes) with version history entries

## Image Optimization

- project-09-fluentreads: 912K → 42K (-95%)
- project-08-campus-map: 336K PNG → 26K WebP (-92%)
- project-10-MAD-AI: 181K → 34K (-81%)
- Total dist: 3.8M → 2.4M
