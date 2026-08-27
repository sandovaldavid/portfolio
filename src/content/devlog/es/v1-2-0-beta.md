---
translationKey: v1-2-0-beta
title: 'v1.2.0-beta — Sprint 2: i18n y SEO'
summary: 'Soporte bilingüe inglés/español, internacionalización del hero, refactor FSD, etiquetas hreflang y escaneos de accesibilidad axe-core.'
pubDate: 2026-06-21
version: '1.2.0-beta'
tags: ['sprint']
---

## Sprint 2 (19-21 de junio)

Hito importante: internacionalización completa y refactor estructural.

## Completado

- **P1-1**: Migración a Astro 6 Fonts API para carga automática de fuentes
- **P1-5**: Internacionalización del hero (EN/ES)
- **P1-4**: Incorporación de versiones en inglés y español del contenido profesional principal en experiencia, proyectos y About
- **P2-1/2/3/4**: Migración FSD: alias de rutas (@/ @app/ @widgets/ etc.), componentes PascalCase, extracción de widgets y hreflang para SEO
- **P1-3**: Automatización de escaneos de accesibilidad axe-core con bloqueo ante hallazgos serious/critical

## Infraestructura

- 8 PRs fusionadas, todas con validación CI
- Añadido `getStaticPaths()` para enrutamiento i18n dinámico
- ESLint + Prettier aplicados en cada commit mediante pre-commit hooks
