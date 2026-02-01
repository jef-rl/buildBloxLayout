# Framework Package Reorganization Plan

## Executive Summary

This plan outlines the reorganization of `packages/framework/src` to:
1. Limit folder depth to **3 levels maximum** (from current 4 levels)
2. Limit file size to **200 lines of code maximum**
3. Implement consistent naming conventions using **feature.{handler|state|view|effect}.ts** pattern

---

## Current Structure Analysis

### Folder Depth Issues (Currently 4 levels)
```
packages/framework/src/domains/auth/components/      ❌ 4 levels
packages/framework/src/domains/dock/components/      ❌ 4 levels
packages/framework/src/domains/dock/handlers/        ❌ 4 levels
packages/framework/src/domains/layout/components/    ❌ 4 levels
packages/framework/src/domains/layout/handlers/      ❌ 4 levels
packages/framework/src/domains/logging/components/   ❌ 4 levels
packages/framework/src/domains/workspace/components/ ❌ 4 levels
packages/framework/src/domains/workspace/handlers/   ❌ 4 levels
packages/framework/src/core/registry/                ❌ 4 levels
```

### Large Files (> 200 lines) Requiring Split

| File | Lines | Split Into |
|------|-------|------------|
| `workspace/handlers/registry.ts` | **904** | 5-6 files |
| `domains/auth/components/AuthView.ts` | **547** | 3-4 files |
| `layout/components/FrameworkMenu.ts` | **478** | 3 files |
| `workspace/components/WorkspaceRoot.ts` | **457** | 3 files |
| `components/FrameworkRoot.ts` | **441** | 3 files |
| `workspace/components/PanelView.ts` | **402** | 2-3 files |
| `workspace/handlers/workspace-panels.handlers.ts` | **395** | 2-3 files |
| `core/framework-singleton.ts` | **364** | 2 files |
| `handler-registry.ts` | **294** | 2 files |
| `domains/logging/components/LogView.ts` | **292** | 2 files |
| `domains/dock/components/DockContainer.ts` | **280** | 2 files |
| `utils/firestore-persistence.ts` | **249** | 2 files |
| `workspace/components/ToolbarView.ts` | **217** | 2 files |
| `layout/components/SavePresetContent.ts` | **215** | 2 files |
| `layout/components/CustomToolbar.ts` | **205** | 2 files |
| `layout/components/ViewRegistryPanel.ts` | **202** | 2 files |
| `layout/components/LoadPresetContent.ts` | **201** | 2 files |

**Total: 17 files need splitting**

---

## New Naming Conventions

### File Type Suffixes
```
*.view.ts      → Lit web components (UI rendering)
*.handler.ts   → Action handlers/reducers (state mutations)
*.effect.ts    → Side effects (async operations, persistence)
*.state.ts     → State definitions and initial values
*.types.ts     → TypeScript type definitions
*.utils.ts     → Utility/helper functions
*.registry.ts  → Registry definitions
```

### Feature Prefixes
```
auth.view.ts           → Auth domain view
auth.handler.ts        → Auth domain handlers
workspace-panel.view.ts → Workspace panel view component
```

---

## Proposed New Structure

```
packages/framework/
├── package.json
├── tsconfig.json
└── src/                                    # Level 1
    ├── index.ts                            # Public API exports
    │
    ├── core/                               # Level 2 - Framework core
    │   ├── index.ts
    │   ├── bootstrap.ts
    │   ├── framework.singleton.ts          # Split from 364 lines
    │   ├── framework.config.ts             # Config extracted
    │   ├── decorators.ts
    │   ├── view-config.ts
    │   ├── defaults.ts
    │   ├── built-in-views.ts
    │   ├── handler.registry.ts             # Split from 294 lines
    │   ├── handler.dispatcher.ts           # Dispatcher logic extracted
    │   ├── view.registry.ts
    │   └── effect.registry.ts
    │
    ├── state/                              # Level 2 - State management
    │   ├── index.ts
    │   ├── context.ts
    │   ├── ui.state.ts
    │   ├── context-update.ts
    │   ├── state-validator.ts
    │   └── selectors.ts
    │
    ├── types/                              # Level 2 - Type definitions
    │   ├── index.ts
    │   ├── core.types.ts
    │   ├── state.types.ts
    │   ├── auth.types.ts
    │   ├── panel.types.ts                  # From domains/panels
    │   └── events.types.ts
    │
    ├── utils/                              # Level 2 - Utilities
    │   ├── index.ts
    │   ├── dispatcher.ts
    │   ├── logger.ts
    │   ├── helpers.ts
    │   └── expansion-helpers.ts
    │
    ├── persistence/                        # Level 2 - Persistence layer
    │   ├── index.ts
    │   ├── local.persistence.ts            # localStorage
    │   ├── firestore.persistence.ts        # Split from 249 lines
    │   ├── firestore.read.ts               # Read operations
    │   ├── firestore.write.ts              # Write operations
    │   ├── hybrid.persistence.ts           # Split from 162 lines
    │   ├── hybrid.sync.ts                  # Sync logic extracted
    │   └── menu.persistence.ts
    │
    ├── auth/                               # Level 2 - Auth domain
    │   ├── index.ts
    │   ├── auth.view.ts                    # Main component (split)
    │   ├── auth-form.view.ts               # Email/password form
    │   ├── auth-social.view.ts             # OAuth buttons
    │   ├── auth-reset.view.ts              # Password reset
    │   ├── auth.handler.ts
    │   ├── auth.effect.ts
    │   ├── auth.utils.ts                   # Firebase auth utils
    │   └── auth-menu.utils.ts              # Menu item generation
    │
    ├── dock/                               # Level 2 - Dock domain
    │   ├── index.ts
    │   ├── dock-container.view.ts          # Split from 280 lines
    │   ├── dock-layout.view.ts             # Layout extracted
    │   ├── dock-manager.view.ts
    │   ├── position-picker.view.ts
    │   ├── dock.handler.ts                 # Combined handlers
    │   ├── dock.types.ts
    │   └── dock.utils.ts
    │
    ├── layout/                             # Level 2 - Layout domain
    │   ├── index.ts
    │   ├── menu.view.ts                    # Split from 478 lines
    │   ├── menu-items.view.ts              # Menu item rendering
    │   ├── menu-actions.view.ts            # Action items
    │   ├── workspace.view.ts               # From Workspace.ts (361 lines)
    │   ├── toolbar-container.view.ts
    │   ├── custom-toolbar.view.ts          # Split from 205 lines
    │   ├── custom-toolbar-items.view.ts
    │   ├── view-registry-panel.view.ts     # Split from 202 lines
    │   ├── view-registry-list.view.ts
    │   ├── save-preset.view.ts             # Split from 215 lines
    │   ├── save-preset-form.view.ts
    │   ├── load-preset.view.ts             # Split from 201 lines
    │   ├── load-preset-list.view.ts
    │   ├── preset.handler.ts
    │   ├── menu.handler.ts
    │   ├── view-instances.handler.ts
    │   ├── views.handler.ts
    │   └── drag.handler.ts
    │
    ├── logging/                            # Level 2 - Logging domain
    │   ├── index.ts
    │   ├── log.view.ts                     # Split from 292 lines
    │   ├── log-filter.view.ts              # Filter controls
    │   └── log-list.view.ts                # Log entry list
    │
    ├── workspace/                          # Level 2 - Workspace domain
    │   ├── index.ts
    │   ├── workspace-root.view.ts          # Split from 457 lines
    │   ├── workspace-regions.view.ts       # Region rendering
    │   ├── workspace-transitions.view.ts   # Transition logic
    │   ├── panel.view.ts                   # Split from 402 lines
    │   ├── panel-content.view.ts           # Content rendering
    │   ├── panel-header.view.ts            # Header/controls
    │   ├── toolbar.view.ts                 # Split from 217 lines
    │   ├── toolbar-items.view.ts           # Item rendering
    │   ├── overlay.view.ts
    │   ├── panels.handler.ts               # Split from 395 lines
    │   ├── panels-add.handler.ts           # Add panel logic
    │   ├── panels-remove.handler.ts        # Remove panel logic
    │   ├── panels-move.handler.ts          # Move/reorder logic
    │   ├── layout.handler.ts
    │   ├── registry.handler.ts             # Split from 904 lines
    │   ├── registry-panels.handler.ts      # Panel handlers
    │   ├── registry-layout.handler.ts      # Layout handlers
    │   ├── registry-presets.handler.ts     # Preset handlers
    │   ├── registry-menu.handler.ts        # Menu handlers
    │   └── registry-expansion.handler.ts   # Expansion handlers
    │
    ├── effects/                            # Level 2 - Side effects
    │   ├── index.ts
    │   ├── auth.effect.ts
    │   ├── preset.effect.ts
    │   ├── menu.effect.ts
    │   └── register.ts
    │
    └── components/                         # Level 2 - Shared components
        ├── index.ts
        ├── framework-root.view.ts          # Split from 441 lines
        ├── framework-context.view.ts       # Context provider logic
        ├── framework-dispatch.view.ts      # Dispatch logic
        ├── view-token.view.ts
        └── icons.ts
```

---

## Migration Strategy

### Phase 1: Preparation (Non-breaking)
1. Create new folder structure alongside existing
2. Add barrel exports (index.ts) to new folders
3. Set up path aliases in tsconfig.json

### Phase 2: File Splitting (Critical Files First)
Priority order based on file size and complexity:

#### 2.1 Split `registry.ts` (904 lines → 6 files)
```
workspace/handlers/registry.ts
  → workspace/registry.handler.ts        (core registration)
  → workspace/registry-panels.handler.ts (panel handlers)
  → workspace/registry-layout.handler.ts (layout handlers)
  → workspace/registry-presets.handler.ts (preset handlers)
  → workspace/registry-menu.handler.ts   (menu handlers)
  → workspace/registry-expansion.handler.ts (expansion handlers)
```

#### 2.2 Split `AuthView.ts` (547 lines → 4 files)
```
domains/auth/components/AuthView.ts
  → auth/auth.view.ts           (main container ~150 lines)
  → auth/auth-form.view.ts      (email/password ~150 lines)
  → auth/auth-social.view.ts    (OAuth buttons ~100 lines)
  → auth/auth-reset.view.ts     (password reset ~100 lines)
```

#### 2.3 Split `FrameworkMenu.ts` (478 lines → 3 files)
```
layout/components/FrameworkMenu.ts
  → layout/menu.view.ts          (main component ~180 lines)
  → layout/menu-items.view.ts    (item rendering ~150 lines)
  → layout/menu-actions.view.ts  (action handlers ~150 lines)
```

#### 2.4 Split `WorkspaceRoot.ts` (457 lines → 3 files)
```
domains/workspace/components/WorkspaceRoot.ts
  → workspace/workspace-root.view.ts      (main ~180 lines)
  → workspace/workspace-regions.view.ts   (regions ~150 lines)
  → workspace/workspace-transitions.view.ts (~130 lines)
```

#### 2.5 Split `FrameworkRoot.ts` (441 lines → 3 files)
```
components/FrameworkRoot.ts
  → components/framework-root.view.ts      (main ~160 lines)
  → components/framework-context.view.ts   (context ~150 lines)
  → components/framework-dispatch.view.ts  (dispatch ~130 lines)
```

#### 2.6 Split remaining 12 files (200-400 lines each)
- `PanelView.ts` → 2 files
- `workspace-panels.handlers.ts` → 3 files
- `framework-singleton.ts` → 2 files
- `handler-registry.ts` → 2 files
- `LogView.ts` → 2 files
- `DockContainer.ts` → 2 files
- `firestore-persistence.ts` → 2 files
- `ToolbarView.ts` → 2 files
- `SavePresetContent.ts` → 2 files
- `CustomToolbar.ts` → 2 files
- `ViewRegistryPanel.ts` → 2 files
- `LoadPresetContent.ts` → 2 files

### Phase 3: Flatten Folder Structure
1. Move `domains/*` contents up to `src/` level
2. Merge `core/registry/` into `core/`
3. Remove empty `domains/` folder
4. Update all imports

### Phase 4: Rename Files
Apply new naming convention:
```
AuthView.ts        → auth.view.ts
dock.handlers.ts   → dock.handler.ts
FrameworkRoot.ts   → framework-root.view.ts
```

### Phase 5: Update Imports & Exports
1. Update all internal imports to new paths
2. Update `src/index.ts` public API exports
3. Update external package imports (if any)

### Phase 6: Cleanup
1. Remove old empty folders
2. Remove deprecated files
3. Update documentation

---

## File Splitting Guidelines

### Splitting View Components
```typescript
// BEFORE: LargeComponent.ts (400+ lines)
@customElement('large-component')
export class LargeComponent extends LitElement {
  // All in one file
}

// AFTER: Split by responsibility
// large.view.ts - Main component
// large-header.view.ts - Header section
// large-content.view.ts - Content section
// large-footer.view.ts - Footer section
```

### Splitting Handler Files
```typescript
// BEFORE: all-handlers.ts (900 lines)
export function registerAllHandlers() {
  registry.register('action1', handler1);
  registry.register('action2', handler2);
  // 50+ handlers
}

// AFTER: Split by domain
// registry.handler.ts - Core registration
// registry-panels.handler.ts - Panel-related handlers
// registry-layout.handler.ts - Layout-related handlers
```

### Composing Split Files
```typescript
// index.ts (barrel export)
export * from './auth.view';
export * from './auth-form.view';
export * from './auth-social.view';
export * from './auth-reset.view';

// Or compose components
import { AuthForm } from './auth-form.view';
import { AuthSocial } from './auth-social.view';

@customElement('auth-view')
export class AuthView extends LitElement {
  render() {
    return html`
      <auth-form></auth-form>
      <auth-social></auth-social>
    `;
  }
}
```

---

## Import Path Changes

### Before
```typescript
import { AuthView } from './domains/auth/components/AuthView';
import { WorkspaceRoot } from './domains/workspace/components/WorkspaceRoot';
import { registerHandlers } from './domains/workspace/handlers/registry';
```

### After
```typescript
import { AuthView } from './auth/auth.view';
import { WorkspaceRoot } from './workspace/workspace-root.view';
import { registerHandlers } from './workspace/registry.handler';
```

---

## Validation Checklist

After each phase:
- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] No circular dependencies
- [ ] Each file is under 200 lines
- [ ] Folder depth is max 3 levels
- [ ] Naming conventions are consistent
- [ ] Public API exports work correctly

---

## Estimated File Counts

| Category | Current | After Split |
|----------|---------|-------------|
| View files | 17 | ~35 |
| Handler files | 12 | ~25 |
| Effect files | 3 | 4 |
| State files | 4 | 4 |
| Type files | 5 | 6 |
| Utility files | 10 | 12 |
| Index files | 15 | 12 |
| **Total** | **~66** | **~98** |

---

## Risk Mitigation

1. **Incremental Changes**: Do one phase at a time, test after each
2. **Git Branches**: Create feature branch for reorganization
3. **Import Verification**: Use TypeScript to catch broken imports
4. **Barrel Exports**: Maintain backward compatibility via index.ts re-exports
5. **Documentation**: Update as structure changes

---

## Success Criteria

- [ ] All folders are max 3 levels deep
- [ ] All files are max 200 lines
- [ ] Consistent naming: `feature.{view|handler|effect|state|types|utils}.ts`
- [ ] No broken imports
- [ ] All functionality preserved
- [ ] Tests pass
- [ ] Build succeeds
