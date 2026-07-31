---
applyTo: 'src/app/**'
---

# App layer

Follow [AGENTS.md](../../AGENTS.md).

- Keep global layouts, styles and application composition here.
- Import lower layers only; do not place domain behavior in `app`.
- Treat changes to the shared layout as cross-route changes and validate representative English and Spanish routes.
