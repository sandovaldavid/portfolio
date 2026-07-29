---
translationKey: v1-2-0-beta
title: 'v1.2.0-beta — Sprint 2: i18n y SEO'
summary: 'Soporte bilingüe inglés/español, internacionalización del héroe, refactor FSD, etiquetas hreflang y escaneos de accesibilidad axe-core.'
pubDate: 2026-06-21
version: '1.2.0-beta'
tags: ['sprint']
---

## Sprint 2 (19-21 Junio)

Hito importante: internacionalización completa y refactor estructural.

## Completado

- **P1-1**: Migrado a Astro 6 Fonts API para carga automática de fuentes
- **P1-5**: Internacionalizada sección héroe (EN/ES)
- **P1-4**: Traducido todo el contenido 'big-tech' (experiencia, proyectos, sobre mí)
- **P2-1/2/3/4**: Migración FSD: alias de rutas (@/ @app/ @widgets/ etc.), componentes PascalCase, extracción de widgets, hreflang para SEO
- **P1-3**: Automatizados escaneos de accesibilidad axe-core con puerta serious/critical

## Infraestructura

- 8 PRs fusionados, todos con validación CI
- Añadido getStaticPaths() para enrutamiento i18n dinámico
- ESLint + Prettier aplicados en cada commit mediante pre-commit hooks
