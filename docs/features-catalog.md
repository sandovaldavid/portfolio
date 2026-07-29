# Feature slice catalog

This catalog is an operational inventory of the current slices under `src/features/`. [ARCHITECTURE.md](ARCHITECTURE.md) owns dependency rules; source code and each slice public API own exact implementation details.

Features may import `entities` and `shared` only. They must not import widgets, pages or peer features.

| Slice             | Current purpose                                                                                             | Status                                                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `cli-terminal`    | Keyboard shortcuts, CLI overlay, navigation commands and optional recruiter-oriented terminal interactions. | **Implemented** and composed by the application layout.                                                                        |
| `language-picker` | Renders verified locale targets supplied by the owning route/layout and preserves query/fragment state.     | **Implemented** and used by header/recruiter navigation surfaces.                                                              |
| `splash-screen`   | Optional session-scoped retro boot overlay for home routes with client-navigation lifecycle handling.       | **Implemented** and composed by the application layout.                                                                        |
| `theme-toggle`    | Standalone light/dark/system theme control backed by browser storage.                                       | **Implemented but unmounted**; do not describe it as the live theme control without adding a consumer and regression coverage. |

The portfolio uses Astro components and vanilla browser scripts rather than framework hydration directives for these slices.

## Maintenance rules

When adding or changing a feature:

1. keep interaction orchestration inside the feature and move language-neutral reusable primitives to `shared`;
2. expose consumers through the slice `index.ts` rather than deep imports;
3. keep English/Spanish copy in the canonical UI catalog, not inside client scripts;
4. handle Astro client-navigation lifecycle events where listeners or state must be reinitialized;
5. add unit or Playwright coverage for changed behavior;
6. update this inventory only when the slice purpose or mount status changes;
7. run `bun run lint:architecture` and the relevant test command.

Unmounted slices are current code but not current user-facing behavior. A product decision to mount or remove one belongs in a GitHub issue and Cortex-L7 planning, not as an implied feature in the README.
