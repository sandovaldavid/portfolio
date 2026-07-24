# Style Guide — Typography, Color Tokens, Headings & Shadows

Prescriptive standard for all UI work in this repository. The historical audit that informed the
initial version is retained in Cortex-L7; this document owns only the current enforceable rules.
Enforced by `tests/e2e/typography.spec.ts`.

**Tech context:** Tailwind CSS 4 (`@theme` in `src/app/styles/colors.css`, no
`tailwind.config.js`). Every `--color-<name>` token generates `text-<name>`, `bg-<name>`,
`border-<name>` utilities; every `--shadow-<name>` token generates `shadow-<name>` utilities;
every `--animate-<name>` token generates `animate-<name>` utilities.

---

## 1. Typography scale

The browser base size is 16px (no `html { font-size }` override — keep it that way).

| Role                   | Class                                                         |     Px | Used for                                                                         |
| ---------------------- | ------------------------------------------------------------- | -----: | -------------------------------------------------------------------------------- |
| Display                | `text-4xl sm:text-6xl lg:text-7xl`                            |  36–72 | Hero `h1` only                                                                   |
| Page title (`h1`)      | `text-3xl sm:text-4xl` (up to `md:text-5xl`)                  |  30–48 | Top heading of every sub-page                                                    |
| Section heading (`h2`) | `text-2xl sm:text-3xl` (home `TitleSection` keeps `text-4xl`) |  24–30 | Section titles                                                                   |
| Sub-heading (`h3`)     | `text-lg sm:text-xl`                                          |  18–20 | Card titles, panel titles                                                        |
| **Body copy**          | `text-base`                                                   | **16** | Paragraphs, descriptions, list content — anything the visitor reads              |
| **Secondary**          | `text-sm`                                                     | **14** | Metadata, dates, nav items, functional captions, dense HUD/terminal reading text |
| **Caption / label**    | `text-xs`                                                     | **12** | Decorative badges, tags, kickers, kbd hints — **absolute floor**                 |

### Hard rules

1. **Never** use an arbitrary size below 12px: `text-[8px]`, `text-[9px]`, `text-[10px]`,
   `text-[11px]` are banned. If a label feels too big at `text-xs`, reduce tracking or padding,
   not the font size.
2. **Body copy is `text-base`, not `text-sm`.** If a `<p>` holds sentences someone reads,
   it is body copy.
3. Responsive steps may go _up_ from the role's floor (`text-sm sm:text-base` for secondary is
   fine); they may not dip below it on any breakpoint.

### Pixel-font (+1 step) rule

The retro fonts render visually smaller than their nominal size — VT323 (`font-pixel-clean`)
especially, and Press Start 2P / Silkscreen read dense in uppercase. When **reading text**
(not a decorative label) is set in a pixel font, use **one step larger** than the role's
floor: secondary → `text-base`, caption → `text-sm`. Headings already compensate through
their large sizes.

## 2. Color tokens

All color comes from the semantic tokens in `src/app/styles/colors.css` (they handle
light/dark via `light-dark()` — no `dark:` pair needed):

| Token                                                               | Utility                                     | Role                                                              |
| ------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------- |
| `--color-content-strong`                                            | `text-content-strong`                       | Headings, emphasized text                                         |
| `--color-content`                                                   | `text-content`                              | Body copy (also the `body` default)                               |
| `--color-content-muted`                                             | `text-content-muted`                        | Secondary/metadata text                                           |
| `--color-surface` / `--color-surface-highlight`                     | `bg-surface` / `bg-surface-highlight`       | Panels, cards                                                     |
| `--color-edge-subtle` / `--color-edge-strong`                       | `border-edge-subtle` / `border-edge-strong` | Borders; `--color-edge-strong` also powers the retro shadow scale |
| `--color-success-500` / `--color-warning-500` / `--color-error-500` | `text-success-500`, …                       | Status UI — never raw `emerald`/`green`/`yellow`/`red`            |

### Hard rules

1. **No raw palette colors on text**: `text-neutral-*`, `text-gray-*`, `text-black`,
   `text-white` are banned for content (component-internal contrast like text-on-primary
   buttons is fine).
2. **Status is always tokenized** — success/warning/error, including colors built in JS strings.
3. **No opacity modifiers below `/80` on text at `text-sm` or smaller** — they fall under
   WCAG AA contrast.
4. **Exception — terminal aesthetic**: `CLITerminal.astro` and `SplashScreen.astro` use
   phosphor hexes (`#00b0ff`, `#00ff88`) on an always-dark surface. Allowed there only.
   Follow-up: promote to `--color-terminal-*` tokens.

### Token naming convention

The name after `--color-` becomes the utility suffix. **Name tokens after the role, never
after a CSS property.** `--color-text-main` produced the stutter `text-text-main`;
`--color-border-subtle` produced `border-border-subtle` — that's why they were renamed to
`content-*` / `edge-*`. Before adding a token, say the generated utilities out loud:
`text-<name>`, `bg-<name>`, `border-<name>` must all read sensibly.

## 3. Headings

1. **Exactly one `h1` per page**, and it is the page title. On the home page that's the Hero
   name; on every sub-page it's the top heading of the main content.
2. **No skipped levels** in DOM order (h1 → h2 → h3 …).
3. **A heading is visually ≥ the body text it labels** on every breakpoint — weight/color
   alone don't establish hierarchy.
4. Card titles inside a section use the level below the section's heading (page `h1`/section
   `h2` → card `h3`).
5. Global CSS (`global.css`) sets heading _font/tracking/case_ only — sizes always live on the
   element per the scale in §1, so changing a tag never silently changes its size.

## 4. Enforcement

- `tests/e2e/typography.spec.ts` gates: ≥12px floor on all visible text, ≥16px on content
  paragraphs, one `h1`, no level skips, heading ≥ body — across key EN+ES pages, desktop and
  mobile viewports.
- Review checklist: new UI must cite which scale role each text element uses.
- `grep -rn 'text-\[8px\]\|text-\[9px\]\|text-\[10px\]\|text-\[11px\]' src` must stay empty.
- `grep -rn 'shadow-\[.*var\(--color-edge-strong\)' src` must stay empty.

## 5. Shadow scale

The retro 3D offset shadow is the design system's signature. Tokens live in
`src/app/styles/colors.css` inside `@theme` — Tailwind 4 generates `shadow-retro-*` utilities
automatically from them.

| Token                | Utility            | Offset            | Used for                                                                     |
| -------------------- | ------------------ | ----------------- | ---------------------------------------------------------------------------- |
| `--shadow-retro-xs`  | `shadow-retro-xs`  | `1px 1px 0 0`     | kbd keys, micro-chips, pressed-button residual                               |
| `--shadow-retro-sm`  | `shadow-retro-sm`  | `1.5px 1.5px 0 0` | small pills, badges, tooltips, mobile nav rest state                         |
| `--shadow-retro-md`  | `shadow-retro-md`  | `3px 3px 0 0`     | cards (BlogCard, DevlogCard, TechStack), panels, default retro border        |
| `--shadow-retro-lg`  | `shadow-retro-lg`  | `4px 4px 0 0`     | primary/feature ProjectCard, About section cards, hero avatar, splash button |
| `--shadow-retro-xl`  | `shadow-retro-xl`  | `5px 5px 0 0`     | hover state of retro-md/lg elements (the lift), CTA buttons                  |
| `--shadow-retro-2xl` | `shadow-retro-2xl` | `6px 6px 0 0`     | Research panel, Atena main card, interactive primary hover                   |
| `--shadow-retro-3xl` | `shadow-retro-3xl` | `8px 8px 0 0`     | Hero HUD, CLITerminal — the largest interactive surfaces                     |

### Hard rules

1. **Retro shadows are always `shadow-retro-*`** — never `shadow-[Npx_Npx_0_var(--color-edge-strong)]`
   arbitrary literals. The token guarantees the offset lands on the same color the border uses,
   so light/dark never drift out of sync.
2. **Responsive hover/active ladder is monotonic**: rest at size N, hover at the next size up,
   active back at size N or below. e.g. `shadow-retro-md hover:shadow-retro-xl active:shadow-retro-xs`.
   Lifting on hover, settling on press.
3. **No opacity on retro shadows**: the offset is a solid edge-color block; alpha reduces the
   retro read. Use `shadow-none` to remove, never `/opacity`.
4. **Off-scale offsets are forbidden** — no `text-[2px]`-style `shadow-[2.5px_2.5px_…]`. If a
   surface needs a value between two tokens, pick the **larger** token (not the smaller): an
   under-shadow looks like a render bug; an over-shadow looks intentional. The half-pixel
   offsets previously used (1.5px, 2.5px, 3.5px, 4.5px) were normalized to `sm` / `sm` / `md` /
   `lg` respectively — visually identical on integer-DPR screens and crisper on HiDPI.

### Documented exceptions (kept as arbitrary shadows)

These intentionally use a color **other** than `--color-edge-strong` and therefore cannot map to
the retro scale. Avoid placeholder text that resembles a complete Tailwind class candidate: the
Tailwind v4 scanner may otherwise generate invalid CSS from documentation-only examples.

- **Primary glow** — `shadow-[Npx_Npx_0_var(--color-primary-500)]` on Skills cards
  (`src/pages/skills.astro`, `src/pages/es/skills.astro`), ContactSidebar, Footer CTA,
  ExperienceItem — the blue accent shadow that signals "interactive primary".
- **Phosphor glow** — `shadow-[0_0_30px_rgba(0,176,255,0.35)]` on the CLITerminal CRT border
  (`src/features/cli-terminal/ui/CLITerminal.astro:129`).
- 💡 **Follow-up**: if more than 2 surfaces need the same primary-glow offset, promote it to a
  `--shadow-glow-*` scale before the arbitrary count grows again.
