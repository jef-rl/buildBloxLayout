# Framework Reorganization - Detailed File Mapping (2-Level Structure)

## Structure Rules

1. **Maximum 2 folder levels**: `src/{domain}/file.ts`
2. **~50 lines per file** (1 function per file where practical)
3. **Naming convention**: `{feature}.{type}.ts`

---

## Naming Convention

```
{feature}.{type}.ts

Types:
  .view.ts       → Lit components (UI rendering)
  .styles.ts     → CSS styles (lit css``)
  .handler.ts    → Single action handler function
  .effect.ts     → Side effect function
  .state.ts      → State definitions/initial values
  .types.ts      → TypeScript interfaces/types
  .utils.ts      → Utility/helper functions
  .registry.ts   → Registry definitions
  .config.ts     → Configuration
  .persistence.ts → Persistence operations
```

---

## Naming Corrections

| Current Name | Actual Purpose | New Name |
|--------------|----------------|----------|
| `CustomToolbar.ts` | Admin layout controls | `admin-toolbar` |
| `ViewRegistryPanel.ts` | Draggable view palette | `view-palette` |
| `Workspace.ts` | LEGACY (commented out) | DELETE |

---

## Complete New File Structure (2 Levels)

```
packages/framework/src/                    # Level 1
├── index.ts                               # Public API exports (~30 lines)
│
├── core/                                  # Level 2 - Framework core
│   ├── index.ts                           # Barrel exports (~20 lines)
│   ├── bootstrap.ts                       # Legacy bootstrap (~50 lines)
│   ├── decorators.ts                      # @view decorator (~50 lines)
│   ├── view-config.ts                     # normalizeViewConfig (~50 lines)
│   ├── defaults.ts                        # Default values (~50 lines)
│   ├── built-in-views.ts                  # Register built-ins (~50 lines)
│   ├── framework-singleton.ts             # Main singleton class (~80 lines)
│   ├── framework-configure.utils.ts       # configure() logic (~40 lines)
│   ├── framework-register.utils.ts        # registerViews() (~50 lines)
│   ├── framework-init.utils.ts            # init() logic (~50 lines)
│   ├── framework-defaults.config.ts       # Default state object (~40 lines)
│   ├── handler.registry.ts                # createHandlerRegistry (~50 lines)
│   ├── handler-dispatch.utils.ts          # Dispatch logic (~40 lines)
│   ├── view.registry.ts                   # View registry (~50 lines)
│   └── effect.registry.ts                 # Effect registry (~25 lines)
│
├── state/                                 # Level 2 - State management
│   ├── index.ts                           # Barrel (~10 lines)
│   ├── context.ts                         # Lit context (~10 lines)
│   ├── ui.state.ts                        # UIState store (~50 lines)
│   ├── ui-subscribe.state.ts              # Subscription system (~40 lines)
│   ├── context-update.utils.ts            # applyContextUpdate (~50 lines)
│   ├── state-validator.utils.ts           # validateState (~50 lines)
│   ├── state-normalize.utils.ts           # normalizeState (~40 lines)
│   └── selectors.ts                       # State selectors (~20 lines)
│
├── types/                                 # Level 2 - Type definitions
│   ├── index.ts                           # Barrel (~15 lines)
│   ├── core.types.ts                      # ToolbarPos, ViewportWidthMode (~40 lines)
│   ├── state.types.ts                     # UIState interface (~50 lines)
│   ├── layout.types.ts                    # LayoutState (~40 lines)
│   ├── auth.types.ts                      # AuthState (~30 lines)
│   ├── panel.types.ts                     # PanelState (~40 lines)
│   ├── log.types.ts                       # LogState, LogEntry (~30 lines)
│   ├── menu.types.ts                      # FrameworkMenuItem (~30 lines)
│   ├── preset.types.ts                    # LayoutPreset (~30 lines)
│   ├── view.types.ts                      # ViewDefinition (~40 lines)
│   └── events.types.ts                    # Event types (~20 lines)
│
├── utils/                                 # Level 2 - Utilities
│   ├── index.ts                           # Barrel (~15 lines)
│   ├── dispatcher.ts                      # dispatchUiEvent (~20 lines)
│   ├── logger.ts                          # Framework logger (~20 lines)
│   ├── helpers.ts                         # General helpers (~20 lines)
│   └── expansion.utils.ts                 # Expansion helpers (~50 lines)
│
├── persistence/                           # Level 2 - Persistence layer
│   ├── index.ts                           # Barrel (~15 lines)
│   ├── local.persistence.ts               # localStorage API (~50 lines)
│   ├── local-read.persistence.ts          # Read from localStorage (~30 lines)
│   ├── local-write.persistence.ts         # Write to localStorage (~30 lines)
│   ├── firestore.persistence.ts           # Main Firestore API (~40 lines)
│   ├── firestore-init.persistence.ts      # initialize(), setUserId() (~20 lines)
│   ├── firestore-save.persistence.ts      # savePreset(), saveAll() (~50 lines)
│   ├── firestore-load.persistence.ts      # loadAll(), loadSystemPresets() (~50 lines)
│   ├── firestore-delete.persistence.ts    # deletePreset(), clear() (~30 lines)
│   ├── firestore-rename.persistence.ts    # renamePreset() (~30 lines)
│   ├── firestore-listen.persistence.ts    # onPresetsChanged() (~30 lines)
│   ├── hybrid.persistence.ts              # Hybrid API object (~40 lines)
│   ├── hybrid-sync.persistence.ts         # Sync logic (~50 lines)
│   ├── hybrid-merge.persistence.ts        # Merge strategies (~40 lines)
│   └── menu.persistence.ts                # Menu persistence (~50 lines)
│
├── handlers/                              # Level 2 - Core handlers
│   ├── index.ts                           # Barrel + registerCoreHandlers (~30 lines)
│   ├── state-hydrate.handler.ts           # state/hydrate (~40 lines)
│   ├── context-update.handler.ts          # context/update (~30 lines)
│   ├── context-patch.handler.ts           # context/patch (~25 lines)
│   ├── layout-update.handler.ts           # layout/update (~25 lines)
│   ├── panels-update.handler.ts           # panels/update (~40 lines)
│   ├── logs-append.handler.ts             # logs/append (~50 lines)
│   ├── logs-clear.handler.ts              # logs/clear (~15 lines)
│   └── logs-set-max.handler.ts            # logs/setMax (~25 lines)
│
├── effects/                               # Level 2 - Side effects
│   ├── index.ts                           # Barrel + registerEffects (~20 lines)
│   ├── auth-state-changed.effect.ts       # Auth state effect (~40 lines)
│   ├── auth-login.effect.ts               # Login effect (~30 lines)
│   ├── auth-logout.effect.ts              # Logout effect (~25 lines)
│   ├── preset-save.effect.ts              # Save preset effect (~40 lines)
│   ├── preset-load.effect.ts              # Load preset effect (~30 lines)
│   └── menu-persist.effect.ts             # Menu persistence effect (~30 lines)
│
├── auth/                                  # Level 2 - Auth domain
│   ├── index.ts                           # Barrel (~15 lines)
│   ├── auth.view.ts                       # Main AuthView container (~60 lines)
│   ├── auth.styles.ts                     # Auth CSS (~80 lines)
│   ├── auth-login-form.view.ts            # Login form (~50 lines)
│   ├── auth-signup-form.view.ts           # Signup form (~50 lines)
│   ├── auth-reset-form.view.ts            # Password reset (~40 lines)
│   ├── auth-profile.view.ts               # Profile display (~40 lines)
│   ├── auth-social-buttons.view.ts        # OAuth buttons (~40 lines)
│   ├── auth-message.view.ts               # Error/success messages (~30 lines)
│   ├── auth-login.handler.ts              # Login handler (~40 lines)
│   ├── auth-signup.handler.ts             # Signup handler (~40 lines)
│   ├── auth-logout.handler.ts             # Logout handler (~25 lines)
│   ├── auth-reset.handler.ts              # Password reset handler (~30 lines)
│   ├── auth-set-user.handler.ts           # Set user handler (~40 lines)
│   ├── auth-firebase.utils.ts             # Firebase auth config (~50 lines)
│   ├── auth-state-listener.utils.ts       # Auth state listener (~40 lines)
│   ├── auth-validate.utils.ts             # Validation helpers (~30 lines)
│   └── auth-menu-items.utils.ts           # Menu item generation (~50 lines)
│
├── dock/                                  # Level 2 - Dock domain
│   ├── index.ts                           # Barrel (~15 lines)
│   ├── dock-container.view.ts             # Main container (~60 lines)
│   ├── dock-container.styles.ts           # Container CSS (~80 lines)
│   ├── dock-handle.view.ts                # Position picker handle (~40 lines)
│   ├── dock-manager.view.ts               # Dock manager (~50 lines)
│   ├── position-picker.view.ts            # Position picker UI (~60 lines)
│   ├── dock-set-position.handler.ts       # Set position (~30 lines)
│   ├── dock-toggle.handler.ts             # Toggle dock (~25 lines)
│   ├── dock.types.ts                      # Dock types (~20 lines)
│   ├── dock-positions.utils.ts            # Position calculations (~40 lines)
│   └── dock-layout.utils.ts               # Layout helpers (~30 lines)
│
├── layout/                                # Level 2 - Layout domain
│   ├── index.ts                           # Barrel (~20 lines)
│   │
│   │ # Menu components
│   ├── menu.view.ts                       # Main menu component (~60 lines)
│   ├── menu.styles.ts                     # Menu CSS (~100 lines)
│   ├── menu-header.view.ts                # Menu header (~30 lines)
│   ├── menu-item-parent.view.ts           # Parent item (~40 lines)
│   ├── menu-item-preset.view.ts           # Preset item (~40 lines)
│   ├── menu-item-action.view.ts           # Action item (~40 lines)
│   ├── menu-icons.utils.ts                # Icon rendering (~50 lines)
│   ├── menu-drag.utils.ts                 # Drag handlers (~50 lines)
│   ├── menu-hydrate.handler.ts            # Hydrate menu (~40 lines)
│   ├── menu-reorder.handler.ts            # Reorder items (~30 lines)
│   ├── menu-update-config.handler.ts      # Update config (~25 lines)
│   │
│   │ # Preset components
│   ├── save-preset.view.ts                # Save dialog (~60 lines)
│   ├── save-preset.styles.ts              # Save CSS (~60 lines)
│   ├── save-preset-form.view.ts           # Save form (~50 lines)
│   ├── load-preset.view.ts                # Load dialog (~60 lines)
│   ├── load-preset.styles.ts              # Load CSS (~60 lines)
│   ├── load-preset-list.view.ts           # Preset list (~50 lines)
│   ├── preset-save.handler.ts             # Save preset (~50 lines)
│   ├── preset-load.handler.ts             # Load preset (~50 lines)
│   ├── preset-delete.handler.ts           # Delete preset (~30 lines)
│   ├── preset-rename.handler.ts           # Rename preset (~35 lines)
│   ├── preset-hydrate.handler.ts          # Hydrate presets (~35 lines)
│   │
│   │ # Admin toolbar (was CustomToolbar)
│   ├── admin-toolbar.view.ts              # Admin controls (~60 lines)
│   ├── admin-toolbar.styles.ts            # Admin CSS (~50 lines)
│   ├── admin-toolbar-buttons.view.ts      # Button rendering (~50 lines)
│   ├── admin-toolbar-actions.utils.ts     # Action dispatchers (~40 lines)
│   │
│   │ # Toolbar container
│   ├── toolbar-container.view.ts          # Toolbar wrapper (~50 lines)
│   ├── toolbar-container.styles.ts        # Container CSS (~40 lines)
│   │
│   │ # View palette (was ViewRegistryPanel)
│   ├── view-palette.view.ts               # View palette (~60 lines)
│   ├── view-palette.styles.ts             # Palette CSS (~60 lines)
│   ├── view-palette-item.view.ts          # Single item (~40 lines)
│   │
│   │ # Layout handlers
│   ├── toggle-design.handler.ts           # Toggle design mode (~35 lines)
│   ├── set-expansion.handler.ts           # Set expander state (~30 lines)
│   ├── set-viewport-mode.handler.ts       # Set viewport mode (~25 lines)
│   ├── set-main-area-count.handler.ts     # Set main area count (~50 lines)
│   ├── set-overlay.handler.ts             # Set overlay view (~25 lines)
│   ├── view-instances.handler.ts          # View instance management (~50 lines)
│   └── drag.handler.ts                    # Drag handlers (~30 lines)
│
├── logging/                               # Level 2 - Logging domain
│   ├── index.ts                           # Barrel (~10 lines)
│   ├── log.view.ts                        # Main log view (~60 lines)
│   ├── log.styles.ts                      # Log CSS (~80 lines)
│   ├── log-entry.view.ts                  # Single entry (~40 lines)
│   ├── log-header.view.ts                 # Header with clear (~30 lines)
│   ├── log-format.utils.ts                # Formatting helpers (~40 lines)
│   └── log-filter.utils.ts                # Filtering logic (~30 lines)
│
├── workspace/                             # Level 2 - Workspace domain
│   ├── index.ts                           # Barrel (~20 lines)
│   │
│   │ # Workspace root
│   ├── workspace-root.view.ts             # Main layout (~70 lines)
│   ├── workspace-root.styles.ts           # Root CSS (~100 lines)
│   ├── workspace-regions.view.ts          # Region rendering (~50 lines)
│   ├── workspace-main-area.view.ts        # Main grid (~50 lines)
│   ├── workspace-side-panel.view.ts       # Side panels (~50 lines)
│   ├── workspace-sash.view.ts             # Toggle sashes (~40 lines)
│   ├── workspace-drop-zone.view.ts        # Drop zones (~40 lines)
│   ├── workspace-transitions.utils.ts     # Transition logic (~40 lines)
│   │
│   │ # Panel
│   ├── panel.view.ts                      # Main panel view (~70 lines)
│   ├── panel.styles.ts                    # Panel CSS (~60 lines)
│   ├── panel-content.view.ts              # View rendering (~50 lines)
│   ├── panel-overlay.view.ts              # Design overlay (~50 lines)
│   ├── panel-drag.utils.ts                # Drag handling (~50 lines)
│   ├── panel-drop.utils.ts                # Drop handling (~40 lines)
│   ├── panel-load.utils.ts                # View loading (~50 lines)
│   │
│   │ # Toolbar
│   ├── toolbar.view.ts                    # Toolbar view (~60 lines)
│   ├── toolbar.styles.ts                  # Toolbar CSS (~50 lines)
│   ├── toolbar-items.view.ts              # Item rendering (~40 lines)
│   │
│   │ # Overlay
│   ├── overlay.view.ts                    # Overlay layer (~60 lines)
│   ├── overlay.styles.ts                  # Overlay CSS (~50 lines)
│   ├── overlay-backdrop.view.ts           # Backdrop click (~30 lines)
│   │
│   │ # Handlers
│   ├── register-handlers.ts               # registerWorkspaceHandlers (~40 lines)
│   ├── panel-assign.handler.ts            # Assign view to panel (~50 lines)
│   ├── panel-remove.handler.ts            # Remove view (~40 lines)
│   ├── panel-swap.handler.ts              # Swap views (~40 lines)
│   ├── panel-move.handler.ts              # Move view (~40 lines)
│   ├── instance-allocate.utils.ts         # Allocate instance (~40 lines)
│   ├── instance-register.utils.ts         # Register instance (~30 lines)
│   ├── region-order.utils.ts              # Update region order (~40 lines)
│   ├── main-view-order.handler.ts         # Apply main view order (~60 lines)
│   ├── main-view-derive.utils.ts          # Derive order from panels (~30 lines)
│   ├── layout-normalize.utils.ts          # Normalize layout state (~50 lines)
│   ├── auth-normalize.utils.ts            # Normalize auth state (~30 lines)
│   ├── session-reset.handler.ts           # Reset session (~40 lines)
│   ├── scope-mode.handler.ts              # Set scope mode (~30 lines)
│   └── log-action.utils.ts                # Build log action (~30 lines)
│
├── components/                            # Level 2 - Shared components
│   ├── index.ts                           # Barrel (~15 lines)
│   ├── framework-root.view.ts             # Main component (~70 lines)
│   ├── framework-root.styles.ts           # Root CSS (~30 lines)
│   ├── framework-context.view.ts          # Context provider (~50 lines)
│   ├── framework-dispatch.utils.ts        # Dispatch pipeline (~60 lines)
│   ├── framework-effects.utils.ts         # Effect execution (~40 lines)
│   ├── framework-firestore.utils.ts       # Firestore setup (~50 lines)
│   ├── framework-auth.utils.ts            # Auth setup (~40 lines)
│   ├── view-token.view.ts                 # ViewToken (~50 lines)
│   └── icons.ts                           # Icon definitions (~40 lines)
│
└── config/                                # Level 2 - Configuration
    └── admin-emails.config.ts             # Admin email list (~20 lines)
```

---

## FILE COUNT SUMMARY

| Domain | Files |
|--------|-------|
| core/ | 15 |
| state/ | 8 |
| types/ | 11 |
| utils/ | 5 |
| persistence/ | 15 |
| handlers/ | 9 |
| effects/ | 7 |
| auth/ | 18 |
| dock/ | 11 |
| layout/ | 37 |
| logging/ | 7 |
| workspace/ | 38 |
| components/ | 10 |
| config/ | 1 |
| **TOTAL** | **~192 files** |

---

## SOURCE → TARGET MAPPING

### From `domains/workspace/handlers/registry.ts` (904 lines) → Multiple domains

| Function | New Location |
|----------|--------------|
| `registerWorkspaceHandlers()` | `workspace/register-handlers.ts` |
| `handleToggleInDesign()` | `layout/toggle-design.handler.ts` |
| `handleMainAreaCount()` | `layout/set-main-area-count.handler.ts` |
| `handlePresetSave()` | `layout/preset-save.handler.ts` |
| `handlePresetLoad()` | `layout/preset-load.handler.ts` |
| `handlePresetDelete()` | `layout/preset-delete.handler.ts` |
| `handlePresetRename()` | `layout/preset-rename.handler.ts` |
| `handlePresetHydrate()` | `layout/preset-hydrate.handler.ts` |
| `handleAuthSetUser()` | `auth/auth-set-user.handler.ts` |
| `handleFrameworkMenuHydrate()` | `layout/menu-hydrate.handler.ts` |
| `handleFrameworkMenuReorderItems()` | `layout/menu-reorder.handler.ts` |
| `handleFrameworkMenuUpdateConfig()` | `layout/menu-update-config.handler.ts` |
| `normalizeLayoutState()` | `workspace/layout-normalize.utils.ts` |
| `normalizeAuthState()` | `workspace/auth-normalize.utils.ts` |
| `buildLogAction()` | `workspace/log-action.utils.ts` |

### From `domains/auth/components/AuthView.ts` (547 lines) → `auth/`

| Section | New File |
|---------|----------|
| Main component | `auth/auth.view.ts` |
| CSS styles | `auth/auth.styles.ts` |
| Login form | `auth/auth-login-form.view.ts` |
| Signup form | `auth/auth-signup-form.view.ts` |
| Reset form | `auth/auth-reset-form.view.ts` |
| Profile | `auth/auth-profile.view.ts` |
| Social buttons | `auth/auth-social-buttons.view.ts` |
| Messages | `auth/auth-message.view.ts` |

### From `layout/components/FrameworkMenu.ts` (478 lines) → `layout/`

| Section | New File |
|---------|----------|
| Main component | `layout/menu.view.ts` |
| CSS styles | `layout/menu.styles.ts` |
| Header | `layout/menu-header.view.ts` |
| Parent item | `layout/menu-item-parent.view.ts` |
| Preset item | `layout/menu-item-preset.view.ts` |
| Action item | `layout/menu-item-action.view.ts` |
| Icons | `layout/menu-icons.utils.ts` |
| Drag | `layout/menu-drag.utils.ts` |

### From `workspace/components/WorkspaceRoot.ts` (457 lines) → `workspace/`

| Section | New File |
|---------|----------|
| Main component | `workspace/workspace-root.view.ts` |
| CSS styles | `workspace/workspace-root.styles.ts` |
| Regions | `workspace/workspace-regions.view.ts` |
| Main area | `workspace/workspace-main-area.view.ts` |
| Side panel | `workspace/workspace-side-panel.view.ts` |
| Sash | `workspace/workspace-sash.view.ts` |
| Drop zones | `workspace/workspace-drop-zone.view.ts` |
| Transitions | `workspace/workspace-transitions.utils.ts` |

### From `components/FrameworkRoot.ts` (441 lines) → `components/`

| Section | New File |
|---------|----------|
| Main component | `components/framework-root.view.ts` |
| CSS styles | `components/framework-root.styles.ts` |
| Context | `components/framework-context.view.ts` |
| Dispatch | `components/framework-dispatch.utils.ts` |
| Effects | `components/framework-effects.utils.ts` |
| Firestore | `components/framework-firestore.utils.ts` |
| Auth | `components/framework-auth.utils.ts` |

### From `workspace/components/PanelView.ts` (402 lines) → `workspace/`

| Section | New File |
|---------|----------|
| Main component | `workspace/panel.view.ts` |
| CSS styles | `workspace/panel.styles.ts` |
| Content | `workspace/panel-content.view.ts` |
| Overlay | `workspace/panel-overlay.view.ts` |
| Drag | `workspace/panel-drag.utils.ts` |
| Drop | `workspace/panel-drop.utils.ts` |
| Load | `workspace/panel-load.utils.ts` |

### From `workspace/handlers/workspace-panels.handlers.ts` (395 lines) → `workspace/`

| Section | New File |
|---------|----------|
| assignViewHandler | `workspace/panel-assign.handler.ts` |
| removeViewHandler | `workspace/panel-remove.handler.ts` |
| Swap logic | `workspace/panel-swap.handler.ts` |
| Move logic | `workspace/panel-move.handler.ts` |
| allocateViewInstance | `workspace/instance-allocate.utils.ts` |
| Register instance | `workspace/instance-register.utils.ts` |
| updateRegionOrder | `workspace/region-order.utils.ts` |
| applyMainViewOrder | `workspace/main-view-order.handler.ts` |
| deriveMainViewOrderFromPanels | `workspace/main-view-derive.utils.ts` |

### From `core/framework-singleton.ts` (364 lines) → `core/`

| Section | New File |
|---------|----------|
| Main class | `core/framework-singleton.ts` |
| configure() | `core/framework-configure.utils.ts` |
| registerViews() | `core/framework-register.utils.ts` |
| init() | `core/framework-init.utils.ts` |
| Default state | `core/framework-defaults.config.ts` |

### From `core/registry/handler-registry.ts` (294 lines) → `core/` + `handlers/`

| Section | New File |
|---------|----------|
| createHandlerRegistry | `core/handler.registry.ts` |
| Dispatch logic | `core/handler-dispatch.utils.ts` |
| state/hydrate | `handlers/state-hydrate.handler.ts` |
| context/update | `handlers/context-update.handler.ts` |
| context/patch | `handlers/context-patch.handler.ts` |
| layout/update | `handlers/layout-update.handler.ts` |
| panels/update | `handlers/panels-update.handler.ts` |
| logs/append | `handlers/logs-append.handler.ts` |
| logs/clear | `handlers/logs-clear.handler.ts` |
| logs/setMax | `handlers/logs-set-max.handler.ts` |

### From `domains/logging/components/LogView.ts` (292 lines) → `logging/`

| Section | New File |
|---------|----------|
| Main component | `logging/log.view.ts` |
| CSS styles | `logging/log.styles.ts` |
| Entry | `logging/log-entry.view.ts` |
| Header | `logging/log-header.view.ts` |
| Format | `logging/log-format.utils.ts` |
| Filter | `logging/log-filter.utils.ts` |

### From `domains/dock/components/DockContainer.ts` (280 lines) → `dock/`

| Section | New File |
|---------|----------|
| Main component | `dock/dock-container.view.ts` |
| CSS styles | `dock/dock-container.styles.ts` |
| Handle | `dock/dock-handle.view.ts` |
| Manager | `dock/dock-manager.view.ts` |
| Position picker | `dock/position-picker.view.ts` |
| Positions | `dock/dock-positions.utils.ts` |

### From `utils/firestore-persistence.ts` (249 lines) → `persistence/`

| Section | New File |
|---------|----------|
| Main API | `persistence/firestore.persistence.ts` |
| Initialize | `persistence/firestore-init.persistence.ts` |
| Save | `persistence/firestore-save.persistence.ts` |
| Load | `persistence/firestore-load.persistence.ts` |
| Delete | `persistence/firestore-delete.persistence.ts` |
| Rename | `persistence/firestore-rename.persistence.ts` |
| Listen | `persistence/firestore-listen.persistence.ts` |

### RENAMED FILES

| Old Path | New Path |
|----------|----------|
| `layout/components/CustomToolbar.ts` | `layout/admin-toolbar.view.ts` |
| `layout/components/ViewRegistryPanel.ts` | `layout/view-palette.view.ts` |

### DELETE

| File | Reason |
|------|--------|
| `domains/layout/components/Workspace.ts` | Entirely commented out (legacy) |

---

## IMPORT PATH EXAMPLES

### Before (4 levels)
```typescript
import { AuthView } from './domains/auth/components/AuthView';
import { WorkspaceRoot } from './domains/workspace/components/WorkspaceRoot';
import { registerHandlers } from './domains/workspace/handlers/registry';
import { DockContainer } from './domains/dock/components/DockContainer';
```

### After (2 levels)
```typescript
import { AuthView } from './auth/auth.view';
import { WorkspaceRoot } from './workspace/workspace-root.view';
import { registerWorkspaceHandlers } from './workspace/register-handlers';
import { DockContainer } from './dock/dock-container.view';
```

---

## VERIFICATION COMMANDS

```bash
# Check folder depth (should show max 2)
find src -type d | awk -F/ '{print NF-1, $0}' | sort -rn | head -20

# Check file line counts (target ~50, max 80)
find src -name "*.ts" -exec wc -l {} \; | sort -rn | head -20

# Count total files
find src -name "*.ts" | wc -l

# TypeScript compile check
npx tsc --noEmit
```
