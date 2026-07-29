---
translationKey: v1-0-0-launch
title: 'v1.0.0 — Portfolio Launch & Audit'
summary: 'Initial production release after a 70+ page audit covering accessibility, performance, SEO, bundle size, and architecture. Complete site rebuild with Astro 5, Tailwind 4, and FSD architecture.'
pubDate: 2026-06-15
version: '1.0.0'
tags: ['release']
---

## Overview

The portfolio launched on June 15, 2026 after a comprehensive 70+ page audit spanning accessibility (axe-core scans), performance (Lighthouse CI), SEO (structured data audit), and code architecture (FSD compliance).

## Key Changes

- **Framework migration**: Updated from prior Astro version to Astro 5 with full TypeScript strict mode
- **Architecture**: Migrated to Feature-Sliced Design (FSD) with proper layer hierarchy enforcing import direction
- **Styling**: Adopted Tailwind CSS 4 with @tailwindcss/vite integration
- **Theming**: Implemented light/dark/system theme with light-dark() CSS function
- **Accessibility**: Added skip-link, keyboard navigation, WCAG 2.1 AA compliance, reduced-motion support
- **Fonts**: Migrated to Astro Font API with retro pixel font stack (Press Start 2P, VT323, Silkscreen)
- **CI/CD**: Added Lighthouse CI, Playwright E2E, CodeQL, bundle analysis, and Vercel deployment pipelines
