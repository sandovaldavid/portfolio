---
translationKey: v1-2-0-beta
title: 'v1.2.0-beta — Sprint 2: i18n & SEO'
summary: 'Bilingual English/Spanish support, hero section internationalization, FSD refactor, hreflang tags, and axe-core accessibility scans.'
pubDate: 2026-06-21
version: '1.2.0-beta'
tags: ['sprint']
---

## Sprint 2 (June 19-21)

Major milestone: full internationalization and structural refactor.

## Completed

- **P1-1**: Migrated to Astro 6 Fonts API for automatic font loading
- **P1-5**: Internationalized hero section (EN/ES)
- **P1-4**: Translated all 'big-tech' content (experience, projects, about)
- **P2-1/2/3/4**: FSD migration: path aliases (@/ @app/ @widgets/ etc.), PascalCase components, widget slice extraction, hreflang for SEO
- **P1-3**: Automated axe-core accessibility scans with serious/critical gate

## Infrastructure

- 8 PRs merged, all with CI validation
- Added `getStaticPaths()` for dynamic i18n routing
- ESLint + Prettier enforced on every commit via pre-commit hooks
