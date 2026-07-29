---
translationKey: phase-3-complete
title: 'v1.4.0-beta — Fase 3: Backlog Completo'
summary: 'Optimización SVGO, datos estructurados (BreadcrumbList/ScholarlyArticle), tokens de espaciado, hoja de estilo de impresión, optimización de imágenes, casos de estudio y devlog.'
pubDate: 2026-06-28
version: '1.4.0-beta'
tags: ['release', 'sprint']
---

## Fase 3 (28 Junio)

Fase final del backlog inicial de auditoría: optimización de rendimiento, enriquecimiento de contenido y documentación.

## Completado

- **P3-5**: Activado svgoOptimizer para futuros assets SVG
- **P3-6**: BreadcrumbList JSON-LD auto-generado en todas las páginas internas; ScholarlyArticle en páginas de investigación
- **P3-4**: CSP: cancelado — incompatible con Astro ClientRouter para View Transitions
- **P3-7**: Añadidos tokens de espaciado pixel-grid (--space-1 a --space-24), escala de sombras retro y hoja de estilo de impresión para CV limpio
- **P3-1**: Páginas de caso de estudio (temática boss-fight) con rutas [slug] dedicadas por proyecto
- **P3-2**: Devlog (notas de parche) con historial de versiones

## Optimización de Imágenes

- project-09-fluentreads: 912K → 42K (-95%)
- project-08-campus-map: 336K PNG → 26K WebP (-92%)
- project-10-MAD-AI: 181K → 34K (-81%)
- Total dist: 3.8M → 2.4M
