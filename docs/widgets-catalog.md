# Widget slice catalog

This catalog is an operational inventory of the current slices under `src/widgets/`. [ARCHITECTURE.md](ARCHITECTURE.md) owns dependency rules; source code and public APIs own exact dependencies and call sites.

Widgets compose page sections from features, entities and shared primitives. They must not import peer widgets.

| Slice                | Current purpose                                                                     | Mount status                                       |
| -------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------- |
| `about-content`      | Standalone About page content built from localized profile data.                    | Mounted by localized About routes.                 |
| `about-me`           | Home-page profile summary and About link.                                           | Mounted on localized home routes.                  |
| `badges`             | Certification-badge collection backed by the badge entity.                          | Implemented but not mounted by a production route. |
| `blog`               | Blog cards and full editorial detail rendering.                                     | Mounted by localized blog routes.                  |
| `contact-sidebar`    | Persistent social/contact shortcuts.                                                | Composed by the application layout.                |
| `devlog`             | Devlog cards and full entry rendering.                                              | Mounted by localized devlog routes.                |
| `experience`         | Localized tabbed professional-experience section.                                   | Mounted on localized home routes.                  |
| `footer`             | Site footer and social links.                                                       | Composed by the application layout.                |
| `header`             | Brand, primary navigation, resume action, language control and mobile navigation.   | Composed by the application layout.                |
| `hero`               | Home-page professional introduction and primary evidence links.                     | Mounted on localized home routes.                  |
| `project-case-study` | Structured project problem, approach, trade-offs and outcome detail.                | Mounted by localized project detail routes.        |
| `projects`           | Featured or complete project-card collection.                                       | Mounted by home and project-index routes.          |
| `recruiter-hud`      | Optional recruiter controls, theme/language access and retro interaction utilities. | Composed by the application layout.                |
| `research`           | Home-page research summary.                                                         | Mounted on localized home routes.                  |
| `research-content`   | Standalone research page content.                                                   | Mounted by localized research routes.              |
| `tech-stack`         | Curated technology overview and skills navigation.                                  | Composed by the home layout.                       |
| `vision`             | Future-facing portfolio cards.                                                      | Implemented but not mounted by a production route. |

“Implemented but not mounted” means source code exists but is not current user-facing behavior. Do not market or document those slices as live features unless a production consumer and regression coverage are added.

## Maintenance rules

When adding or changing a widget:

1. keep routing in `src/pages` and cross-page shell composition in `src/app`;
2. import features, entities and shared code through public APIs;
3. do not import another widget or an app layout from a widget;
4. load localized structured data through the owning entity and reusable UI copy through granular catalogs;
5. keep one unique page `<h1>` and preserve semantic heading order;
6. add browser coverage for changed rendering, responsive behavior or client-navigation lifecycle;
7. update this inventory only when a slice is added, removed, repurposed or mounted/unmounted;
8. run `bun run lint:architecture` and the relevant test command.
