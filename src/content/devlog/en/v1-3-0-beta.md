---
translationKey: v1-3-0-beta
title: 'v1.3.0-beta — Sprint 3: Experience & Polish'
summary: 'Display-font readability improvements, legacy transition effects, accessibility CI gates, component tests and release automation.'
pubDate: 2026-06-23
version: '1.3.0-beta'
tags: ['sprint']
---

## Sprint 3 (June 21-23)

Focused on user-experience polish and test coverage.

## Completed

- **P2-8**: Improved display-font readability by reserving Press Start 2P for headings and using JetBrains Mono for body text
- **P2-6**: Added a legacy scan-line View Transition effect, later superseded as the visual identity moved away from the original retro direction
- **P2-7**: Added an accessibility CI gate that blocks PRs when axe-core detects serious/critical violations
- **P3-3**: Added comprehensive component and visual tests (78 unit tests + E2E specs)

## Metrics

- 6 PRs merged, including baseline fixes and the 1.3.0-beta release
- 78 unit tests passing with 100% i18n coverage at the time of the release
- 4 E2E spec files covering critical user flows
- CI pipelines green for Validate PR, Lighthouse, CodeQL and Bundle Analysis at the time of the release
