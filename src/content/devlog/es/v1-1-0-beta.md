---
translationKey: v1-1-0-beta
title: 'v1.1.0-beta — Sprint 1: Fundamentos'
summary: 'Corregido FOUC de tema, añadido soporte reduced-motion, skip-link, tokens de accesibilidad de estado y líneas base de rendimiento.'
pubDate: 2026-06-19
version: '1.1.0-beta'
tags: ['sprint']
---

## Sprint 1 (17-19 Junio)

Primer sprint de iteración enfocado en correcciones críticas de la auditoría.

## Completado

- **P0-1**: Corregido FOUC de tema inyectando script de tema inline antes del renderizado
- **P0-3**: Añadido soporte prefers-reduced-motion (WCAG 2.3.3) desactivando todas las animaciones
- **P1-2**: Implementado skip-link para navegación primero-teclado
- **P2-5**: Añadidos tokens de color semánticos para indicadores de estado (éxito/advertencia/error)
- **P0-2**: Establecidas líneas base de rendimiento Lighthouse ≥90 en todas las categorías

## Métricas

- 5 PRs fusionados
- Primer pase Lighthouse logró ≥90 Rendimiento, ≥95 Accesibilidad, ≥90 Buenas Prácticas
