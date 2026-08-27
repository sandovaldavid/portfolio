---
translationKey: phase-3-complete
title: 'v1.4.0-beta — Fase 3: Backlog Completo'
summary: 'Optimización SVGO, datos estructurados (BreadcrumbList/ScholarlyArticle), tokens de espaciado, estilos de impresión, optimización de imágenes, casos de estudio y devlog.'
pubDate: 2026-06-28
version: '1.4.0-beta'
tags: ['release', 'sprint']
---

## Fase 3 (28 de junio)

La fase final del backlog inicial de mejoras se concentró en rendimiento, contenido de proyectos y documentación.

## Completado

- **P3-5**: Activado svgoOptimizer para futuros recursos SVG
- **P3-6**: BreadcrumbList JSON-LD generado automáticamente en páginas internas; ScholarlyArticle en páginas de investigación
- **P3-4**: El trabajo de CSP se pospuso porque la configuración propuesta entraba en conflicto con las View Transitions de Astro ClientRouter
- **P3-7**: Añadidos tokens de espaciado (--space-1 a --space-24), una escala de sombras perteneciente a la dirección visual anterior y una hoja de impresión para el CV
- **P3-1**: Añadidas rutas dedicadas para casos de estudio; la primera versión usó un tratamiento visual inspirado en videojuegos que después fue reemplazado a medida que evolucionó la identidad
- **P3-2**: Añadido el devlog con historial de versiones

## Optimización de imágenes

- project-09-fluentreads: 912K → 42K (-95%)
- project-08-campus-map: 336K PNG → 26K WebP (-92%)
- project-10-MAD-AI: 181K → 34K (-81%)
- Total dist: 3.8M → 2.4M
