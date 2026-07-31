# David Sandoval — Portafolio de Ingeniería de Software

[![Portafolio](https://img.shields.io/badge/live-sandovaldavid.com-0096ff)](https://sandovaldavid.com)
[![Workflow de CI](https://github.com/sandovaldavid/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/sandovaldavid/portfolio/actions/workflows/ci.yml)
[![Licencia MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Portafolio bilingüe y static-first para presentar experiencia profesional, evidencia de proyectos, investigación y contenido técnico.

## Acceso rápido

| Recurso                  | Enlace                                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| Sitio publicado          | [sandovaldavid.com](https://sandovaldavid.com)                                                |
| CV en inglés             | [david-sandoval-resume.pdf](https://sandovaldavid.com/resume/david-sandoval-resume.pdf)       |
| CV en español            | [david-sandoval-resume-es.pdf](https://sandovaldavid.com/resume/david-sandoval-resume-es.pdf) |
| Guía principal en inglés | [README.md](README.md)                                                                        |

## Implementación actual

- **Identidad del repositorio:** `sandovaldavid/portfolio` y el paquete privado `portfolio` son canónicos. `portfolio-v1` se conserva únicamente como procedencia histórica o redirección.
- **Entrega:** Astro genera un sitio estático con interacciones progresivas del lado del cliente.
- **Arquitectura:** las dependencias siguen `src/pages → app → widgets → features → entities → shared` y `bun run lint:architecture` valida sus límites.
- **Localización:** inglés no usa prefijo y español utiliza `/es`; catálogos tipados, Content Collections localizadas y validaciones de rutas garantizan la paridad.
- **Calidad:** Vitest, Playwright, Axe, enlaces generados, presupuestos por ruta y Lighthouse están versionados en el repositorio.
- **Despliegue:** `develop` es la rama de integración y `main` es la rama de producción.
- **Entrega del CV:** los PDF públicos validados se suministran mediante `resume-assets`; las fuentes editables permanecen privadas.

## Arquitectura

```text
src/pages → src/app → src/widgets → src/features → src/entities → src/shared
```

Las rutas Astro son puntos de entrada. Las capas dependen solo hacia abajo, los slices pares permanecen aislados y los consumidores usan aliases semánticos y APIs públicas `index.ts`. `scripts/check-architecture.mjs` es el contrato ejecutable detallado.

## Desarrollo local

Usa la versión de Bun declarada en [package.json](package.json).

```bash
git clone https://github.com/sandovaldavid/portfolio.git
cd portfolio
git switch develop
bun install --frozen-lockfile
bun run dev
```

Validación canónica:

```bash
bun run check
bun run test:unit:ci
bun run build
```

## Documentación

- [Límite e índice documental](docs/README.md)
- [Desarrollo y troubleshooting](docs/DEVELOPMENT.md)
- [Internacionalización](docs/I18N.md)
- [Testing y calidad](docs/TESTING.md)
- [Ramas, despliegue y releases](docs/DELIVERY.md)
- [Manual operativo para agentes](AGENTS.md)
- [Flujo de contribución](.github/CONTRIBUTING.md)

Las decisiones detalladas, alternativas, razonamiento arquitectónico, inventarios, auditorías históricas, planes y handoffs viven en el proyecto `portfolio` de Cortex-L7. El código, la configuración, las pruebas y los workflows siguen siendo la autoridad del comportamiento actual.

## Licencia

[MIT](LICENSE)
