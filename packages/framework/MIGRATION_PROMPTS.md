# Framework Migration Execution Prompts

Use these prompts to execute the migration in manageable chunks. Each prompt is self-contained and can be executed independently (though order matters for dependencies).

---

## Pre-Migration Setup

```
PROMPT: Create the new folder structure for packages/framework/src reorganization.

Create the following empty directories (do not create files yet):
- src/core/singleton/
- src/core/registry/
- src/state/
- src/types/
- src/utils/
- src/persistence/firestore/
- src/handlers/
- src/effects/
- src/auth/views/
- src/dock/views/
- src/layout/menu/
- src/layout/presets/
- src/logging/
- src/workspace/root/
- src/workspace/panel/
- src/workspace/toolbar/
- src/workspace/overlay/
- src/workspace/handlers/
- src/components/framework-root/
- src/config/

This creates the 3-level max folder structure.
```

---

## Chunk 1: Types (11 files)

```
PROMPT: Migrate and split the types files.

SOURCE FILES:
- packages/framework/src/types/core.ts (52 lines)
- packages/framework/src/types/state.ts (181 lines)
- packages/framework/src/types/auth.ts (21 lines)
- packages/framework/src/types/events.ts (9 lines)
- packages/framework/src/domains/panels/types.ts (55 lines)

TARGET FILES (in src/types/):
1. index.ts - Barrel exports for all types (~15 lines)
2. core.types.ts - ToolbarPos, ViewportWidthMode from core.ts (~40 lines)
3. state.types.ts - UIState interface only (~50 lines)
4. layout.types.ts - LayoutState, ExpansionState from state.ts (~40 lines)
5. auth.types.ts - AuthState, AuthUiState from auth.ts + state.ts (~30 lines)
6. panel.types.ts - PanelState, Panel from panels/types.ts + state.ts (~40 lines)
7. log.types.ts - LogState, LogEntry from state.ts (~30 lines)
8. menu.types.ts - FrameworkMenuItem from state.ts (~30 lines)
9. preset.types.ts - LayoutPreset from state.ts (~30 lines)
10. view.types.ts - ViewDefinition, ViewInstance from state.ts (~40 lines)
11. events.types.ts - Event types from events.ts (~20 lines)

RULES:
- Each file should have ~30-50 lines max
- Use explicit imports, no circular dependencies
- Export all types from index.ts
- Delete old files after migration
```

---

## Chunk 2: State (8 files)

```
PROMPT: Migrate and split the state management files.

SOURCE FILES:
- packages/framework/src/state/context.ts (6 lines)
- packages/framework/src/state/ui-state.ts (147 lines)
- packages/framework/src/state/context-update.ts (75 lines)
- packages/framework/src/state/state-validator.ts (127 lines)
- packages/framework/src/state/selectors.ts (12 lines)

TARGET FILES (in src/state/):
1. index.ts - Barrel exports (~10 lines)
2. context.ts - Lit context definition (~10 lines)
3. ui.state.ts - UIStateStore class definition (~50 lines)
4. ui-subscribe.state.ts - Subscription/observer system (~40 lines)
5. context-update.utils.ts - applyContextUpdate function (~50 lines)
6. state-validator.utils.ts - validateState function (~50 lines)
7. state-normalize.utils.ts - normalizeState helpers (~40 lines)
8. selectors.ts - State selector functions (~20 lines)

RULES:
- Split ui-state.ts into store definition and subscription logic
- Split state-validator.ts if over 50 lines
- Keep context.ts small (just the context creation)
```

---

## Chunk 3: Core & Registry (15 files)

```
PROMPT: Migrate core framework files and registries.

SOURCE FILES:
- packages/framework/src/core/bootstrap.ts (70 lines)
- packages/framework/src/core/decorators.ts (94 lines)
- packages/framework/src/core/simple-view-config.ts (139 lines)
- packages/framework/src/core/defaults.ts (139 lines)
- packages/framework/src/core/built-in-views.ts (130 lines)
- packages/framework/src/core/framework-singleton.ts (364 lines)
- packages/framework/src/core/registry/handler-registry.ts (294 lines)
- packages/framework/src/core/registry/view-registry.ts (147 lines)
- packages/framework/src/core/registry/effect-registry.ts (25 lines)

TARGET FILES:

src/core/:
1. index.ts - Barrel exports (~15 lines)
2. bootstrap.ts - Legacy bootstrap (~50 lines)
3. decorators.ts - @view decorator (~50 lines)
4. view-config.ts - normalizeViewConfig (~50 lines)
5. defaults.ts - Default values (~50 lines)
6. built-in-views.ts - Register built-ins (~50 lines)

src/core/singleton/:
7. index.ts - Barrel (~10 lines)
8. framework.singleton.ts - Main class structure (~80 lines)
9. framework-configure.utils.ts - configure() logic (~40 lines)
10. framework-register.utils.ts - registerViews() (~50 lines)
11. framework-init.utils.ts - init() logic (~50 lines)
12. framework-defaults.config.ts - Default state object (~40 lines)

src/core/registry/:
13. index.ts - Barrel (~10 lines)
14. handler.registry.ts - createHandlerRegistry factory (~50 lines)
15. handler-dispatch.utils.ts - Dispatch logic (~40 lines)
16. view.registry.ts - View registry (~50 lines)
17. effect.registry.ts - Effect registry (~25 lines)

RULES:
- framework-singleton.ts (364 lines) MUST be split into 5 files
- handler-registry.ts (294 lines) MUST be split - extract coreHandlers to handlers/
- Each function in its own file where practical
```

---

## Chunk 4: Utils & Persistence (19 files)

```
PROMPT: Migrate utility and persistence files.

SOURCE FILES:
- packages/framework/src/utils/dispatcher.ts (14 lines)
- packages/framework/src/utils/logger.ts (14 lines)
- packages/framework/src/utils/helpers.ts (5 lines)
- packages/framework/src/utils/expansion-helpers.ts (61 lines)
- packages/framework/src/utils/persistence.ts (102 lines)
- packages/framework/src/utils/hybrid-persistence.ts (162 lines)
- packages/framework/src/utils/firestore-persistence.ts (249 lines)
- packages/framework/src/utils/firebase-auth.ts (125 lines)
- packages/framework/src/utils/framework-menu-persistence.ts (70 lines)
- packages/framework/src/utils/auth-menu-items.ts (97 lines)

TARGET FILES:

src/utils/:
1. index.ts - Barrel (~15 lines)
2. dispatcher.ts - dispatchUiEvent (~20 lines)
3. logger.ts - Framework logger (~20 lines)
4. helpers.ts - General helpers (~20 lines)
5. expansion.utils.ts - Expansion helpers (~50 lines)

src/persistence/:
6. index.ts - Barrel (~15 lines)
7. local.persistence.ts - Main localStorage API (~50 lines)
8. local-read.persistence.ts - Read operations (~30 lines)
9. local-write.persistence.ts - Write operations (~30 lines)
10. hybrid.persistence.ts - Hybrid API object (~40 lines)
11. hybrid-sync.persistence.ts - Sync logic (~50 lines)
12. hybrid-merge.persistence.ts - Merge strategies (~40 lines)
13. menu.persistence.ts - Menu persistence (~50 lines)

src/persistence/firestore/:
14. index.ts - Barrel (~10 lines)
15. firestore.persistence.ts - Main API object (~40 lines)
16. firestore-init.persistence.ts - initialize(), setUserId() (~20 lines)
17. firestore-save.persistence.ts - savePreset(), saveAll() (~50 lines)
18. firestore-load.persistence.ts - loadAll(), loadSystemPresets() (~50 lines)
19. firestore-delete.persistence.ts - deletePreset(), clear() (~30 lines)
20. firestore-rename.persistence.ts - renamePreset() (~30 lines)
21. firestore-listen.persistence.ts - onPresetsChanged() (~30 lines)

RULES:
- firestore-persistence.ts (249 lines) MUST be split into 7 files
- One function per file for firestore operations
- Move auth-menu-items.ts to auth/ domain (later chunk)
- Move firebase-auth.ts to auth/ domain (later chunk)
```

---

## Chunk 5: Core Handlers (9 files)

```
PROMPT: Extract core handlers from handler-registry.ts.

SOURCE: packages/framework/src/core/registry/handler-registry.ts
Extract the coreHandlers object - each handler becomes its own file.

TARGET FILES (in src/handlers/):
1. index.ts - Barrel + registerCoreHandlers function (~30 lines)
2. state-hydrate.handler.ts - state/hydrate handler (~40 lines)
3. context-update.handler.ts - context/update handler (~30 lines)
4. context-patch.handler.ts - context/patch handler (~25 lines)
5. layout-update.handler.ts - layout/update handler (~25 lines)
6. panels-update.handler.ts - panels/update handler (~40 lines)
7. logs-append.handler.ts - logs/append handler (~50 lines)
8. logs-clear.handler.ts - logs/clear handler (~15 lines)
9. logs-set-max.handler.ts - logs/setMax handler (~25 lines)

HANDLER PATTERN:
```typescript
// logs-append.handler.ts
import type { HandlerResult } from '../core/registry';
import type { UIState } from '../types';

export function logsAppendHandler(
  state: UIState,
  payload: Record<string, unknown>
): HandlerResult<UIState> {
  // Handler logic here (~40 lines)
  return { state: newState, followUps: [] };
}
```

RULES:
- Each handler is a single exported function
- Helper functions (buildLogEntry, normalizeLogLevel) go in the same file if small
- Or create logs.utils.ts if helpers exceed 20 lines
```

---

## Chunk 6: Effects (7 files)

```
PROMPT: Migrate and organize effect files.

SOURCE FILES:
- packages/framework/src/effects/auth.effects.ts (146 lines)
- packages/framework/src/effects/preset.effects.ts (87 lines)
- packages/framework/src/effects/framework-menu.effects.ts (55 lines)
- packages/framework/src/effects/register.ts (13 lines)

TARGET FILES (in src/effects/):
1. index.ts - Barrel + registerEffects (~20 lines)
2. auth-state-changed.effect.ts - Auth state change effect (~40 lines)
3. auth-login.effect.ts - Login effect (~30 lines)
4. auth-logout.effect.ts - Logout effect (~25 lines)
5. preset-save.effect.ts - Save preset effect (~40 lines)
6. preset-load.effect.ts - Load preset effect (~30 lines)
7. menu-persist.effect.ts - Menu persistence effect (~30 lines)

RULES:
- Split auth.effects.ts (146 lines) into 3 files
- Each effect should handle one action type
- Keep effects pure async functions
```

---

## Chunk 7: Auth Domain (17 files)

```
PROMPT: Migrate and split auth domain files.

SOURCE FILES:
- packages/framework/src/domains/auth/components/AuthView.ts (547 lines)
- packages/framework/src/utils/firebase-auth.ts (125 lines)
- packages/framework/src/utils/auth-menu-items.ts (97 lines)

TARGET FILES:

src/auth/:
1. index.ts - Barrel exports (~15 lines)

src/auth/views/:
2. index.ts - Barrel (~10 lines)
3. auth.view.ts - Main AuthView container, mode switching (~60 lines)
4. auth.styles.ts - All CSS styles as exported css`` (~80 lines)
5. auth-login-form.view.ts - renderLoginForm() as component (~50 lines)
6. auth-signup-form.view.ts - renderSignupForm() as component (~50 lines)
7. auth-reset-form.view.ts - renderPasswordResetForm() (~40 lines)
8. auth-profile.view.ts - renderProfile() (~40 lines)
9. auth-social-buttons.view.ts - Google/GitHub OAuth buttons (~40 lines)
10. auth-message.view.ts - Error/success message component (~30 lines)

src/auth/ (handlers/utils):
11. auth-login.handler.ts - handleLogin() logic (~40 lines)
12. auth-signup.handler.ts - handleSignup() logic (~40 lines)
13. auth-logout.handler.ts - handleLogout() logic (~25 lines)
14. auth-reset.handler.ts - handlePasswordReset() logic (~30 lines)
15. auth-set-user.handler.ts - From registry.ts handleAuthSetUser (~40 lines)
16. auth-firebase.utils.ts - Firebase auth config (~50 lines)
17. auth-state-listener.utils.ts - Auth state change listener (~40 lines)
18. auth-validate.utils.ts - Email/password validation (~30 lines)
19. auth-menu-items.utils.ts - Generate auth menu items (~50 lines)

SPLITTING AuthView.ts (547 lines):
- Extract CSS to auth.styles.ts
- Each render*Form() becomes its own component
- Event handlers become separate handler files
- Main component composes the sub-components
```

---

## Chunk 8: Dock Domain (12 files)

```
PROMPT: Migrate and split dock domain files.

SOURCE FILES:
- packages/framework/src/domains/dock/components/DockContainer.ts (280 lines)
- packages/framework/src/domains/dock/components/DockManager.ts (89 lines)
- packages/framework/src/domains/dock/components/PositionPicker.ts (121 lines)
- packages/framework/src/domains/dock/handlers/*.ts
- packages/framework/src/domains/dock/types.ts (3 lines)
- packages/framework/src/domains/dock/utils.ts (74 lines)

TARGET FILES:

src/dock/:
1. index.ts - Barrel exports (~15 lines)

src/dock/views/:
2. index.ts - Barrel (~10 lines)
3. dock-container.view.ts - Main container (~60 lines)
4. dock-container.styles.ts - Container CSS (~80 lines)
5. dock-handle.view.ts - Position picker handle/button (~40 lines)
6. dock-manager.view.ts - DockManager component (~50 lines)
7. position-picker.view.ts - Position picker UI (~60 lines)

src/dock/:
8. dock-set-position.handler.ts - Set dock position (~30 lines)
9. dock-toggle.handler.ts - Toggle dock visibility (~25 lines)
10. dock.types.ts - Dock types (~20 lines)
11. dock-positions.utils.ts - Position calculations (~40 lines)
12. dock-layout.utils.ts - Layout helpers (~30 lines)

SPLITTING DockContainer.ts (280 lines):
- Extract CSS to dock-container.styles.ts
- Extract renderHandle() to dock-handle.view.ts
```

---

## Chunk 9: Layout Domain - Menu (12 files)

```
PROMPT: Migrate and split FrameworkMenu component.

SOURCE FILE:
- packages/framework/src/domains/layout/components/FrameworkMenu.ts (478 lines)
- packages/framework/src/domains/layout/handlers/framework-menu.handlers.ts (62 lines)

TARGET FILES (in src/layout/menu/):
1. index.ts - Barrel (~10 lines)
2. menu.view.ts - Main FrameworkMenu component (~60 lines)
3. menu.styles.ts - All menu CSS (~100 lines)
4. menu-header.view.ts - Menu header section (~30 lines)
5. menu-item-parent.view.ts - renderParentItem() (~40 lines)
6. menu-item-preset.view.ts - renderPresetItem() (~40 lines)
7. menu-item-action.view.ts - renderActionItem() (~40 lines)
8. menu-icons.utils.ts - renderIcon() logic (~50 lines)
9. menu-drag.utils.ts - Drag/drop handlers (~50 lines)
10. menu-hydrate.handler.ts - handleFrameworkMenuHydrate from registry.ts (~40 lines)
11. menu-reorder.handler.ts - handleFrameworkMenuReorderItems (~30 lines)
12. menu-update-config.handler.ts - handleFrameworkMenuUpdateConfig (~25 lines)

SPLITTING FrameworkMenu.ts (478 lines):
- CSS is ~190 lines → menu.styles.ts
- Icon rendering is significant → menu-icons.utils.ts
- Each renderItem type → own component
- Drag handlers → menu-drag.utils.ts
```

---

## Chunk 10: Layout Domain - Presets (12 files)

```
PROMPT: Migrate and split preset components and handlers.

SOURCE FILES:
- packages/framework/src/domains/layout/components/SavePresetContent.ts (215 lines)
- packages/framework/src/domains/layout/components/LoadPresetContent.ts (201 lines)
- packages/framework/src/domains/layout/handlers/preset-manager.handlers.ts (56 lines)
- From registry.ts: handlePresetSave, handlePresetLoad, handlePresetDelete, handlePresetRename, handlePresetHydrate

TARGET FILES (in src/layout/presets/):
1. index.ts - Barrel (~10 lines)
2. save-preset.view.ts - Main save dialog (~60 lines)
3. save-preset.styles.ts - Save dialog CSS (~60 lines)
4. save-preset-form.view.ts - Form inputs (~50 lines)
5. load-preset.view.ts - Main load dialog (~60 lines)
6. load-preset.styles.ts - Load dialog CSS (~60 lines)
7. load-preset-list.view.ts - Preset list rendering (~50 lines)
8. preset-save.handler.ts - handlePresetSave (~50 lines)
9. preset-load.handler.ts - handlePresetLoad (~50 lines)
10. preset-delete.handler.ts - handlePresetDelete (~30 lines)
11. preset-rename.handler.ts - handlePresetRename (~35 lines)
12. preset-hydrate.handler.ts - handlePresetHydrate (~35 lines)

RULES:
- Each save/load dialog gets its own styles file
- Handlers extracted from registry.ts
```

---

## Chunk 11: Layout Domain - Toolbar & Palette (12 files)

```
PROMPT: Migrate admin toolbar and view palette.

SOURCE FILES:
- packages/framework/src/domains/layout/components/CustomToolbar.ts (205 lines) → RENAME to admin-toolbar
- packages/framework/src/domains/layout/components/ToolbarContainer.ts (170 lines)
- packages/framework/src/domains/layout/components/ViewRegistryPanel.ts (202 lines) → RENAME to view-palette

TARGET FILES (in src/layout/):
1. admin-toolbar.view.ts - Main admin controls (~60 lines)
2. admin-toolbar.styles.ts - Admin toolbar CSS (~50 lines)
3. admin-toolbar-buttons.view.ts - renderButton() logic (~50 lines)
4. admin-toolbar-actions.utils.ts - Action dispatch helpers (~40 lines)

5. toolbar-container.view.ts - Generic toolbar wrapper (~50 lines)
6. toolbar-container.styles.ts - Container CSS (~40 lines)

7. view-palette.view.ts - View palette main (~60 lines)
8. view-palette.styles.ts - Palette CSS (~60 lines)
9. view-palette-item.view.ts - Single draggable item (~40 lines)

10. toggle-design.handler.ts - handleToggleInDesign from registry.ts (~35 lines)
11. set-expansion.handler.ts - layout/setExpansion handler (~30 lines)
12. set-viewport-mode.handler.ts - layout/setViewportWidthMode (~25 lines)
13. set-main-area-count.handler.ts - handleMainAreaCount from registry.ts (~50 lines)
14. set-overlay.handler.ts - layout/setOverlayView (~25 lines)

NAMING FIX:
- CustomToolbar → admin-toolbar (controls presets, design mode, layout)
- ViewRegistryPanel → view-palette (drag source for views)
```

---

## Chunk 12: Logging Domain (7 files)

```
PROMPT: Migrate and split logging components.

SOURCE FILE:
- packages/framework/src/domains/logging/components/LogView.ts (292 lines)

TARGET FILES (in src/logging/):
1. index.ts - Barrel (~10 lines)
2. log.view.ts - Main LogView component (~60 lines)
3. log.styles.ts - All log CSS (~80 lines)
4. log-entry.view.ts - Single log entry rendering (~40 lines)
5. log-header.view.ts - Header with count and clear (~30 lines)
6. log-format.utils.ts - formatTimestamp, formatData, getEventType (~40 lines)
7. log-filter.utils.ts - Filtering logic (if any) (~30 lines)

SPLITTING LogView.ts (292 lines):
- CSS is ~165 lines → log.styles.ts
- Format helpers → log-format.utils.ts
- Entry rendering → log-entry.view.ts
- Header → log-header.view.ts
```

---

## Chunk 13: Workspace Domain - Root (9 files)

```
PROMPT: Migrate and split WorkspaceRoot component.

SOURCE FILE:
- packages/framework/src/domains/workspace/components/WorkspaceRoot.ts (457 lines)

TARGET FILES (in src/workspace/root/):
1. index.ts - Barrel (~10 lines)
2. workspace-root.view.ts - Main grid layout (~70 lines)
3. workspace-root.styles.ts - Root CSS (~100 lines)
4. workspace-regions.view.ts - Region rendering (~50 lines)
5. workspace-main-area.view.ts - Main panel grid (~50 lines)
6. workspace-side-panel.view.ts - Side panel stacks (~50 lines)
7. workspace-sash.view.ts - Toggle sashes (~40 lines)
8. workspace-drop-zone.view.ts - Drop zone rendering (~40 lines)
9. workspace-transitions.utils.ts - Transition helpers (~40 lines)

SPLITTING WorkspaceRoot.ts (457 lines):
- CSS is ~200 lines → workspace-root.styles.ts
- renderSidePanelStack() → workspace-side-panel.view.ts
- renderSash() → workspace-sash.view.ts
- Drop handling → workspace-drop-zone.view.ts
```

---

## Chunk 14: Workspace Domain - Panel (8 files)

```
PROMPT: Migrate and split PanelView component.

SOURCE FILE:
- packages/framework/src/domains/workspace/components/PanelView.ts (402 lines)

TARGET FILES (in src/workspace/panel/):
1. index.ts - Barrel (~10 lines)
2. panel.view.ts - Main PanelView component (~70 lines)
3. panel.styles.ts - Panel CSS (~60 lines)
4. panel-content.view.ts - View content rendering (~50 lines)
5. panel-overlay.view.ts - Design mode overlay (~50 lines)
6. panel-drag.utils.ts - Drag start/end handling (~50 lines)
7. panel-drop.utils.ts - Drop handling (~40 lines)
8. panel-load.utils.ts - loadView(), applyViewData() (~50 lines)

SPLITTING PanelView.ts (402 lines):
- CSS is ~100 lines → panel.styles.ts
- resolveViewData, loadView → panel-load.utils.ts
- Drag handlers → panel-drag.utils.ts
- Drop handlers → panel-drop.utils.ts
- Design overlay → panel-overlay.view.ts
```

---

## Chunk 15: Workspace Domain - Toolbar & Overlay (8 files)

```
PROMPT: Migrate toolbar and overlay components.

SOURCE FILES:
- packages/framework/src/domains/workspace/components/ToolbarView.ts (217 lines)
- packages/framework/src/domains/workspace/components/OverlayLayer.ts (145 lines)

TARGET FILES:

src/workspace/toolbar/:
1. index.ts - Barrel (~10 lines)
2. toolbar.view.ts - Main ToolbarView (~60 lines)
3. toolbar.styles.ts - Toolbar CSS (~50 lines)
4. toolbar-items.view.ts - Item rendering (~40 lines)

src/workspace/overlay/:
5. index.ts - Barrel (~10 lines)
6. overlay.view.ts - OverlayLayer main (~60 lines)
7. overlay.styles.ts - Overlay CSS (~50 lines)
8. overlay-backdrop.view.ts - Backdrop click handling (~30 lines)
```

---

## Chunk 16: Workspace Domain - Handlers (14 files)

```
PROMPT: Migrate and split workspace handlers.

SOURCE FILES:
- packages/framework/src/domains/workspace/handlers/registry.ts (904 lines)
- packages/framework/src/domains/workspace/handlers/workspace-panels.handlers.ts (395 lines)
- packages/framework/src/domains/workspace/handlers/workspace-layout.handlers.ts (135 lines)

TARGET FILES (in src/workspace/handlers/):
1. index.ts - registerWorkspaceHandlers + barrel (~40 lines)

Panel handlers:
2. panel-assign.handler.ts - assignViewHandler (~50 lines)
3. panel-remove.handler.ts - removeViewHandler (~40 lines)
4. panel-swap.handler.ts - Swap logic (~40 lines)
5. panel-move.handler.ts - Move logic (~40 lines)

Instance utilities:
6. instance-allocate.utils.ts - allocateViewInstance (~40 lines)
7. instance-register.utils.ts - Register in viewInstances (~30 lines)
8. region-order.utils.ts - updateRegionOrder (~40 lines)

Main view order:
9. main-view-order.handler.ts - applyMainViewOrder (~60 lines)
10. main-view-derive.utils.ts - deriveMainViewOrderFromPanels (~30 lines)

State normalization:
11. layout-normalize.utils.ts - normalizeLayoutState (~50 lines)
12. auth-normalize.utils.ts - normalizeAuthState (~30 lines)

Other handlers:
13. session-reset.handler.ts - Reset session handler (~40 lines)
14. scope-mode.handler.ts - Set scope mode (~30 lines)
15. log-action.utils.ts - buildLogAction helper (~30 lines)

SPLITTING registry.ts (904 lines):
- This is the LARGEST file - extract each handler function
- Move preset handlers to layout/presets/
- Move menu handlers to layout/menu/
- Move auth handlers to auth/
- Keep workspace-specific handlers here
```

---

## Chunk 17: Components - FrameworkRoot (8 files)

```
PROMPT: Migrate and split FrameworkRoot component.

SOURCE FILE:
- packages/framework/src/components/FrameworkRoot.ts (441 lines)

TARGET FILES (in src/components/framework-root/):
1. index.ts - Barrel (~10 lines)
2. framework-root.view.ts - Main component definition (~70 lines)
3. framework-root.styles.ts - Root CSS (~30 lines)
4. framework-context.view.ts - Context provider setup (~50 lines)
5. framework-dispatch.utils.ts - dispatchActions pipeline (~60 lines)
6. framework-effects.utils.ts - Effect execution logic (~40 lines)
7. framework-firestore.utils.ts - Firestore setup (~50 lines)
8. framework-auth.utils.ts - Auth configuration (~40 lines)

SPLITTING FrameworkRoot.ts (441 lines):
- dispatchActions() is complex → framework-dispatch.utils.ts
- configureFirestore, initializeFirestorePersistence → framework-firestore.utils.ts
- configureFirebaseAuth, setAuthUser → framework-auth.utils.ts
- Context provider logic → framework-context.view.ts
```

---

## Chunk 18: Components - Shared (4 files)

```
PROMPT: Migrate shared components.

SOURCE FILES:
- packages/framework/src/components/ViewToken.ts (99 lines)
- packages/framework/src/components/Icons.ts (51 lines)
- packages/framework/src/config/admin-emails.example.ts (18 lines)

TARGET FILES:

src/components/:
1. index.ts - Barrel (~15 lines)
2. view-token.view.ts - ViewToken component (~50 lines)
3. icons.ts - Icon definitions (~40 lines)

src/config/:
4. admin-emails.config.ts - Admin email list (~20 lines)
```

---

## Chunk 19: Update Imports & Barrel Exports

```
PROMPT: Update all imports across the codebase to use new paths.

TASKS:
1. Update src/index.ts to export from new locations
2. Update all internal imports to use new paths:
   - Old: import { X } from './domains/workspace/components/Y'
   - New: import { X } from './workspace/root/Y'

3. Create/update all index.ts barrel files
4. Ensure no circular dependencies
5. Run TypeScript compiler to verify all imports resolve

IMPORT MAPPING:
- './domains/auth/components/*' → './auth/views/*'
- './domains/dock/components/*' → './dock/views/*'
- './domains/layout/components/*' → './layout/*' or './layout/menu/*' or './layout/presets/*'
- './domains/logging/components/*' → './logging/*'
- './domains/workspace/components/*' → './workspace/root/*' or './workspace/panel/*'
- './domains/workspace/handlers/*' → './workspace/handlers/*'
- './core/registry/*' → './core/registry/*'
- './utils/*' → './utils/*' or './persistence/*'
```

---

## Chunk 20: Cleanup & Validation

```
PROMPT: Clean up old files and validate the migration.

TASKS:
1. DELETE old folder structure:
   - packages/framework/src/domains/ (entire folder)
   - Any empty folders
   - Backup files if created

2. DELETE legacy files:
   - domains/layout/components/Workspace.ts (commented out)

3. VALIDATE:
   - Run: cd packages/framework && npx tsc --noEmit
   - All imports resolve
   - No circular dependencies
   - No TypeScript errors

4. VERIFY file sizes:
   - No file exceeds 80 lines (target 50)
   - Run: find src -name "*.ts" -exec wc -l {} \; | sort -n

5. VERIFY folder depth:
   - Maximum 3 levels: src/domain/subfolder/
   - Run: find src -type d | awk -F/ '{print NF-1, $0}' | sort -n

6. UPDATE package.json if needed:
   - Verify "main" and "types" paths
   - Update exports map if using
```

---

## Execution Order

1. Pre-Migration Setup (create folders)
2. Chunk 1: Types
3. Chunk 2: State
4. Chunk 3: Core & Registry
5. Chunk 4: Utils & Persistence
6. Chunk 5: Core Handlers
7. Chunk 6: Effects
8. Chunk 7: Auth Domain
9. Chunk 8: Dock Domain
10. Chunk 9: Layout - Menu
11. Chunk 10: Layout - Presets
12. Chunk 11: Layout - Toolbar & Palette
13. Chunk 12: Logging Domain
14. Chunk 13: Workspace - Root
15. Chunk 14: Workspace - Panel
16. Chunk 15: Workspace - Toolbar & Overlay
17. Chunk 16: Workspace - Handlers
18. Chunk 17: Components - FrameworkRoot
19. Chunk 18: Components - Shared
20. Chunk 19: Update Imports
21. Chunk 20: Cleanup & Validation

**Estimated total: ~184 new files from ~66 original files**
