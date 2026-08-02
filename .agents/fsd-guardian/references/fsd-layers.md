# FSD Layers Reference

## Layer Hierarchy

FSD (Feature-Sliced Design) organizes code into layers with strict import rules:

```
app → pages → widgets → features → entities → shared
```

**Golden Rule**: Lower layers CANNOT import from higher layers.

## Layer Definitions

### 1. Shared Layer (`src/shared/`)

**Purpose**: Reusable UI components, utilities, and configuration without business logic.

**Structure**:

```
shared/
├── ui/               # Generic UI components (Badge, Button, etc.)
├── lib/              # Utility functions, helpers
├── config/           # App-wide configuration, constants
└── assets/           # Global icons, fonts, images
```

**What belongs here**:

- Generic UI components (Badge, LinkButton, SectionContainer)
- i18n utilities and configuration
- Type definitions used across the app
- Global icons and assets
- Helper functions (formatDate, cn, etc.)

**What does NOT belong**:

- Components with business logic
- Domain-specific data
- Feature-specific functionality

**Public API**: Every slice must export through `index.ts`

### 2. Entities Layer (`src/entities/`)

**Purpose**: Business entities and their data models.

**Structure**:

```
entities/
├── [entity-name]/
│   ├── model/        # Data, types, schemas
│   ├── ui/           # Entity-specific UI (optional)
│   ├── lib/          # Entity-specific utilities (optional)
│   ├── assets/       # Entity-specific assets (optional)
│   └── index.ts      # Public API
```

**What belongs here**:

- Data models and TypeScript interfaces
- Hardcoded data (PROJECTS, BADGES, EXPERIENCE)
- Entity-specific types
- Domain logic related to entities

**Examples**:

- `entities/project/` - Project data and types
- `entities/badge/` - Badge data and types
- `entities/technology/` - Technology tags and types
- `entities/experience/` - Experience data and types

**Import rules**:

- ✅ Can import from: `shared`
- ❌ Cannot import from: `features`, `widgets`, `pages`, `app`

### 3. Features Layer (`src/features/`)

**Purpose**: User interactions and feature slices with specific business logic.

**Structure**:

```
features/
├── [feature-name]/
│   ├── model/        # Feature state, types
│   ├── ui/           # Feature UI components
│   ├── lib/          # Feature-specific logic
│   └── index.ts      # Public API
```

**What belongs here**:

- Interactive components with client-side logic
- Features users can activate/deactivate
- Stateful interactions (theme toggle, language picker)

**Examples**:

- `features/theme-toggle/` - Dark/light theme switcher
- `features/language-picker/` - i18n language selector

**Import rules**:

- ✅ Can import from: `shared`, `entities`
- ❌ Cannot import from: `widgets`, `pages`, `app`

### 4. Widgets Layer (`src/widgets/`)

**Purpose**: Large composite components that combine features and entities.

**Structure**:

```
widgets/
├── [widget-name]/
│   ├── ui/
│   │   ├── WidgetName.astro
│   │   └── components/        # Internal components only used by this widget
│   └── index.ts               # Public API
```

**What belongs here**:

- Page sections (Header, Footer, Hero)
- Composite components combining multiple features/entities
- Layout components for specific sections

**Examples**:

- `widgets/header/` - Site header with navigation
- `widgets/hero/` - Hero section with avatar and social pills
- `widgets/experience/` - Experience section with list
- `widgets/projects/` - Projects showcase section

**Import rules**:

- ✅ Can import from: `shared`, `entities`, `features`
- ❌ Cannot import from: `pages`, `app`
- ⚠️ Widgets CANNOT import from other widgets

### 5. Pages Layer (`src/pages/`)

**Purpose**: Astro pages - route definitions.

**Structure**:

```
pages/
├── index.astro           # Main page
├── es/
│   └── index.astro       # Spanish page
└── en/
    └── index.astro       # English page
```

**What belongs here**:

- Route pages only
- Minimal logic - just composition of widgets
- SEO metadata, page-specific configuration

**Import rules**:

- ✅ Can import from: `shared`, `entities`, `features`, `widgets`, `app`
- ❌ Should NOT contain complex logic
- ⚠️ Pages CANNOT import from other pages

### 6. App Layer (`src/app/`)

**Purpose**: Application-wide setup, layouts, and global styles.

**Structure**:

```
app/
├── layouts/          # Page layouts
├── styles/           # Global styles
└── providers/        # Global providers (optional)
```

**What belongs here**:

- Layout components (BaseLayout)
- Global CSS/styles
- App initialization logic
- Global providers/contexts

**Import rules**:

- ✅ Can import from: `shared`, `entities`, `features`, `widgets`
- ❌ Cannot import from: `pages`

## Public API Pattern

Every slice (feature/entity/widget) MUST export through `index.ts`:

```typescript
// ✅ Good - Public API
export { Badge } from './ui/Badge.astro';
export type { BadgeProps } from './model/types';

// Usage in other layers
import { Badge } from '@shared/ui/badge';
```

```typescript
// ❌ Bad - Direct import
import Badge from '@shared/ui/badge/Badge.astro';
```

## Import Path Aliases

Use path aliases for clean imports:

```typescript
// ✅ Good
import { Badge } from '@shared/ui';
import { PROJECTS } from '@entities/project';
import { ThemeToggle } from '@features/theme-toggle';
import { Header } from '@widgets/header';

// ❌ Bad
import Badge from '../../../shared/ui/badge/Badge.astro';
```

## Validation Rules

### ❌ Common Violations

1. **Cross-widget imports**:

    ```typescript
    // widgets/header/ui/Header.astro
    import { Footer } from '@widgets/footer'; // ❌ NO!
    ```

2. **Importing from higher layers**:

    ```typescript
    // entities/project/model/data.ts
    import { Projects } from '@widgets/projects'; // ❌ NO!
    ```

3. **Business logic in shared**:

    ```typescript
    // shared/ui/ProjectCard.astro - ❌ NO!
    // ProjectCard is domain-specific, belongs in widgets or entities
    ```

4. **No Public API**:
    ```typescript
    // Missing index.ts in feature/widget/entity slice - ❌ NO!
    ```

### ✅ Valid Patterns

1. **Shared → Everything can use it**
2. **Entities → Features, Widgets, Pages can use it**
3. **Features → Widgets, Pages can use it**
4. **Widgets → Only Pages can use it**

## Migration Checklist Quick Reference

- [ ] All components in correct layer
- [ ] No cross-layer violations (check imports)
- [ ] Public APIs (`index.ts`) in all slices
- [ ] Path aliases configured and used
- [ ] No legacy `components/` directory
- [ ] Build passes with 0 TypeScript errors
