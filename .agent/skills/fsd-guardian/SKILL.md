---
name: fsd-guardian
description: "Validate component placement, slice APIs and imports against the portfolio's executable Feature-Sliced Design contract. Use when creating, moving, reviewing or debugging code under src/app, src/widgets, src/features, src/entities or src/shared."
---

# FSD Guardian

Read the repository [AGENTS.md](../../../AGENTS.md) and [architecture contract](../../../docs/ARCHITECTURE.md) before changing product structure. Those files and `bun run lint:architecture` are authoritative; this skill is only an execution aid.

## Current dependency direction

```text
src/pages → app → widgets → features → entities → shared
```

Astro route files are framework entry points above application composition.

Allowed imports:

- `shared` imports no product layer;
- `entities` import `shared`;
- `features` import `entities` and `shared`;
- `widgets` import `features`, `entities` and `shared`;
- `app` imports lower product layers;
- `src/pages` composes the application and lower layers.

## Mandatory rules

1. Consume slices through semantic aliases and their public `index.ts` APIs.
2. Do not deep-import another slice's `ui`, `model` or `lib` internals.
3. Do not import peer widgets, peer features or peer entities.
4. Do not use the retired catch-all, component, page, style or root-widget barrels.
5. Keep generic UI and technical configuration in `shared`.
6. Keep domain records and domain rendering in `entities`.
7. Keep user-triggered interaction orchestration in `features`.
8. Keep large page sections and cross-entity composition in `widgets`.
9. Keep cross-page shell and layout composition in `app`.
10. Keep route loading, route parameters and page composition in `src/pages`.

The architecture checker is the final authority. Do not add an exclusion merely to silence it.

## Placement questions

Ask in order:

1. Is this framework routing or route data? → `src/pages`.
2. Is this global layout or application composition? → `src/app`.
3. Is this a large section composed from lower slices? → `src/widgets/<slice>`.
4. Is this a user-triggered capability with interaction logic? → `src/features/<slice>`.
5. Is this domain data, a domain type or domain-specific rendering? → `src/entities/<slice>`.
6. Is this reusable UI, utility, configuration or asset without product ownership? → `src/shared/<segment>` or `src/assets`.

When classification remains ambiguous, prefer the lowest layer that can own the code without importing upward.

## Slice structure

Create only the segments the slice needs:

```text
<layer>/<slice>/
├── ui/
├── model/
├── lib/
├── assets/
└── index.ts
```

`index.ts` is required for a slice consumed outside itself. Relative imports are valid inside the same slice.

## Workflow

1. Inspect the current consumer, nearby slices and public APIs.
2. Classify the responsibility and expected dependency direction.
3. Prefer extending an existing slice when responsibility matches.
4. Move shared behavior downward instead of adding a cross-layer exception.
5. Add or update types and localized content in their canonical owners.
6. Add regression coverage for behavior or import rules.
7. Update [docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md) only when the operational contract changes.
8. Put durable rationale, rejected alternatives and migration history in Cortex-L7 rather than adding repository planning documents.

## Validation

```bash
bun run lint:architecture
bun run lint
bun run typecheck
bun run test:unit:ci
bun run build
```

Add the relevant Playwright command for route composition, navigation lifecycle or visible behavior.

## Review checklist

- [ ] Responsibility is in the lowest valid layer.
- [ ] No peer-slice or upward import exists.
- [ ] External consumers use the public API.
- [ ] No catch-all or deep import was introduced.
- [ ] Localized copy uses the canonical i18n owner.
- [ ] Tests cover changed behavior or checker rules.
- [ ] `bun run lint:architecture` passes.
- [ ] Operational documentation is current and historical rationale is not stored as active repository guidance.

## References

- [Layer rules](references/fsd-layers.md)
- [Astro patterns](references/astro-fsd-patterns.md)
- [Placement guide](references/component-placement.md)
