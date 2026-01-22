# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BuildBlox Framework** is a production-ready, TypeScript-first web framework built on Lit Elements designed for creating sophisticated, multi-panel IDE-like applications. It implements a clean, unidirectional data flow pattern (View-Context-Handler Protocol) with centralized state management and pure handler functions.

**Primary Use Cases:**
- Code editors and IDEs
- Design tools
- Dashboards
- File managers
- Admin panels
- Multi-pane applications

**Repository Structure:** Monorepo using npm workspaces
```
packages/
├── framework/        # Core library (main deliverable)
├── playground/       # Vite dev server for testing framework (port 5173)
└── app/             # Application template

DOCS/
├── FRAMEWORK_DEVELOPMENT_GUIDE.md    # Comprehensive internals guide (95KB)
└── UPDATE_SUMMARY.md                 # Recent changes
```

## Quick Start Commands

### Development
```bash
# Build framework (TypeScript compilation)
npm run --workspace @project/framework build

# Start dev server (Vite, port 5173)
npm run --workspace @project/playground dev

# Build playground for production
npm run --workspace @project/playground build

# Preview production build
npm run --workspace @project/playground preview

# Build entire monorepo
npm run build  # Root command
```

### Linting
```bash
# No lint script configured yet
# Run manually:
npx eslint . --ext .ts
```

## Core Architecture Concepts

### The View-Context-Handler Protocol

Framework follows a **unidirectional data flow**:

```
User Interaction
    ↓
View dispatches action via dispatchUiEvent()
    ↓
Handler (pure function) processes action, returns new state
    ↓
Context distributes updated state to all views via @lit/context
    ↓
Views re-render with new state
```

### Key Architecture Components

**1. State Management (UIState)**
- Centralized immutable state object
- File: `packages/framework/src/state/ui-state.ts`
- Managed by `UiState` class with subscribers (`subscribe()`, `update()`, `hydrate()`)
- Hydratable from partial state patches

**2. Context System (@lit/context)**
- `uiStateContext`: Provides read-only state + dispatch function to all views
- Views consume via `@consume(uiStateContext)` decorator
- Context provider in `FrameworkRoot` component
- File: `packages/framework/src/state/context.ts`

**3. Handler Registry**
- Centralized pure functions that transform state
- File: `packages/framework/src/core/registry/handler-registry.ts`
- Supports **follow-up actions** (chained state updates)
- Core handlers include: `state/hydrate`, `context/update`, `context/patch`, `layout/update`, `panels/update`

**4. View Registry**
- Lazy-loads view components on demand
- File: `packages/framework/src/core/registry/view-registry.ts`
- Manages view definitions, metadata, and caching
- Views must be registered before use

**5. Event System**
- Custom `ui-event` CustomEvent for action dispatch
- File: `packages/framework/src/utils/dispatcher.ts`
- Bubbles through DOM tree for capture

**6. Bootstrap System**
- `bootstrapFramework()` initializes framework
- File: `packages/framework/src/core/bootstrap.ts`
- Registers views, hydrates initial state, mounts `framework-root`

### Key Domains

Located in `packages/framework/src/domains/`:

| Domain | Purpose | Key File |
|--------|---------|----------|
| **workspace** | Main container, panel layout, overlay modals | WorkspaceRoot.ts |
| **panels** | Panel definitions, type system, container management | `panels/` |
| **layout** | Expansion states, viewport modes, layout presets, main panel count | handlers/registry.ts |
| **dock** | Toolbar positioning, position picker | DockManager.ts |

### UIState Schema

```typescript
{
  containers: PanelContainer[],          // Panel containers
  panels: Panel[],                       // Individual panels with region/activeViewId
  views: View[],                         // Registered view metadata
  viewTokens: ViewTokenState,            // View registration state
  activeView: string | null,             // Currently active view ID

  layout: {
    expansion: {
      left: boolean,
      right: boolean,
      bottom: boolean
    },
    overlayView: string | null,          // Modal/overlay view ID
    viewportWidthMode: '1x'|'2x'|'3x'|'4x'|'5x',  // Responsive modes
    mainAreaCount: 1-5,                  // Number of main panels visible
    mainViewOrder: string[],             // View IDs in main panel order
    presets: Record<string, LayoutPreset>,        // Saved layout configurations
    activePreset: string | null,         // Currently active preset name
    frameworkMenu: FrameworkMenuConfig   // Menu structure
  },

  toolbars: {
    positions: Record<string, ToolbarPos>,  // Position picker state
    activePicker: string | null
  },

  dock: unknown,                         // Dock internal state
  theme: unknown,                        // Theme settings

  auth: {
    isLoggedIn: boolean,
    user?: AuthUser | null
  },

  panelState: {
    open: Record<string, boolean>,
    data: Record<string, unknown>,
    errors: Record<string, unknown>
  }
}
```

## Working With Core Systems

### Creating a New Handler

Handlers are pure functions that process actions and return updated state with optional follow-ups:

```typescript
// In domains/[domain]/handlers/registry.ts
const handleMyAction = (
  context: FrameworkContextState,
  action: { type: 'my-action'; payload?: Record<string, unknown> }
) => {
  const { state } = context;

  return {
    state: {
      ...state,
      // Update state
    },
    followUps: [
      // Optional: chain additional actions
      { type: 'other-action', payload: {} }
    ]
  };
};

// Register in registerWorkspaceHandlers or similar
frameworkHandlers.register('my-action', handleMyAction);
```

### Dispatching Actions from Views

```typescript
import { dispatchUiEvent } from '@project/framework';

// In any view/component:
dispatchUiEvent(this, 'my-action', {
  type: 'my-action',
  payload: { key: value }
});
```

### Consuming State in Views

```typescript
import { LitElement } from 'lit';
import { consume } from '@lit/context';
import { uiStateContext } from '@project/framework';
import type { UiStateContextValue } from '@project/framework';

export class MyView extends LitElement {
  @consume({ context: uiStateContext })
  uiState!: UiStateContextValue;

  render() {
    const { state, dispatch } = this.uiState;
    // Use state and dispatch function
  }
}
```

### Registering Views

Views must be registered before framework bootstrap:

```typescript
import { viewRegistry } from '@project/framework';

viewRegistry.register('my-view-id', {
  name: 'My View',
  component: 'my-view-component',  // Custom element tag name
  description: 'Description'
});
```

## State Management Patterns

### Updating State from Handlers

**Always return new state objects** (immutability):

```typescript
// ✅ Correct
return {
  state: {
    ...state,
    panels: [...state.panels, newPanel]
  },
  followUps: []
};

// ❌ Wrong - direct mutation
state.panels.push(newPanel);
return { state, followUps: [] };
```

### Using Follow-ups for Chained Actions

When one action needs to trigger subsequent actions, use follow-ups:

```typescript
const handleLoadPreset = (context, action) => {
  const { state } = context;
  const preset = state.layout.presets[action.payload.name];

  return {
    state: {
      ...state,
      layout: {
        ...state.layout,
        mainAreaCount: preset.mainAreaCount,
        // ... other preset properties
        activePreset: action.payload.name
      }
    },
    followUps: [
      // Chain view assignment actions
      { type: 'panels/assignView', payload: { panelId: 'left', viewId: preset.leftViewId } },
      { type: 'panels/assignView', payload: { panelId: 'main-0', viewId: preset.mainViewOrder[0] } }
    ]
  };
};
```

## Persistence

### Layout Presets System

Layout presets save and restore complete workspace configurations:

**What Gets Saved:**
- Main panel count (1-5)
- Expansion states (left, right, bottom panels open/closed)
- View assignments (which view in which panel)
- Viewport width mode
- Panel sizes (optional)

**Files:**
- Type definitions: `packages/framework/src/types/state.ts` (LayoutPreset, LayoutPresets)
- localStorage persistence: `packages/framework/src/utils/persistence.ts`
- Handlers: `packages/framework/src/domains/workspace/handlers/registry.ts`
- UI Component: `packages/framework/src/domains/layout/components/PresetManager.ts`

**Handlers:**
- `presets/save` - Save current layout as named preset
- `presets/load` - Load and apply named preset
- `presets/delete` - Delete preset by name
- `presets/rename` - Rename existing preset
- `presets/hydrate` - Load all presets from localStorage on startup

### Firestore Integration

Framework includes hybrid persistence (localStorage + Firestore cloud sync):

**Files:**
- `packages/framework/src/utils/hybrid-persistence.ts` - Hybrid sync manager
- `packages/framework/src/utils/firestore-persistence.ts` - Firestore operations
- Integration point: `packages/framework/src/components/FrameworkRoot.ts` (configureFirestore method)

**Setup:**
```typescript
// In app initialization
const firestore = getFirestore(app);
frameworkRoot.configureFirestore(firestore);
frameworkRoot.setAuthUser(userId);
```

## TypeScript & Build Configuration

**TypeScript Version:** 5.9.3+

**tsconfig.json Key Settings:**
- `strict: true` - Strict type checking enabled
- `target: ES2020` - Modern JavaScript target
- `module: ESNext` - ES module format
- `experimentalDecorators: true` - Required for Lit
- Path aliases: `@project/framework` → `packages/framework/dist`

**Build Process:**
- Framework: TypeScript compilation to `packages/framework/dist/`
- Playground: TypeScript + Vite build
- Declaration maps included for source map support

**Important:** Always run `npm run build` before committing framework changes to ensure type declarations are generated.

## Development with Playground

The playground (`@project/playground`) is the development environment:

1. **Start dev server:** `npm run --workspace @project/playground dev`
2. **Create demo views** in the playground to test framework features
3. **Framework hot-reload:** Changes to framework require rebuild (no HMR)
4. **Test against real component usage:** The playground demonstrates actual integration patterns

## Documentation Resources

**Primary Reference:** `DOCS/FRAMEWORK_DEVELOPMENT_GUIDE.md` (95KB)
- Complete protocol explanation
- System layers and design principles
- State management details
- Handler and view registry documentation
- Extension points
- Testing strategies (current implementation recommendations)
- Best practices and common patterns
- Debugging guidance

## Important Implementation Notes

### Panel Regions

Panels have assigned regions that determine their layout position:
- `main` - Scrollable main area (multiple panels in grid)
- `left` - Left sidebar (collapsible expander)
- `right` - Right sidebar (collapsible expander)
- `bottom` - Bottom panel (collapsible expander)
- `overlay` - Modal/overlay above main content

### Responsive Behavior

Layout uses CSS custom properties for responsive sizing:
```css
--left-width: 'clamp(220px, 22vw, 360px)';
--right-width: 'clamp(220px, 22vw, 360px)';
--bottom-height: 'clamp(180px, 26vh, 320px)';
--main-panel-count: number of visible panels;
--main-panel-width: calc(100% / visibleCount);
```

Viewport width mode (`1x`-`5x`) controls how many main panels are visible at once.

### Framework Logging

Enable framework debug logging:
```typescript
import { setFrameworkLogLevel } from '@project/framework';

setFrameworkLogLevel('info');  // 'debug', 'info', 'warn', 'error'
```

Access framework root for debugging:
```javascript
window.__frameworkRoot  // Reference to FrameworkRoot component instance
```

## Common Patterns and Workflows

### Adding a New Panel Region Feature

1. Update `LayoutState` in `types/state.ts` if needed
2. Create handler in `domains/workspace/handlers/registry.ts`
3. Add UI controls to appropriate component (ViewControls, PresetManager, etc.)
4. Dispatch action from component using `dispatchUiEvent()`
5. Handler updates state, which triggers view re-renders via context

### Extending State with Custom Data

Use `panelState.data` namespace for domain-specific data:

```typescript
// In handler
return {
  state: {
    ...state,
    panelState: {
      ...state.panelState,
      data: {
        ...state.panelState.data,
        'my-domain': { /* custom data */ }
      }
    }
  },
  followUps: []
};

// In view
@consume({ context: uiStateContext })
uiState!: UiStateContextValue;

get myDomainData() {
  return this.uiState.state.panelState.data['my-domain'];
}
```

### Testing Framework Components (Recommended Setup)

While no test infrastructure is currently configured, the documentation recommends:
- Framework: `vitest` for unit tests
- Components: `@open-wc/testing` for integration tests
- DOM testing library for behavior verification

Example pattern (not yet implemented):
```typescript
import { expect, test } from 'vitest';
import { fixture } from '@open-wc/testing';

test('component renders state', async () => {
  const component = await fixture('<my-view></my-view>');
  expect(component).toBeDefined();
});
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `packages/framework/src/index.ts` | Public API exports |
| `packages/framework/src/core/bootstrap.ts` | Framework initialization |
| `packages/framework/src/components/FrameworkRoot.ts` | Root component, context provider |
| `packages/framework/src/state/ui-state.ts` | Centralized state store |
| `packages/framework/src/core/registry/handler-registry.ts` | Handler management |
| `packages/framework/src/core/registry/view-registry.ts` | View management |
| `packages/framework/src/domains/workspace/handlers/registry.ts` | Workspace-specific handlers |
| `packages/framework/src/domains/workspace/components/WorkspaceRoot.ts` | Workspace layout component |
| `packages/framework/src/utils/dispatcher.ts` | Event dispatching |
| `packages/framework/src/utils/hybrid-persistence.ts` | Firestore sync |

## ESLint Configuration

**File:** `eslint.config.js`
- TypeScript parser with `@typescript-eslint/parser`
- Unused variables: warnings only (prefixed with `_` ignored)
- Explicit `any` allowed
- PostCSS autoprefixer enabled for CSS cross-browser support

