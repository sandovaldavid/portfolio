---
translationKey: v1-3-0-beta
title: 'v1.3.0-beta — Sprint 3: Experiencia y Pulido'
summary: 'Mejoras de legibilidad de fuentes pixel, transiciones CRT, puerta CI de accesibilidad, pruebas integrales de componentes y automatización de releases.'
pubDate: 2026-06-23
version: '1.3.0-beta'
tags: ['sprint']
---

## Sprint 3 (21-23 Junio)

Enfocado en pulido de experiencia de usuario y cobertura de pruebas.

## Completado

- **P2-8**: Legibilidad de fuentes pixel: Press Start 2P reservado para títulos, cuerpo usa JetBrains Mono
- **P2-6**: View Transitions con animación CRT scan-line (keyframes crt-off/crt-on)
- **P2-7**: Puerta CI de accesibilidad que bloquea PRs si axe-core detecta violaciones serious/critical
- **P3-3**: Pruebas integrales de componentes y visuales (78 tests unitarios + specs E2E)

## Métricas

- 6 PRs fusionados (incluyendo corrección de baselines y release 1.3.0-beta)
- 78 pruebas unitarias pasando con 100% de cobertura i18n
- 4 archivos de especificaciones E2E cubriendo flujos críticos de usuario
- Todos los pipelines CI verdes (Validate PR, Lighthouse, CodeQL, Bundle Analysis)
