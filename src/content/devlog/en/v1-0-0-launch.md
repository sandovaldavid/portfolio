---
translationKey: v1-0-0-launch
title: 'v1.0.0 — Portfolio Launch'
summary: 'Initial production release with accessibility, performance, SEO and architecture improvements, rebuilt with Astro 5, Tailwind 4 and Feature-Sliced Design.'
pubDate: 2026-06-15
version: '1.0.0'
tags: ['release']
---

## Overview

The portfolio launched on June 15, 2026 after a broad engineering review covering accessibility with axe-core, performance with Lighthouse CI, structured-data SEO and Feature-Sliced Design architecture.

## Key Changes

- **Framework migration**: Updated to Astro 5 with TypeScript strict mode
- **Architecture**: Migrated to Feature-Sliced Design (FSD) with layer boundaries and enforced import direction
- **Styling**: Adopted Tailwind CSS 4 with @tailwindcss/vite integration
- **Theming**: Implemented light/dark/system themes with the CSS `light-dark()` function
- **Accessibility**: Added skip-link, keyboard navigation, WCAG 2.1 AA checks and reduced-motion support
- **Fonts**: Adopted Astro Font API with a legacy display-font stack (Press Start 2P, VT323, Silkscreen) that was later refined as the identity evolved
- **CI/CD**: Added Lighthouse CI, Playwright E2E, CodeQL, bundle analysis and Vercel deployment pipelines
