---
translationKey: v1-0-0-launch
title: 'v1.0.0 — Lanzamiento del Portfolio'
summary: 'Primer lanzamiento productivo con mejoras de accesibilidad, rendimiento, SEO y arquitectura, reconstruido con Astro 5, Tailwind 4 y Feature-Sliced Design.'
pubDate: 2026-06-15
version: '1.0.0'
tags: ['release']
---

## Resumen

El portfolio se lanzó el 15 de junio de 2026 después de una revisión amplia de ingeniería que cubrió accesibilidad con axe-core, rendimiento con Lighthouse CI, SEO mediante datos estructurados y arquitectura Feature-Sliced Design.

## Cambios principales

- **Migración de framework**: Actualización a Astro 5 con modo estricto de TypeScript
- **Arquitectura**: Migración a Feature-Sliced Design (FSD) con límites de capas y dirección de importaciones controlada
- **Estilos**: Adopción de Tailwind CSS 4 con integración @tailwindcss/vite
- **Temas**: Implementación de modos claro, oscuro y sistema con la función CSS `light-dark()`
- **Accesibilidad**: Incorporación de skip-link, navegación por teclado, validaciones WCAG 2.1 AA y soporte para reduced motion
- **Fuentes**: Adopción de Astro Font API con un conjunto de tipografías display de la dirección visual anterior (Press Start 2P, VT323, Silkscreen), refinado posteriormente a medida que evolucionó la identidad
- **CI/CD**: Incorporación de Lighthouse CI, Playwright E2E, CodeQL, análisis de bundle y pipelines de despliegue en Vercel
