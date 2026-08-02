---
applyTo: 'src/entities/**'
---

# Entities layer

Follow [AGENTS.md](../../AGENTS.md).

- Keep domain data, types, queries and entity presentation together.
- Depend only on shared code; do not import peer entities.
- Unit-test deterministic transformations and keep runtime-bound queries behind public APIs.
