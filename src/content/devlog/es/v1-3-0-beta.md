---
translationKey: v1-3-0-beta
title: 'v1.3.0-beta — Sprint 3: Experiencia y Pulido'
summary: 'Mejoras de legibilidad de tipografías display, efectos de transición de la dirección visual anterior, validación de accesibilidad en CI, pruebas de componentes y automatización de releases.'
pubDate: 2026-06-23
version: '1.3.0-beta'
tags: ['sprint']
---

## Sprint 3 (21-23 de junio)

Enfocado en pulido de experiencia de usuario y cobertura de pruebas.

## Completado

- **P2-8**: Mejorada la legibilidad de tipografías display al reservar Press Start 2P para títulos y usar JetBrains Mono en el cuerpo
- **P2-6**: Añadido un efecto de transición con líneas de barrido perteneciente a la dirección visual anterior, reemplazado posteriormente cuando la identidad se alejó de la estética retro original
- **P2-7**: Añadida una validación de accesibilidad en CI que bloquea PRs cuando axe-core detecta violaciones serious/critical
- **P3-3**: Añadidas pruebas integrales de componentes y visuales (78 tests unitarios + specs E2E)

## Métricas

- 6 PRs fusionadas, incluyendo correcciones de baseline y la release 1.3.0-beta
- 78 pruebas unitarias pasando con 100% de cobertura i18n en el momento de la release
- 4 archivos E2E cubriendo flujos críticos de usuario
- Pipelines CI en verde para Validate PR, Lighthouse, CodeQL y Bundle Analysis en el momento de la release
