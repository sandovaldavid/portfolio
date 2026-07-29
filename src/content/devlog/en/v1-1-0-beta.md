---
translationKey: v1-1-0-beta
title: 'v1.1.0-beta — Sprint 1: Foundations'
summary: 'Fixed theme FOUC, added reduced-motion support, skip-link navigation, status accessibility tokens, and performance baselines.'
pubDate: 2026-06-19
version: '1.1.0-beta'
tags: ['sprint']
---

## Sprint 1 (June 17-19)

First iteration sprint focusing on critical fixes from the audit.

## Completed

- **P0-1**: Fixed theme FOUC by injecting inline theme script before render
- **P0-3**: Added prefers-reduced-motion support (WCAG 2.3.3) disabling all animations
- **P1-2**: Implemented skip-link for keyboard-first navigation
- **P2-5**: Added semantic color tokens for status indicators (success/warning/error)
- **P0-2**: Established Lighthouse performance baselines at ≥90 across all categories

## Metrics

- 5 PRs merged
- First Lighthouse pass achieved ≥90 Performance, ≥95 Accessibility, ≥90 Best Practices
