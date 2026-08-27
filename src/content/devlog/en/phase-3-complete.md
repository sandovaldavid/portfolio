---
translationKey: phase-3-complete
title: 'v1.4.0-beta — Phase 3: Backlog Complete'
summary: 'SVGO optimization, structured data (BreadcrumbList/ScholarlyArticle), spacing tokens, print styles, image optimization, project case studies and the developer devlog.'
pubDate: 2026-06-28
version: '1.4.0-beta'
tags: ['release', 'sprint']
---

## Phase 3 (June 28)

The final phase of the initial improvement backlog focused on performance, richer project content and documentation.

## Completed

- **P3-5**: Enabled svgoOptimizer for future SVG assets
- **P3-6**: Auto-generated BreadcrumbList JSON-LD on all inner pages; ScholarlyArticle on research pages
- **P3-4**: CSP work was deferred because the proposed setup conflicted with Astro ClientRouter View Transitions
- **P3-7**: Added spacing tokens (--space-1 through --space-24), a legacy visual shadow scale and a print stylesheet for clean resume output
- **P3-1**: Added dedicated project case-study routes; the first version used a legacy game-inspired visual treatment that was later replaced as the identity evolved
- **P3-2**: Added the devlog with version-history entries

## Image Optimization

- project-09-fluentreads: 912K → 42K (-95%)
- project-08-campus-map: 336K PNG → 26K WebP (-92%)
- project-10-MAD-AI: 181K → 34K (-81%)
- Total dist: 3.8M → 2.4M
