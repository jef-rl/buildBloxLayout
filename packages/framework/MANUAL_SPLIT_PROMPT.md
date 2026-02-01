# Manual File Splitting Prompt

Complete the manual file splitting for the framework migration.

The migration script created placeholder files that need actual code extracted from the source files. For each group below:

1. Read the source file (the one with "// TODO: Extract from..." at the top that contains the FULL code)
2. Extract the relevant sections into the placeholder files
3. Update imports in each new file
4. Ensure each file is ~50 lines (max 80)

---

## SPLITTING RULES

### 1. Styles files (.styles.ts)
Extract the `static styles = css\`...\`` block:
```typescript
import { css } from 'lit';
export const styles = css`...extracted styles...`;
```

### 2. View files (.view.ts)
Extract render methods as separate components or helper functions:
- Import styles from the .styles.ts file
- Import sub-components from their files

### 3. Handler files (.handler.ts)
Extract individual handler functions:
```typescript
import type { UIState } from '../types';
export function handleXxx(state: UIState, payload: Record<string, unknown>) {
  // handler logic
  return { state: newState, followUps: [] };
}
```

### 4. Utils files (.utils.ts)
Extract helper/utility functions

---

## FILES TO SPLIT

### 1. AUTH DOMAIN (from auth/auth.view.ts → 6 files)

**Source:** `src/auth/auth.view.ts` (548 lines)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `auth/auth.styles.ts` | Extract `static styles = css\`...\`` (~165 lines of CSS) |
| `auth/auth-login-form.view.ts` | Extract `renderLoginForm()` method as component |
| `auth/auth-signup-form.view.ts` | Extract `renderSignupForm()` method as component |
| `auth/auth-reset-form.view.ts` | Extract `renderPasswordResetForm()` method |
| `auth/auth-profile.view.ts` | Extract `renderProfile()` method |
| `auth/auth-social-buttons.view.ts` | Extract Google/GitHub OAuth button rendering |

**After extraction**, `auth/auth.view.ts` should:
- Import styles from `./auth.styles`
- Import sub-components
- Be ~60 lines (just the main component shell)

---

### 2. LAYOUT MENU (from layout/menu.view.ts → 7 files)

**Source:** `src/layout/menu.view.ts` (479 lines)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `layout/menu.styles.ts` | CSS styles (~190 lines) |
| `layout/menu-header.view.ts` | Menu header rendering |
| `layout/menu-item-parent.view.ts` | `renderParentItem()` method |
| `layout/menu-item-preset.view.ts` | `renderPresetItem()` method |
| `layout/menu-item-action.view.ts` | `renderActionItem()` method |
| `layout/menu-icons.utils.ts` | `renderIcon()` function (~50 lines) |
| `layout/menu-drag.utils.ts` | Drag/drop handler functions |

---

### 3. WORKSPACE ROOT (from workspace/workspace-root.view.ts → 6 files)

**Source:** `src/workspace/workspace-root.view.ts` (458 lines)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `workspace/workspace-root.styles.ts` | CSS styles (~200 lines) |
| `workspace/workspace-regions.view.ts` | Region rendering logic |
| `workspace/workspace-main-area.view.ts` | Main panel grid rendering |
| `workspace/workspace-side-panel.view.ts` | `renderSidePanelStack()` method |
| `workspace/workspace-sash.view.ts` | `renderSash()` method |
| `workspace/workspace-drop-zone.view.ts` | Drop zone rendering |

---

### 4. FRAMEWORK ROOT (from components/framework-root.view.ts → 6 files)

**Source:** `src/components/framework-root.view.ts` (442 lines)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `components/framework-root.styles.ts` | CSS styles |
| `components/framework-context.view.ts` | Context provider setup |
| `components/framework-dispatch.utils.ts` | `dispatchActions()` pipeline (~60 lines) |
| `components/framework-effects.utils.ts` | Effect execution logic |
| `components/framework-firestore.utils.ts` | `configureFirestore()`, `initializeFirestorePersistence()` |
| `components/framework-auth.utils.ts` | `configureFirebaseAuth()`, `setAuthUser()` |

---

### 5. PANEL VIEW (from workspace/panel.view.ts → 6 files)

**Source:** `src/workspace/panel.view.ts` (403 lines)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `workspace/panel.styles.ts` | CSS styles (~100 lines) |
| `workspace/panel-content.view.ts` | Content/view rendering |
| `workspace/panel-overlay.view.ts` | Design mode overlay |
| `workspace/panel-drag.utils.ts` | `handleDragStart()`, `handleDragEnd()`, etc. |
| `workspace/panel-drop.utils.ts` | `handleDrop()`, `handleDragOver()`, etc. |
| `workspace/panel-load.utils.ts` | `loadView()`, `applyViewData()`, `resolveViewData()` |

---

### 6. WORKSPACE HANDLERS (from workspace/register-handlers.ts → 14 files)

**Source:** `src/workspace/register-handlers.ts` (905 lines)

**Extract handlers to their domain folders:**

#### Layout handlers (to `src/layout/`):
| Target File | What to Extract |
|-------------|-----------------|
| `layout/preset-save.handler.ts` | `handlePresetSave()` (~88 lines) |
| `layout/preset-load.handler.ts` | `handlePresetLoad()` (~90 lines) |
| `layout/preset-delete.handler.ts` | `handlePresetDelete()` (~36 lines) |
| `layout/preset-rename.handler.ts` | `handlePresetRename()` (~43 lines) |
| `layout/preset-hydrate.handler.ts` | `handlePresetHydrate()` (~38 lines) |
| `layout/toggle-design.handler.ts` | `handleToggleInDesign()` (~35 lines) |
| `layout/set-main-area-count.handler.ts` | `handleMainAreaCount()` (~63 lines) |
| `layout/menu-hydrate.handler.ts` | `handleFrameworkMenuHydrate()` (~50 lines) |
| `layout/menu-reorder.handler.ts` | `handleFrameworkMenuReorderItems()` (~32 lines) |
| `layout/menu-update-config.handler.ts` | `handleFrameworkMenuUpdateConfig()` (~28 lines) |

#### Auth handler (to `src/auth/`):
| Target File | What to Extract |
|-------------|-----------------|
| `auth/auth-set-user.handler.ts` | `handleAuthSetUser()` (~42 lines) |

#### Workspace utils (keep in `src/workspace/`):
| Target File | What to Extract |
|-------------|-----------------|
| `workspace/layout-normalize.utils.ts` | `normalizeLayoutState()` (~40 lines) |
| `workspace/auth-normalize.utils.ts` | `normalizeAuthState()` (~20 lines) |
| `workspace/log-action.utils.ts` | `buildLogAction()` (~15 lines) |

---

### 7. PANEL HANDLERS (from workspace/panel-assign.handler.ts → 8 files)

**Source:** `src/workspace/panel-assign.handler.ts` (396 lines)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `workspace/panel-remove.handler.ts` | `removeViewHandler` |
| `workspace/panel-swap.handler.ts` | Swap logic |
| `workspace/panel-move.handler.ts` | Move logic |
| `workspace/instance-allocate.utils.ts` | `allocateViewInstance()` (~40 lines) |
| `workspace/instance-register.utils.ts` | Instance registration logic |
| `workspace/region-order.utils.ts` | `updateRegionOrder()` (~40 lines) |
| `workspace/main-view-order.handler.ts` | `applyMainViewOrder()` (~110 lines) |
| `workspace/main-view-derive.utils.ts` | `deriveMainViewOrderFromPanels()` (~6 lines) |

---

### 8. CORE HANDLERS (from handlers/state-hydrate.handler.ts → 7 files)

**Source:** `src/handlers/state-hydrate.handler.ts` (contains all core handlers)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `handlers/context-update.handler.ts` | context/update handler |
| `handlers/context-patch.handler.ts` | context/patch handler |
| `handlers/layout-update.handler.ts` | layout/update handler |
| `handlers/panels-update.handler.ts` | panels/update handler |
| `handlers/logs-append.handler.ts` | logs/append handler (~50 lines) |
| `handlers/logs-clear.handler.ts` | logs/clear handler (~15 lines) |
| `handlers/logs-set-max.handler.ts` | logs/setMax handler |

---

### 9. CORE SINGLETON (from core/framework-singleton.ts → 4 files)

**Source:** `src/core/framework-singleton.ts` (365 lines)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `core/framework-configure.utils.ts` | `configure()` method logic |
| `core/framework-register.utils.ts` | `registerViews()`, `registerView()` methods |
| `core/framework-init.utils.ts` | `init()` method logic |
| `core/framework-defaults.config.ts` | Default state object |

---

### 10. LOGGING (from logging/log.view.ts → 4 files)

**Source:** `src/logging/log.view.ts` (293 lines)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `logging/log.styles.ts` | CSS (~165 lines) |
| `logging/log-entry.view.ts` | Entry rendering |
| `logging/log-header.view.ts` | Header with clear button |
| `logging/log-format.utils.ts` | `formatTimestamp()`, `formatData()`, `getEventType()` |

---

### 11. DOCK (from dock/dock-container.view.ts → 2 files)

**Source:** `src/dock/dock-container.view.ts` (281 lines)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `dock/dock-container.styles.ts` | CSS (~80 lines) |
| `dock/dock-handle.view.ts` | `renderHandle()` method |

---

### 12. PERSISTENCE (from persistence/firestore.persistence.ts → 6 files)

**Source:** `src/persistence/firestore.persistence.ts` (250 lines)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `persistence/firestore-init.persistence.ts` | `initialize()`, `setUserId()` |
| `persistence/firestore-save.persistence.ts` | `savePreset()`, `saveAll()` |
| `persistence/firestore-load.persistence.ts` | `loadAll()`, `loadSystemPresets()` |
| `persistence/firestore-delete.persistence.ts` | `deletePreset()`, `clear()` |
| `persistence/firestore-rename.persistence.ts` | `renamePreset()` |
| `persistence/firestore-listen.persistence.ts` | `onPresetsChanged()` |

---

### 13. LAYOUT COMPONENTS (styles extraction)

| Source | Target |
|--------|--------|
| `layout/admin-toolbar.view.ts` | `layout/admin-toolbar.styles.ts` |
| `layout/toolbar-container.view.ts` | `layout/toolbar-container.styles.ts` |
| `layout/view-palette.view.ts` | `layout/view-palette.styles.ts` |
| `layout/save-preset.view.ts` | `layout/save-preset.styles.ts` |
| `layout/load-preset.view.ts` | `layout/load-preset.styles.ts` |

---

### 14. WORKSPACE COMPONENTS (styles extraction)

| Source | Target |
|--------|--------|
| `workspace/toolbar.view.ts` | `workspace/toolbar.styles.ts` |
| `workspace/overlay.view.ts` | `workspace/overlay.styles.ts` |

---

### 15. EFFECTS (from effects/auth-state-changed.effect.ts → 5 files)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `effects/auth-login.effect.ts` | Login effect |
| `effects/auth-logout.effect.ts` | Logout effect |
| `effects/preset-save.effect.ts` | Save preset effect |
| `effects/preset-load.effect.ts` | Load preset effect |
| `effects/menu-persist.effect.ts` | Menu persistence effect |

---

## AFTER SPLITTING

1. Update imports in each file to reference the new locations
2. Update the main component files to import from split files
3. Run `npx tsc --noEmit` to verify no errors
4. Delete the `domains/` folder when everything works

---

## EXAMPLE EXTRACTION

### Before (auth.view.ts with everything):
```typescript
@customElement('auth-view')
export class AuthView extends LitElement {
  static styles = css`/* 165 lines of CSS */`;

  renderLoginForm() { /* 50 lines */ }
  renderSignupForm() { /* 50 lines */ }
  // ... more methods
}
```

### After:

**auth.styles.ts:**
```typescript
import { css } from 'lit';
export const authStyles = css`/* extracted CSS */`;
```

**auth-login-form.view.ts:**
```typescript
import { html } from 'lit';
export function renderLoginForm(context: AuthViewContext) {
  return html`/* login form template */`;
}
```

**auth.view.ts (main, ~60 lines):**
```typescript
import { authStyles } from './auth.styles';
import { renderLoginForm } from './auth-login-form.view';
// ... other imports

@customElement('auth-view')
export class AuthView extends LitElement {
  static styles = authStyles;

  render() {
    switch (this.mode) {
      case 'login': return renderLoginForm(this);
      // ...
    }
  }
}
```

---

## TOTAL PLACEHOLDER FILES: ~95

This covers all files that need manual extraction from the migrated source files.
