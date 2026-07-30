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

- **Entrega:** Astro genera un sitio estático; JavaScript se utiliza para interacciones progresivas y el ciclo de navegación cliente.
- **Arquitectura:** las dependencias siguen `src/pages → app → widgets → features → entities → shared` y `bun run lint:architecture` valida sus límites.
- **Localización:** inglés no usa prefijo y español utiliza `/es`; catálogos granulares, Content Collections localizadas, metadata y validaciones de rutas generadas hacen ejecutable el contrato bilingüe.
- **Calidad:** el repositorio versiona checks, pruebas unitarias, Playwright, Axe, presupuestos por ruta y comandos de Lighthouse.
- **Entorno de desarrollo:** un Dev Container con Playwright y Bun fijados soporta la validación local completa.
- **Despliegue:** `develop` es la rama de integración; `main` es la rama por defecto y de producción. La promoción a `main` se realiza mediante una PR separada.

El runtime legacy de localización fue eliminado y no debe reintroducirse. El ownership actual y sus validaciones están documentados en [docs/I18N.md](docs/I18N.md) y [docs/I18N-ENFORCEMENT.md](docs/I18N-ENFORCEMENT.md).

## Controles de calidad

| Área                        | Contrato del repositorio                                 |
| --------------------------- | -------------------------------------------------------- |
| Formato, lint y tipos       | `bun run check`                                          |
| Enlaces documentales        | `bun run check:docs`                                     |
| Comportamiento unitario     | `bun run test:unit:ci` y el comando de cobertura acotada |
| Salida de producción        | `bun run build` y `bun run check:links`                  |
| Navegadores y accesibilidad | comandos smoke, desktop, extended y visual de Playwright |
| Rendimiento                 | presupuestos por ruta y comandos de Lighthouse           |
| Entorno de desarrollo       | `bun run check:devcontainer`                             |

Los workflows de GitHub automatizan gates seleccionados de promoción, producción y auditoría programada. Un workflow ausente, deshabilitado o bloqueado por cuota no constituye evidencia de validación; cada PR debe indicar los comandos realmente ejecutados.

## Arquitectura

```text
src/pages → src/app → src/widgets → src/features → src/entities → src/shared
```

Las rutas Astro son entry points del framework. El código consume capas inferiores mediante aliases semánticos y APIs públicas por slice. Consulta [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Desarrollo local

Usa la versión de Bun declarada en `packageManager` dentro de [package.json](package.json).

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

Añade validación de enlaces generados, navegador, rendimiento o visual según [docs/TESTING.md](docs/TESTING.md).

## Documentación

- [Ownership documental y vocabulario de estados](docs/README.md)
- [Estado actual de implementación](docs/STATUS.md)
- [Arquitectura](docs/ARCHITECTURE.md)
- [Internacionalización](docs/I18N.md)
- [Testing](docs/TESTING.md)
- [Política de CI](docs/CI.md)
- [Entrega y releases](docs/DELIVERY.md)
- [Toolchain](docs/TOOLCHAIN.md)
- [Metodología de rendimiento](docs/PERFORMANCE.md)
- [Dev Container](docs/DEVCONTAINER.md)
- [Reglas para agentes](AGENTS.md)
- [Flujo de contribución](CONTRIBUTING.md)

Las decisiones, alternativas, auditorías históricas, planes y handoffs de sesión se mantienen en el área `portfolio-v1` de Cortex-L7 en lugar de la documentación activa del repositorio.

## Licencia

[MIT](LICENSE)
