# Framework Reorganization - Detailed File Mapping

## Naming Corrections Identified

| Current Name | Actual Purpose | New Name |
|--------------|----------------|----------|
| `CustomToolbar.ts` | Admin layout controls (presets, design mode, expanders) | `admin-toolbar` |
| `Workspace.ts` | LEGACY - Completely commented out | DELETE |
| `ToolbarContainer.ts` | Generic toolbar container wrapper | `toolbar-container` |
| `ViewRegistryPanel.ts` | View palette for drag-drop | `view-palette` |
| `handler-registry.ts` | Core handlers + registry factory | Split: `handler.registry` + `core.handler` |

---

## Complete New File Structure

### Naming Convention
```
{domain}-{feature}.{type}.ts

Types:
  .view.ts      → Lit components (render UI)
  .handler.ts   → Single action handler function
  .effect.ts    → Side effect function
  .state.ts     → State definitions/initial values
  .types.ts     → TypeScript interfaces/types
  .utils.ts     → Utility/helper functions
  .styles.ts    → CSS styles (lit css``)
  .registry.ts  → Registry definitions
  .config.ts    → Configuration
```

---

## COMPLETE FILE LIST (New Structure)

```
packages/framework/src/                          # Level 1
├── index.ts                                     # Public API (~30 lines)
│
├── core/                                        # Level 2
│   ├── index.ts                                 # Barrel exports (~15 lines)
│   ├── bootstrap.ts                             # Legacy bootstrap (~50 lines)
│   ├── decorators.ts                            # @view decorator (~50 lines)
│   ├── view-config.ts                           # normalizeViewConfig (~50 lines)
│   ├── defaults.ts                              # Default values (~50 lines)
│   ├── built-in-views.ts                        # Register built-ins (~50 lines)
│   │
│   ├── singleton/                               # Level 3 - Framework singleton
│   │   ├── index.ts                             # Barrel (~10 lines)
│   │   ├── framework.singleton.ts               # Main class (~80 lines)
│   │   ├── framework-configure.utils.ts         # configure() logic (~40 lines)
│   │   ├── framework-register.utils.ts          # registerViews() (~50 lines)
│   │   ├── framework-init.utils.ts              # init() logic (~50 lines)
│   │   └── framework-defaults.config.ts         # Default state (~40 lines)
│   │
│   └── registry/                                # Level 3 - Registries
│       ├── index.ts                             # Barrel (~10 lines)
│       ├── handler.registry.ts                  # createHandlerRegistry (~50 lines)
│       ├── handler-dispatch.utils.ts            # Dispatch logic (~40 lines)
│       ├── view.registry.ts                     # View registry (~50 lines)
│       └── effect.registry.ts                   # Effect registry (~25 lines)
│
├── state/                                       # Level 2
│   ├── index.ts                                 # Barrel (~10 lines)
│   ├── context.ts                               # Lit context (~10 lines)
│   ├── ui.state.ts                              # UIState store (~50 lines)
│   ├── ui-subscribe.state.ts                    # Subscription system (~40 lines)
│   ├── context-update.utils.ts                  # applyContextUpdate (~50 lines)
│   ├── state-validator.utils.ts                 # validateState (~50 lines)
│   ├── state-normalize.utils.ts                 # normalizeState (~40 lines)
│   └── selectors.ts                             # State selectors (~20 lines)
│
├── types/                                       # Level 2
│   ├── index.ts                                 # Barrel (~15 lines)
│   ├── core.types.ts                            # ToolbarPos, ViewportWidthMode (~40 lines)
│   ├── state.types.ts                           # UIState interface (~50 lines)
│   ├── layout.types.ts                          # LayoutState (~40 lines)
│   ├── auth.types.ts                            # AuthState (~30 lines)
│   ├── panel.types.ts                           # PanelState (~40 lines)
│   ├── log.types.ts                             # LogState, LogEntry (~30 lines)
│   ├── menu.types.ts                            # FrameworkMenuItem (~30 lines)
│   ├── preset.types.ts                          # LayoutPreset (~30 lines)
│   ├── view.types.ts                            # ViewDefinition (~40 lines)
│   └── events.types.ts                          # Event types (~20 lines)
│
├── utils/                                       # Level 2
│   ├── index.ts                                 # Barrel (~15 lines)
│   ├── dispatcher.ts                            # dispatchUiEvent (~20 lines)
│   ├── logger.ts                                # Framework logger (~20 lines)
│   ├── helpers.ts                               # General helpers (~20 lines)
│   └── expansion.utils.ts                       # Expansion helpers (~50 lines)
│
├── persistence/                                 # Level 2
│   ├── index.ts                                 # Barrel (~15 lines)
│   ├── local.persistence.ts                     # localStorage API (~50 lines)
│   ├── local-read.persistence.ts                # Read from localStorage (~30 lines)
│   ├── local-write.persistence.ts               # Write to localStorage (~30 lines)
│   │
│   ├── firestore/                               # Level 3
│   │   ├── index.ts                             # Barrel (~10 lines)
│   │   ├── firestore.persistence.ts             # Main API object (~40 lines)
│   │   ├── firestore-init.persistence.ts        # Initialize (~20 lines)
│   │   ├── firestore-save.persistence.ts        # Save operations (~50 lines)
│   │   ├── firestore-load.persistence.ts        # Load operations (~50 lines)
│   │   ├── firestore-delete.persistence.ts      # Delete operations (~30 lines)
│   │   ├── firestore-rename.persistence.ts      # Rename preset (~30 lines)
│   │   └── firestore-listen.persistence.ts      # Real-time listener (~30 lines)
│   │
│   ├── hybrid.persistence.ts                    # Hybrid API (~40 lines)
│   ├── hybrid-sync.persistence.ts               # Sync logic (~50 lines)
│   ├── hybrid-merge.persistence.ts              # Merge strategies (~40 lines)
│   └── menu.persistence.ts                      # Menu persistence (~50 lines)
│
├── handlers/                                    # Level 2 - Core handlers
│   ├── index.ts                                 # Barrel + registerCoreHandlers (~30 lines)
│   ├── state-hydrate.handler.ts                 # state/hydrate (~40 lines)
│   ├── context-update.handler.ts                # context/update (~30 lines)
│   ├── context-patch.handler.ts                 # context/patch (~25 lines)
│   ├── layout-update.handler.ts                 # layout/update (~25 lines)
│   ├── panels-update.handler.ts                 # panels/update (~40 lines)
│   ├── logs-append.handler.ts                   # logs/append (~50 lines)
│   ├── logs-clear.handler.ts                    # logs/clear (~15 lines)
│   └── logs-set-max.handler.ts                  # logs/setMax (~25 lines)
│
├── effects/                                     # Level 2
│   ├── index.ts                                 # Barrel + registerEffects (~20 lines)
│   ├── auth-state-changed.effect.ts             # Auth state effect (~40 lines)
│   ├── auth-login.effect.ts                     # Login effect (~30 lines)
│   ├── auth-logout.effect.ts                    # Logout effect (~25 lines)
│   ├── preset-save.effect.ts                    # Save preset effect (~40 lines)
│   ├── preset-load.effect.ts                    # Load preset effect (~30 lines)
│   └── menu-persist.effect.ts                   # Menu persistence effect (~30 lines)
│
├── auth/                                        # Level 2 - Auth domain
│   ├── index.ts                                 # Barrel (~15 lines)
│   │
│   ├── views/                                   # Level 3
│   │   ├── index.ts                             # Barrel (~10 lines)
│   │   ├── auth.view.ts                         # Main AuthView container (~60 lines)
│   │   ├── auth.styles.ts                       # Auth CSS (~80 lines)
│   │   ├── auth-login-form.view.ts              # Login form (~50 lines)
│   │   ├── auth-signup-form.view.ts             # Signup form (~50 lines)
│   │   ├── auth-reset-form.view.ts              # Password reset (~40 lines)
│   │   ├── auth-profile.view.ts                 # Profile display (~40 lines)
│   │   ├── auth-social-buttons.view.ts          # OAuth buttons (~40 lines)
│   │   └── auth-message.view.ts                 # Error/success messages (~30 lines)
│   │
│   ├── auth-login.handler.ts                    # Login handler (~40 lines)
│   ├── auth-signup.handler.ts                   # Signup handler (~40 lines)
│   ├── auth-logout.handler.ts                   # Logout handler (~25 lines)
│   ├── auth-reset.handler.ts                    # Password reset handler (~30 lines)
│   ├── auth-set-user.handler.ts                 # Set user handler (~40 lines)
│   │
│   ├── auth-firebase.utils.ts                   # Firebase auth config (~50 lines)
│   ├── auth-state-listener.utils.ts             # Auth state listener (~40 lines)
│   ├── auth-validate.utils.ts                   # Validation helpers (~30 lines)
│   └── auth-menu-items.utils.ts                 # Menu item generation (~50 lines)
│
├── dock/                                        # Level 2 - Dock domain
│   ├── index.ts                                 # Barrel (~15 lines)
│   │
│   ├── views/                                   # Level 3
│   │   ├── index.ts                             # Barrel (~10 lines)
│   │   ├── dock-container.view.ts               # Main container (~60 lines)
│   │   ├── dock-container.styles.ts             # Container CSS (~80 lines)
│   │   ├── dock-handle.view.ts                  # Position picker handle (~40 lines)
│   │   ├── dock-manager.view.ts                 # Dock manager (~50 lines)
│   │   └── position-picker.view.ts              # Position picker UI (~60 lines)
│   │
│   ├── dock-set-position.handler.ts             # Set position (~30 lines)
│   ├── dock-toggle.handler.ts                   # Toggle dock (~25 lines)
│   │
│   ├── dock.types.ts                            # Dock types (~20 lines)
│   ├── dock-positions.utils.ts                  # Position calculations (~40 lines)
│   └── dock-layout.utils.ts                     # Layout helpers (~30 lines)
│
├── layout/                                      # Level 2 - Layout domain
│   ├── index.ts                                 # Barrel (~20 lines)
│   │
│   ├── menu/                                    # Level 3 - Framework menu
│   │   ├── index.ts                             # Barrel (~10 lines)
│   │   ├── menu.view.ts                         # Main menu component (~60 lines)
│   │   ├── menu.styles.ts                       # Menu CSS (~100 lines)
│   │   ├── menu-header.view.ts                  # Menu header (~30 lines)
│   │   ├── menu-item-parent.view.ts             # Parent item (~40 lines)
│   │   ├── menu-item-preset.view.ts             # Preset item (~40 lines)
│   │   ├── menu-item-action.view.ts             # Action item (~40 lines)
│   │   ├── menu-icons.utils.ts                  # Icon rendering (~50 lines)
│   │   ├── menu-drag.utils.ts                   # Drag handlers (~50 lines)
│   │   ├── menu-hydrate.handler.ts              # Hydrate menu (~40 lines)
│   │   ├── menu-reorder.handler.ts              # Reorder items (~30 lines)
│   │   └── menu-update-config.handler.ts        # Update config (~25 lines)
│   │
│   ├── presets/                                 # Level 3 - Preset management
│   │   ├── index.ts                             # Barrel (~10 lines)
│   │   ├── save-preset.view.ts                  # Save dialog (~60 lines)
│   │   ├── save-preset.styles.ts                # Save CSS (~60 lines)
│   │   ├── save-preset-form.view.ts             # Save form (~50 lines)
│   │   ├── load-preset.view.ts                  # Load dialog (~60 lines)
│   │   ├── load-preset.styles.ts                # Load CSS (~60 lines)
│   │   ├── load-preset-list.view.ts             # Preset list (~50 lines)
│   │   ├── preset-save.handler.ts               # Save preset (~50 lines)
│   │   ├── preset-load.handler.ts               # Load preset (~50 lines)
│   │   ├── preset-delete.handler.ts             # Delete preset (~30 lines)
│   │   ├── preset-rename.handler.ts             # Rename preset (~35 lines)
│   │   └── preset-hydrate.handler.ts            # Hydrate presets (~35 lines)
│   │
│   ├── admin-toolbar.view.ts                    # Admin controls (was CustomToolbar) (~60 lines)
│   ├── admin-toolbar.styles.ts                  # Admin CSS (~50 lines)
│   ├── admin-toolbar-buttons.view.ts            # Button rendering (~50 lines)
│   ├── admin-toolbar-actions.utils.ts           # Action dispatchers (~40 lines)
│   │
│   ├── toolbar-container.view.ts                # Toolbar wrapper (~50 lines)
│   ├── toolbar-container.styles.ts              # Container CSS (~40 lines)
│   │
│   ├── view-palette.view.ts                     # View palette (was ViewRegistryPanel) (~60 lines)
│   ├── view-palette.styles.ts                   # Palette CSS (~60 lines)
│   ├── view-palette-item.view.ts                # Single palette item (~40 lines)
│   │
│   ├── toggle-design.handler.ts                 # Toggle design mode (~35 lines)
│   ├── set-expansion.handler.ts                 # Set expander state (~30 lines)
│   ├── set-viewport-mode.handler.ts             # Set viewport mode (~25 lines)
│   ├── set-main-area-count.handler.ts           # Set main area count (~50 lines)
│   ├── set-overlay.handler.ts                   # Set overlay view (~25 lines)
│   ├── view-instances.handler.ts                # View instance management (~50 lines)
│   └── drag.handler.ts                          # Drag handlers (~30 lines)
│
├── logging/                                     # Level 2 - Logging domain
│   ├── index.ts                                 # Barrel (~10 lines)
│   ├── log.view.ts                              # Main log view (~60 lines)
│   ├── log.styles.ts                            # Log CSS (~80 lines)
│   ├── log-entry.view.ts                        # Single entry (~40 lines)
│   ├── log-header.view.ts                       # Header with clear (~30 lines)
│   ├── log-format.utils.ts                      # Formatting helpers (~40 lines)
│   └── log-filter.utils.ts                      # Filtering logic (~30 lines)
│
├── workspace/                                   # Level 2 - Workspace domain
│   ├── index.ts                                 # Barrel (~20 lines)
│   │
│   ├── root/                                    # Level 3 - Workspace root
│   │   ├── index.ts                             # Barrel (~10 lines)
│   │   ├── workspace-root.view.ts               # Main layout (~70 lines)
│   │   ├── workspace-root.styles.ts             # Root CSS (~100 lines)
│   │   ├── workspace-regions.view.ts            # Region rendering (~50 lines)
│   │   ├── workspace-main-area.view.ts          # Main grid (~50 lines)
│   │   ├── workspace-side-panel.view.ts         # Side panels (~50 lines)
│   │   ├── workspace-sash.view.ts               # Toggle sashes (~40 lines)
│   │   ├── workspace-drop-zone.view.ts          # Drop zones (~40 lines)
│   │   └── workspace-transitions.utils.ts       # Transition logic (~40 lines)
│   │
│   ├── panel/                                   # Level 3 - Panel rendering
│   │   ├── index.ts                             # Barrel (~10 lines)
│   │   ├── panel.view.ts                        # Main panel view (~70 lines)
│   │   ├── panel.styles.ts                      # Panel CSS (~60 lines)
│   │   ├── panel-content.view.ts                # View rendering (~50 lines)
│   │   ├── panel-overlay.view.ts                # Design overlay (~50 lines)
│   │   ├── panel-drag.utils.ts                  # Drag handling (~50 lines)
│   │   ├── panel-drop.utils.ts                  # Drop handling (~40 lines)
│   │   └── panel-load.utils.ts                  # View loading (~50 lines)
│   │
│   ├── toolbar/                                 # Level 3 - Toolbar view
│   │   ├── index.ts                             # Barrel (~10 lines)
│   │   ├── toolbar.view.ts                      # Toolbar view (~60 lines)
│   │   ├── toolbar.styles.ts                    # Toolbar CSS (~50 lines)
│   │   └── toolbar-items.view.ts                # Item rendering (~40 lines)
│   │
│   ├── overlay/                                 # Level 3 - Overlay layer
│   │   ├── index.ts                             # Barrel (~10 lines)
│   │   ├── overlay.view.ts                      # Overlay layer (~60 lines)
│   │   ├── overlay.styles.ts                    # Overlay CSS (~50 lines)
│   │   └── overlay-backdrop.view.ts             # Backdrop click (~30 lines)
│   │
│   └── handlers/                                # Level 3 - Workspace handlers
│       ├── index.ts                             # registerWorkspaceHandlers (~40 lines)
│       │
│       ├── panel-assign.handler.ts              # Assign view to panel (~50 lines)
│       ├── panel-remove.handler.ts              # Remove view (~40 lines)
│       ├── panel-swap.handler.ts                # Swap views (~40 lines)
│       ├── panel-move.handler.ts                # Move view (~40 lines)
│       │
│       ├── instance-allocate.utils.ts           # Allocate instance (~40 lines)
│       ├── instance-register.utils.ts           # Register instance (~30 lines)
│       ├── region-order.utils.ts                # Update region order (~40 lines)
│       │
│       ├── main-view-order.handler.ts           # Apply main view order (~60 lines)
│       ├── main-view-derive.utils.ts            # Derive order from panels (~30 lines)
│       │
│       ├── layout-normalize.utils.ts            # Normalize layout state (~50 lines)
│       ├── auth-normalize.utils.ts              # Normalize auth state (~30 lines)
│       │
│       ├── session-reset.handler.ts             # Reset session (~40 lines)
│       ├── scope-mode.handler.ts                # Set scope mode (~30 lines)
│       └── log-action.utils.ts                  # Build log action (~30 lines)
│
├── components/                                  # Level 2 - Shared components
│   ├── index.ts                                 # Barrel (~15 lines)
│   │
│   ├── framework-root/                          # Level 3
│   │   ├── index.ts                             # Barrel (~10 lines)
│   │   ├── framework-root.view.ts               # Main component (~70 lines)
│   │   ├── framework-root.styles.ts             # Root CSS (~30 lines)
│   │   ├── framework-context.view.ts            # Context provider (~50 lines)
│   │   ├── framework-dispatch.utils.ts          # Action dispatch pipeline (~60 lines)
│   │   ├── framework-effects.utils.ts           # Effect execution (~40 lines)
│   │   ├── framework-firestore.utils.ts         # Firestore setup (~50 lines)
│   │   └── framework-auth.utils.ts              # Auth setup (~40 lines)
│   │
│   ├── view-token.view.ts                       # ViewToken (~50 lines)
│   └── icons.ts                                 # Icon definitions (~40 lines)
│
└── config/                                      # Level 2
    └── admin-emails.config.ts                   # Admin email list (~20 lines)
```

---

## FILE COUNT SUMMARY

| Domain | Files |
|--------|-------|
| core/ | 15 |
| state/ | 8 |
| types/ | 11 |
| utils/ | 5 |
| persistence/ | 14 |
| handlers/ (core) | 9 |
| effects/ | 7 |
| auth/ | 17 |
| dock/ | 12 |
| layout/ | 35 |
| logging/ | 7 |
| workspace/ | 32 |
| components/ | 11 |
| config/ | 1 |
| **TOTAL** | **~184 files** |

---

## MIGRATION EXECUTION CHUNKS

Given the scope (~184 files), here are the execution chunks with prompts:

### Chunk 1: Types & State (19 files)
### Chunk 2: Core & Registry (15 files)
### Chunk 3: Utils & Persistence (19 files)
### Chunk 4: Core Handlers & Effects (16 files)
### Chunk 5: Auth Domain (17 files)
### Chunk 6: Dock Domain (12 files)
### Chunk 7: Layout - Menu & Presets (23 files)
### Chunk 8: Layout - Toolbar & Palette (12 files)
### Chunk 9: Logging Domain (7 files)
### Chunk 10: Workspace - Root & Panel (18 files)
### Chunk 11: Workspace - Toolbar, Overlay, Handlers (14 files)
### Chunk 12: Components & Config (12 files)
### Chunk 13: Update Imports & Barrel Exports
### Chunk 14: Cleanup & Validation

---

## DETAILED SOURCE → TARGET MAPPING

### From `domains/workspace/handlers/registry.ts` (904 lines) → 15+ files

| Function | Lines | New File |
|----------|-------|----------|
| `registerWorkspaceHandlers()` | 44 | `workspace/handlers/index.ts` |
| `handleToggleInDesign()` | 35 | `layout/toggle-design.handler.ts` |
| `handleMainAreaCount()` | 63 | `layout/set-main-area-count.handler.ts` |
| `handlePresetSave()` | 88 | `layout/presets/preset-save.handler.ts` |
| `handlePresetLoad()` | 90 | `layout/presets/preset-load.handler.ts` |
| `handlePresetDelete()` | 36 | `layout/presets/preset-delete.handler.ts` |
| `handlePresetRename()` | 43 | `layout/presets/preset-rename.handler.ts` |
| `handlePresetHydrate()` | 38 | `layout/presets/preset-hydrate.handler.ts` |
| `handleAuthSetUser()` | 42 | `auth/auth-set-user.handler.ts` |
| `handleFrameworkMenuHydrate()` | 50 | `layout/menu/menu-hydrate.handler.ts` |
| `handleFrameworkMenuReorderItems()` | 32 | `layout/menu/menu-reorder.handler.ts` |
| `handleFrameworkMenuUpdateConfig()` | 28 | `layout/menu/menu-update-config.handler.ts` |
| `normalizeLayoutState()` | ~40 | `workspace/handlers/layout-normalize.utils.ts` |
| `normalizeAuthState()` | ~20 | `workspace/handlers/auth-normalize.utils.ts` |
| `buildLogAction()` | ~15 | `workspace/handlers/log-action.utils.ts` |
| `toFollowUps()` | ~10 | `workspace/handlers/index.ts` (inline) |

### From `domains/auth/components/AuthView.ts` (547 lines) → 9 files

| Section | Lines | New File |
|---------|-------|----------|
| Main component | ~60 | `auth/views/auth.view.ts` |
| CSS styles | ~165 | `auth/views/auth.styles.ts` |
| Login form | ~50 | `auth/views/auth-login-form.view.ts` |
| Signup form | ~50 | `auth/views/auth-signup-form.view.ts` |
| Reset form | ~40 | `auth/views/auth-reset-form.view.ts` |
| Profile | ~40 | `auth/views/auth-profile.view.ts` |
| Social buttons | ~40 | `auth/views/auth-social-buttons.view.ts` |
| Messages | ~30 | `auth/views/auth-message.view.ts` |
| Validation | ~30 | `auth/auth-validate.utils.ts` |

### From `layout/components/FrameworkMenu.ts` (478 lines) → 12 files

| Section | Lines | New File |
|---------|-------|----------|
| Main component | ~60 | `layout/menu/menu.view.ts` |
| CSS styles | ~100 | `layout/menu/menu.styles.ts` |
| Header | ~30 | `layout/menu/menu-header.view.ts` |
| Parent item | ~40 | `layout/menu/menu-item-parent.view.ts` |
| Preset item | ~40 | `layout/menu/menu-item-preset.view.ts` |
| Action item | ~40 | `layout/menu/menu-item-action.view.ts` |
| Icon rendering | ~50 | `layout/menu/menu-icons.utils.ts` |
| Drag handling | ~50 | `layout/menu/menu-drag.utils.ts` |

### From `workspace/components/WorkspaceRoot.ts` (457 lines) → 9 files

| Section | Lines | New File |
|---------|-------|----------|
| Main component | ~70 | `workspace/root/workspace-root.view.ts` |
| CSS styles | ~100 | `workspace/root/workspace-root.styles.ts` |
| Regions | ~50 | `workspace/root/workspace-regions.view.ts` |
| Main area | ~50 | `workspace/root/workspace-main-area.view.ts` |
| Side panel | ~50 | `workspace/root/workspace-side-panel.view.ts` |
| Sash toggles | ~40 | `workspace/root/workspace-sash.view.ts` |
| Drop zones | ~40 | `workspace/root/workspace-drop-zone.view.ts` |
| Transitions | ~40 | `workspace/root/workspace-transitions.utils.ts` |

### From `components/FrameworkRoot.ts` (441 lines) → 8 files

| Section | Lines | New File |
|---------|-------|----------|
| Main component | ~70 | `components/framework-root/framework-root.view.ts` |
| CSS styles | ~30 | `components/framework-root/framework-root.styles.ts` |
| Context provider | ~50 | `components/framework-root/framework-context.view.ts` |
| Dispatch pipeline | ~60 | `components/framework-root/framework-dispatch.utils.ts` |
| Effect execution | ~40 | `components/framework-root/framework-effects.utils.ts` |
| Firestore setup | ~50 | `components/framework-root/framework-firestore.utils.ts` |
| Auth setup | ~40 | `components/framework-root/framework-auth.utils.ts` |

### From `workspace/components/PanelView.ts` (402 lines) → 7 files

| Section | Lines | New File |
|---------|-------|----------|
| Main component | ~70 | `workspace/panel/panel.view.ts` |
| CSS styles | ~60 | `workspace/panel/panel.styles.ts` |
| Content rendering | ~50 | `workspace/panel/panel-content.view.ts` |
| Design overlay | ~50 | `workspace/panel/panel-overlay.view.ts` |
| Drag handling | ~50 | `workspace/panel/panel-drag.utils.ts` |
| Drop handling | ~40 | `workspace/panel/panel-drop.utils.ts` |
| View loading | ~50 | `workspace/panel/panel-load.utils.ts` |

### From `workspace/handlers/workspace-panels.handlers.ts` (395 lines) → 9 files

| Section | Lines | New File |
|---------|-------|----------|
| assignViewHandler | ~50 | `workspace/handlers/panel-assign.handler.ts` |
| removeViewHandler | ~40 | `workspace/handlers/panel-remove.handler.ts` |
| Swap logic | ~40 | `workspace/handlers/panel-swap.handler.ts` |
| Move logic | ~40 | `workspace/handlers/panel-move.handler.ts` |
| allocateViewInstance | ~40 | `workspace/handlers/instance-allocate.utils.ts` |
| Register instance | ~30 | `workspace/handlers/instance-register.utils.ts` |
| updateRegionOrder | ~40 | `workspace/handlers/region-order.utils.ts` |
| applyMainViewOrder | ~60 | `workspace/handlers/main-view-order.handler.ts` |
| deriveMainViewOrderFromPanels | ~30 | `workspace/handlers/main-view-derive.utils.ts` |

### From `core/framework-singleton.ts` (364 lines) → 5 files

| Section | Lines | New File |
|---------|-------|----------|
| Main class | ~80 | `core/singleton/framework.singleton.ts` |
| configure() | ~40 | `core/singleton/framework-configure.utils.ts` |
| registerViews() | ~50 | `core/singleton/framework-register.utils.ts` |
| init() | ~50 | `core/singleton/framework-init.utils.ts` |
| Default state | ~40 | `core/singleton/framework-defaults.config.ts` |

### From `core/registry/handler-registry.ts` (294 lines) → 10 files

| Section | Lines | New File |
|---------|-------|----------|
| createHandlerRegistry | ~50 | `core/registry/handler.registry.ts` |
| Dispatch logic | ~40 | `core/registry/handler-dispatch.utils.ts` |
| state/hydrate | ~40 | `handlers/state-hydrate.handler.ts` |
| context/update | ~30 | `handlers/context-update.handler.ts` |
| context/patch | ~25 | `handlers/context-patch.handler.ts` |
| layout/update | ~25 | `handlers/layout-update.handler.ts` |
| panels/update | ~40 | `handlers/panels-update.handler.ts` |
| logs/append | ~50 | `handlers/logs-append.handler.ts` |
| logs/clear | ~15 | `handlers/logs-clear.handler.ts` |
| logs/setMax | ~25 | `handlers/logs-set-max.handler.ts` |

### From `domains/logging/components/LogView.ts` (292 lines) → 6 files

| Section | Lines | New File |
|---------|-------|----------|
| Main component | ~60 | `logging/log.view.ts` |
| CSS styles | ~80 | `logging/log.styles.ts` |
| Entry rendering | ~40 | `logging/log-entry.view.ts` |
| Header | ~30 | `logging/log-header.view.ts` |
| Formatting | ~40 | `logging/log-format.utils.ts` |
| Filtering | ~30 | `logging/log-filter.utils.ts` |

### From `domains/dock/components/DockContainer.ts` (280 lines) → 6 files

| Section | Lines | New File |
|---------|-------|----------|
| Main component | ~60 | `dock/views/dock-container.view.ts` |
| CSS styles | ~80 | `dock/views/dock-container.styles.ts` |
| Handle | ~40 | `dock/views/dock-handle.view.ts` |
| Manager | ~50 | `dock/views/dock-manager.view.ts` |
| Position picker | ~60 | `dock/views/position-picker.view.ts` |
| Position utils | ~40 | `dock/dock-positions.utils.ts` |

### From `utils/firestore-persistence.ts` (249 lines) → 7 files

| Section | Lines | New File |
|---------|-------|----------|
| Main API | ~40 | `persistence/firestore/firestore.persistence.ts` |
| Initialize | ~20 | `persistence/firestore/firestore-init.persistence.ts` |
| Save | ~50 | `persistence/firestore/firestore-save.persistence.ts` |
| Load | ~50 | `persistence/firestore/firestore-load.persistence.ts` |
| Delete | ~30 | `persistence/firestore/firestore-delete.persistence.ts` |
| Rename | ~30 | `persistence/firestore/firestore-rename.persistence.ts` |
| Listen | ~30 | `persistence/firestore/firestore-listen.persistence.ts` |

### From `layout/components/CustomToolbar.ts` (205 lines) → 4 files (RENAMED)

| Section | Lines | New File |
|---------|-------|----------|
| Main component | ~60 | `layout/admin-toolbar.view.ts` |
| CSS styles | ~50 | `layout/admin-toolbar.styles.ts` |
| Buttons | ~50 | `layout/admin-toolbar-buttons.view.ts` |
| Actions | ~40 | `layout/admin-toolbar-actions.utils.ts` |

---

## DELETE LIST

Files to remove (legacy/unused):
- `domains/layout/components/Workspace.ts` (entirely commented out)
- Empty `index.ts` files after migration
- Old domain folder structure after migration

