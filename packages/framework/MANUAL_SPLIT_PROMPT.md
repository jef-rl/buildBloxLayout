# Manual File Splitting Prompt

Complete the manual file splitting for the framework migration.

**All new files are created in `nxt/` folder. Original `src/` files remain untouched.**

The migration script created placeholder files in `nxt/` that need actual code extracted from the source files in `src/`. For each group below:

1. Read the source file from `src/` (the original file with the FULL code)
2. Extract the relevant sections into the placeholder files in `nxt/`
3. Update imports in each new file to use `nxt/` paths
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

### 1. AUTH DOMAIN (from src/domains/auth → nxt/auth/)

**Source:** `src/domains/auth/components/AuthView.ts` (548 lines)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `nxt/auth/auth.styles.ts` | Extract `static styles = css\`...\`` (~165 lines of CSS) |
| `nxt/auth/auth-login-form.view.ts` | Extract `renderLoginForm()` method as component |
| `nxt/auth/auth-signup-form.view.ts` | Extract `renderSignupForm()` method as component |
| `nxt/auth/auth-reset-form.view.ts` | Extract `renderPasswordResetForm()` method |
| `nxt/auth/auth-profile.view.ts` | Extract `renderProfile()` method |
| `nxt/auth/auth-social-buttons.view.ts` | Extract Google/GitHub OAuth button rendering |

**After extraction**, `nxt/auth/auth.view.ts` should:
- Import styles from `./auth.styles`
- Import sub-components
- Be ~60 lines (just the main component shell)

---

### 2. LAYOUT MENU (from src/domains/layout → nxt/layout/)

**Source:** `src/domains/layout/components/FrameworkMenu.ts` (479 lines)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `nxt/layout/menu.styles.ts` | CSS styles (~190 lines) |
| `nxt/layout/menu-header.view.ts` | Menu header rendering |
| `nxt/layout/menu-item-parent.view.ts` | `renderParentItem()` method |
| `nxt/layout/menu-item-preset.view.ts` | `renderPresetItem()` method |
| `nxt/layout/menu-item-action.view.ts` | `renderActionItem()` method |
| `nxt/layout/menu-icons.utils.ts` | `renderIcon()` function (~50 lines) |
| `nxt/layout/menu-drag.utils.ts` | Drag/drop handler functions |

---

### 3. WORKSPACE ROOT (from src/domains/workspace → nxt/workspace/)

**Source:** `src/domains/workspace/components/WorkspaceRoot.ts` (458 lines)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `nxt/workspace/workspace-root.styles.ts` | CSS styles (~200 lines) |
| `nxt/workspace/workspace-regions.view.ts` | Region rendering logic |
| `nxt/workspace/workspace-main-area.view.ts` | Main panel grid rendering |
| `nxt/workspace/workspace-side-panel.view.ts` | `renderSidePanelStack()` method |
| `nxt/workspace/workspace-sash.view.ts` | `renderSash()` method |
| `nxt/workspace/workspace-drop-zone.view.ts` | Drop zone rendering |

---

### 4. FRAMEWORK ROOT (from src/components → nxt/components/)

**Source:** `src/components/FrameworkRoot.ts` (442 lines)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `nxt/components/framework-root.styles.ts` | CSS styles |
| `nxt/components/framework-context.view.ts` | Context provider setup |
| `nxt/components/framework-dispatch.utils.ts` | `dispatchActions()` pipeline (~60 lines) |
| `nxt/components/framework-effects.utils.ts` | Effect execution logic |
| `nxt/components/framework-firestore.utils.ts` | `configureFirestore()`, `initializeFirestorePersistence()` |
| `nxt/components/framework-auth.utils.ts` | `configureFirebaseAuth()`, `setAuthUser()` |

---

### 5. PANEL VIEW (from src/domains/workspace → nxt/workspace/)

**Source:** `src/domains/workspace/components/PanelView.ts` (403 lines)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `nxt/workspace/panel.styles.ts` | CSS styles (~100 lines) |
| `nxt/workspace/panel-content.view.ts` | Content/view rendering |
| `nxt/workspace/panel-overlay.view.ts` | Design mode overlay |
| `nxt/workspace/panel-drag.utils.ts` | `handleDragStart()`, `handleDragEnd()`, etc. |
| `nxt/workspace/panel-drop.utils.ts` | `handleDrop()`, `handleDragOver()`, etc. |
| `nxt/workspace/panel-load.utils.ts` | `loadView()`, `applyViewData()`, `resolveViewData()` |

---

### 6. WORKSPACE HANDLERS (from src/domains/workspace → nxt/)

**Source:** `src/domains/workspace/handlers/registry.ts` (905 lines)

**Extract handlers to their domain folders:**

#### Layout handlers (to `nxt/layout/`):
| Target File | What to Extract |
|-------------|-----------------|
| `nxt/layout/preset-save.handler.ts` | `handlePresetSave()` (~88 lines) |
| `nxt/layout/preset-load.handler.ts` | `handlePresetLoad()` (~90 lines) |
| `nxt/layout/preset-delete.handler.ts` | `handlePresetDelete()` (~36 lines) |
| `nxt/layout/preset-rename.handler.ts` | `handlePresetRename()` (~43 lines) |
| `nxt/layout/preset-hydrate.handler.ts` | `handlePresetHydrate()` (~38 lines) |
| `nxt/layout/toggle-design.handler.ts` | `handleToggleInDesign()` (~35 lines) |
| `nxt/layout/set-main-area-count.handler.ts` | `handleMainAreaCount()` (~63 lines) |
| `nxt/layout/menu-hydrate.handler.ts` | `handleFrameworkMenuHydrate()` (~50 lines) |
| `nxt/layout/menu-reorder.handler.ts` | `handleFrameworkMenuReorderItems()` (~32 lines) |
| `nxt/layout/menu-update-config.handler.ts` | `handleFrameworkMenuUpdateConfig()` (~28 lines) |

#### Auth handler (to `nxt/auth/`):
| Target File | What to Extract |
|-------------|-----------------|
| `nxt/auth/auth-set-user.handler.ts` | `handleAuthSetUser()` (~42 lines) |

#### Workspace utils (keep in `nxt/workspace/`):
| Target File | What to Extract |
|-------------|-----------------|
| `nxt/workspace/layout-normalize.utils.ts` | `normalizeLayoutState()` (~40 lines) |
| `nxt/workspace/auth-normalize.utils.ts` | `normalizeAuthState()` (~20 lines) |
| `nxt/workspace/log-action.utils.ts` | `buildLogAction()` (~15 lines) |

---

### 7. PANEL HANDLERS (from src/domains/workspace → nxt/workspace/)

**Source:** `src/domains/workspace/handlers/workspace-panels.handlers.ts` (396 lines)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `nxt/workspace/panel-remove.handler.ts` | `removeViewHandler` |
| `nxt/workspace/panel-swap.handler.ts` | Swap logic |
| `nxt/workspace/panel-move.handler.ts` | Move logic |
| `nxt/workspace/instance-allocate.utils.ts` | `allocateViewInstance()` (~40 lines) |
| `nxt/workspace/instance-register.utils.ts` | Instance registration logic |
| `nxt/workspace/region-order.utils.ts` | `updateRegionOrder()` (~40 lines) |
| `nxt/workspace/main-view-order.handler.ts` | `applyMainViewOrder()` (~110 lines) |
| `nxt/workspace/main-view-derive.utils.ts` | `deriveMainViewOrderFromPanels()` (~6 lines) |

---

### 8. CORE HANDLERS (from src/handlers → nxt/handlers/)

**Source:** `src/handlers/state-hydrate.handler.ts` (contains all core handlers)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `nxt/handlers/context-update.handler.ts` | context/update handler |
| `nxt/handlers/context-patch.handler.ts` | context/patch handler |
| `nxt/handlers/layout-update.handler.ts` | layout/update handler |
| `nxt/handlers/panels-update.handler.ts` | panels/update handler |
| `nxt/handlers/logs-append.handler.ts` | logs/append handler (~50 lines) |
| `nxt/handlers/logs-clear.handler.ts` | logs/clear handler (~15 lines) |
| `nxt/handlers/logs-set-max.handler.ts` | logs/setMax handler |

---

### 9. CORE SINGLETON (from src/core → nxt/core/)

**Source:** `src/core/framework-singleton.ts` (365 lines)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `nxt/core/framework-configure.utils.ts` | `configure()` method logic |
| `nxt/core/framework-register.utils.ts` | `registerViews()`, `registerView()` methods |
| `nxt/core/framework-init.utils.ts` | `init()` method logic |
| `nxt/core/framework-defaults.config.ts` | Default state object |

---

### 10. LOGGING (from src/domains/logging → nxt/logging/)

**Source:** `src/domains/logging/components/LogView.ts` (293 lines)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `nxt/logging/log.styles.ts` | CSS (~165 lines) |
| `nxt/logging/log-entry.view.ts` | Entry rendering |
| `nxt/logging/log-header.view.ts` | Header with clear button |
| `nxt/logging/log-format.utils.ts` | `formatTimestamp()`, `formatData()`, `getEventType()` |

---

### 11. DOCK (from src/domains/dock → nxt/dock/)

**Source:** `src/domains/dock/components/DockContainer.ts` (281 lines)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `nxt/dock/dock-container.styles.ts` | CSS (~80 lines) |
| `nxt/dock/dock-handle.view.ts` | `renderHandle()` method |

---

### 12. PERSISTENCE (from src/utils → nxt/persistence/)

**Source:** `src/utils/firestore-persistence.ts` (250 lines)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `nxt/persistence/firestore-init.persistence.ts` | `initialize()`, `setUserId()` |
| `nxt/persistence/firestore-save.persistence.ts` | `savePreset()`, `saveAll()` |
| `nxt/persistence/firestore-load.persistence.ts` | `loadAll()`, `loadSystemPresets()` |
| `nxt/persistence/firestore-delete.persistence.ts` | `deletePreset()`, `clear()` |
| `nxt/persistence/firestore-rename.persistence.ts` | `renamePreset()` |
| `nxt/persistence/firestore-listen.persistence.ts` | `onPresetsChanged()` |

---

### 13. LAYOUT COMPONENTS (styles extraction)

| Source | Target |
|--------|--------|
| `src/domains/layout/components/CustomToolbar.ts` | `nxt/layout/admin-toolbar.styles.ts` |
| `src/domains/layout/components/ToolbarContainer.ts` | `nxt/layout/toolbar-container.styles.ts` |
| `src/domains/layout/components/ViewRegistryPanel.ts` | `nxt/layout/view-palette.styles.ts` |
| `src/domains/layout/components/SavePresetContent.ts` | `nxt/layout/save-preset.styles.ts` |
| `src/domains/layout/components/LoadPresetContent.ts` | `nxt/layout/load-preset.styles.ts` |

---

### 14. WORKSPACE COMPONENTS (styles extraction)

| Source | Target |
|--------|--------|
| `src/domains/workspace/components/ToolbarView.ts` | `nxt/workspace/toolbar.styles.ts` |
| `src/domains/workspace/components/OverlayView.ts` | `nxt/workspace/overlay.styles.ts` |

---

### 15. EFFECTS (from src/effects → nxt/effects/)

**Source:** `src/effects/` (various effect files)

**Extract to:**
| Target File | What to Extract |
|-------------|-----------------|
| `nxt/effects/auth-login.effect.ts` | Login effect |
| `nxt/effects/auth-logout.effect.ts` | Logout effect |
| `nxt/effects/preset-save.effect.ts` | Save preset effect |
| `nxt/effects/preset-load.effect.ts` | Load preset effect |
| `nxt/effects/menu-persist.effect.ts` | Menu persistence effect |

---

## AFTER SPLITTING

1. Update imports in each `nxt/` file to reference the new locations within `nxt/`
2. Update the main component files in `nxt/` to import from split files
3. Run `cd nxt && npx tsc --noEmit` to verify no errors in the new structure
4. When verified, swap folders: `mv src src-backup && mv nxt src`

---

## EXAMPLE EXTRACTION

### Before (src/domains/auth/components/AuthView.ts with everything):
```typescript
@customElement('auth-view')
export class AuthView extends LitElement {
  static styles = css`/* 165 lines of CSS */`;

  renderLoginForm() { /* 50 lines */ }
  renderSignupForm() { /* 50 lines */ }
  // ... more methods
}
```

### After (in nxt/auth/):

**nxt/auth/auth.styles.ts:**
```typescript
import { css } from 'lit';
export const authStyles = css`/* extracted CSS */`;
```

**nxt/auth/auth-login-form.view.ts:**
```typescript
import { html } from 'lit';
export function renderLoginForm(context: AuthViewContext) {
  return html`/* login form template */`;
}
```

**nxt/auth/auth.view.ts (main, ~60 lines):**
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
