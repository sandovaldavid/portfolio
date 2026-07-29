---
translationKey: v1-0-0-launch
title: 'v1.0.0 — Lanzamiento y Auditoría'
summary: 'Lanzamiento inicial de producción tras una auditoría de 70+ páginas que cubre accesibilidad, rendimiento, SEO, tamaño de bundle y arquitectura. Reconstrucción completa del sitio con Astro 5, Tailwind 4 y arquitectura FSD.'
pubDate: 2026-06-15
version: '1.0.0'
tags: ['release']
---

## Resumen

El portafolio se lanzó el 15 de junio de 2026 tras una auditoría exhaustiva de 70+ páginas que abarcó accesibilidad (escaneos axe-core), rendimiento (Lighthouse CI), SEO (auditoría de datos estructurados) y arquitectura de código (cumplimiento FSD).

## Cambios Principales

- **Migración de framework**: Actualizado a Astro 5 con modo estricto TypeScript
- **Arquitectura**: Migrado a Feature-Sliced Design (FSD) con jerarquía de capas que impone dirección de importación
- **Estilos**: Adoptado Tailwind CSS 4 con integración @tailwindcss/vite
- **Temas**: Implementado tema claro/oscuro/sistema con función CSS light-dark()
- **Accesibilidad**: Añadido skip-link, navegación por teclado, cumplimiento WCAG 2.1 AA, soporte reduced-motion
- **Fuentes**: Migrado a Astro Font API con stack de fuentes retro pixel (Press Start 2P, VT323, Silkscreen)
- **CI/CD**: Añadido Lighthouse CI, Playwright E2E, CodeQL, análisis de bundle y pipelines de despliegue Vercel
