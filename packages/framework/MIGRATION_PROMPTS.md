# Framework Migration Execution Prompts (2-Level Structure)

Use these prompts to execute the migration in manageable chunks. Each prompt is self-contained.

---

## Pre-Migration Setup

```
PROMPT: Create the new 2-level folder structure for packages/framework/src.

Create these directories (do not create files yet):
- src/core/
- src/state/
- src/types/
- src/utils/
- src/persistence/
- src/handlers/
- src/effects/
- src/auth/
- src/dock/
- src/layout/
- src/logging/
- src/workspace/
- src/components/
- src/config/

This creates a flat 2-level structure: src/{domain}/file.ts
```

---

## Chunk 1: Types (11 files)

```
PROMPT: Migrate and split the types files into src/types/.

SOURCE FILES:
- packages/framework/src/types/core.ts (52 lines)
- packages/framework/src/types/state.ts (181 lines)
- packages/framework/src/types/auth.ts (21 lines)
- packages/framework/src/types/events.ts (9 lines)
- packages/framework/src/domains/panels/types.ts (55 lines)

TARGET FILES (in src/types/):
1. index.ts - Barrel exports (~15 lines)
2. core.types.ts - ToolbarPos, ViewportWidthMode (~40 lines)
3. state.types.ts - UIState interface only (~50 lines)
4. layout.types.ts - LayoutState, ExpansionState (~40 lines)
5. auth.types.ts - AuthState, AuthUiState (~30 lines)
6. panel.types.ts - PanelState, Panel (~40 lines)
7. log.types.ts - LogState, LogEntry (~30 lines)
8. menu.types.ts - FrameworkMenuItem (~30 lines)
9. preset.types.ts - LayoutPreset (~30 lines)
10. view.types.ts - ViewDefinition, ViewInstance (~40 lines)
11. events.types.ts - Event types (~20 lines)

RULES:
- Each file ~30-50 lines max
- No circular dependencies
- Export all from index.ts
```

---

## Chunk 2: State (8 files)

```
PROMPT: Migrate and split state management files into src/state/.

SOURCE FILES:
- packages/framework/src/state/context.ts (6 lines)
- packages/framework/src/state/ui-state.ts (147 lines)
- packages/framework/src/state/context-update.ts (75 lines)
- packages/framework/src/state/state-validator.ts (127 lines)
- packages/framework/src/state/selectors.ts (12 lines)

TARGET FILES (in src/state/):
1. index.ts - Barrel (~10 lines)
2. context.ts - Lit context definition (~10 lines)
3. ui.state.ts - UIStateStore class (~50 lines)
4. ui-subscribe.state.ts - Subscription system (~40 lines)
5. context-update.utils.ts - applyContextUpdate (~50 lines)
6. state-validator.utils.ts - validateState (~50 lines)
7. state-normalize.utils.ts - normalizeState helpers (~40 lines)
8. selectors.ts - State selectors (~20 lines)
```

---

## Chunk 3: Core (15 files)

```
PROMPT: Migrate core framework files into src/core/.

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

TARGET FILES (in src/core/):
1. index.ts - Barrel exports (~20 lines)
2. bootstrap.ts - Legacy bootstrap (~50 lines)
3. decorators.ts - @view decorator (~50 lines)
4. view-config.ts - normalizeViewConfig (~50 lines)
5. defaults.ts - Default values (~50 lines)
6. built-in-views.ts - Register built-ins (~50 lines)
7. framework-singleton.ts - Main class (~80 lines)
8. framework-configure.utils.ts - configure() (~40 lines)
9. framework-register.utils.ts - registerViews() (~50 lines)
10. framework-init.utils.ts - init() (~50 lines)
11. framework-defaults.config.ts - Default state (~40 lines)
12. handler.registry.ts - createHandlerRegistry (~50 lines)
13. handler-dispatch.utils.ts - Dispatch logic (~40 lines)
14. view.registry.ts - View registry (~50 lines)
15. effect.registry.ts - Effect registry (~25 lines)

SPLITTING:
- framework-singleton.ts (364 lines) → 5 files
- handler-registry.ts (294 lines) → 2 files (handlers go to handlers/)
```

---

## Chunk 4: Utils (5 files)

```
PROMPT: Migrate utility files into src/utils/.

SOURCE FILES:
- packages/framework/src/utils/dispatcher.ts (14 lines)
- packages/framework/src/utils/logger.ts (14 lines)
- packages/framework/src/utils/helpers.ts (5 lines)
- packages/framework/src/utils/expansion-helpers.ts (61 lines)

TARGET FILES (in src/utils/):
1. index.ts - Barrel (~15 lines)
2. dispatcher.ts - dispatchUiEvent (~20 lines)
3. logger.ts - Framework logger (~20 lines)
4. helpers.ts - General helpers (~20 lines)
5. expansion.utils.ts - Expansion helpers (~50 lines)
```

---

## Chunk 5: Persistence (15 files)

```
PROMPT: Migrate persistence files into src/persistence/.

SOURCE FILES:
- packages/framework/src/utils/persistence.ts (102 lines)
- packages/framework/src/utils/hybrid-persistence.ts (162 lines)
- packages/framework/src/utils/firestore-persistence.ts (249 lines)
- packages/framework/src/utils/framework-menu-persistence.ts (70 lines)

TARGET FILES (in src/persistence/):
1. index.ts - Barrel (~15 lines)
2. local.persistence.ts - localStorage API (~50 lines)
3. local-read.persistence.ts - Read operations (~30 lines)
4. local-write.persistence.ts - Write operations (~30 lines)
5. firestore.persistence.ts - Main API (~40 lines)
6. firestore-init.persistence.ts - initialize() (~20 lines)
7. firestore-save.persistence.ts - savePreset() (~50 lines)
8. firestore-load.persistence.ts - loadAll() (~50 lines)
9. firestore-delete.persistence.ts - deletePreset() (~30 lines)
10. firestore-rename.persistence.ts - renamePreset() (~30 lines)
11. firestore-listen.persistence.ts - onPresetsChanged() (~30 lines)
12. hybrid.persistence.ts - Hybrid API (~40 lines)
13. hybrid-sync.persistence.ts - Sync logic (~50 lines)
14. hybrid-merge.persistence.ts - Merge strategies (~40 lines)
15. menu.persistence.ts - Menu persistence (~50 lines)

SPLITTING:
- firestore-persistence.ts (249 lines) → 7 files
```

---

## Chunk 6: Core Handlers (9 files)

```
PROMPT: Extract core handlers into src/handlers/.

SOURCE: packages/framework/src/core/registry/handler-registry.ts (coreHandlers object)

TARGET FILES (in src/handlers/):
1. index.ts - Barrel + registerCoreHandlers (~30 lines)
2. state-hydrate.handler.ts - state/hydrate (~40 lines)
3. context-update.handler.ts - context/update (~30 lines)
4. context-patch.handler.ts - context/patch (~25 lines)
5. layout-update.handler.ts - layout/update (~25 lines)
6. panels-update.handler.ts - panels/update (~40 lines)
7. logs-append.handler.ts - logs/append (~50 lines)
8. logs-clear.handler.ts - logs/clear (~15 lines)
9. logs-set-max.handler.ts - logs/setMax (~25 lines)
```

---

## Chunk 7: Effects (7 files)

```
PROMPT: Migrate effect files into src/effects/.

SOURCE FILES:
- packages/framework/src/effects/auth.effects.ts (146 lines)
- packages/framework/src/effects/preset.effects.ts (87 lines)
- packages/framework/src/effects/framework-menu.effects.ts (55 lines)
- packages/framework/src/effects/register.ts (13 lines)

TARGET FILES (in src/effects/):
1. index.ts - Barrel + registerEffects (~20 lines)
2. auth-state-changed.effect.ts (~40 lines)
3. auth-login.effect.ts (~30 lines)
4. auth-logout.effect.ts (~25 lines)
5. preset-save.effect.ts (~40 lines)
6. preset-load.effect.ts (~30 lines)
7. menu-persist.effect.ts (~30 lines)
```

---

## Chunk 8: Auth Domain (18 files)

```
PROMPT: Migrate auth domain into src/auth/.

SOURCE FILES:
- packages/framework/src/domains/auth/components/AuthView.ts (547 lines)
- packages/framework/src/utils/firebase-auth.ts (125 lines)
- packages/framework/src/utils/auth-menu-items.ts (97 lines)

TARGET FILES (in src/auth/):
1. index.ts - Barrel (~15 lines)
2. auth.view.ts - Main container (~60 lines)
3. auth.styles.ts - CSS (~80 lines)
4. auth-login-form.view.ts - Login form (~50 lines)
5. auth-signup-form.view.ts - Signup form (~50 lines)
6. auth-reset-form.view.ts - Password reset (~40 lines)
7. auth-profile.view.ts - Profile display (~40 lines)
8. auth-social-buttons.view.ts - OAuth buttons (~40 lines)
9. auth-message.view.ts - Messages (~30 lines)
10. auth-login.handler.ts (~40 lines)
11. auth-signup.handler.ts (~40 lines)
12. auth-logout.handler.ts (~25 lines)
13. auth-reset.handler.ts (~30 lines)
14. auth-set-user.handler.ts - From registry.ts (~40 lines)
15. auth-firebase.utils.ts (~50 lines)
16. auth-state-listener.utils.ts (~40 lines)
17. auth-validate.utils.ts (~30 lines)
18. auth-menu-items.utils.ts (~50 lines)

SPLITTING AuthView.ts (547 lines):
- CSS → auth.styles.ts
- Each render*Form() → own component
- Handlers → separate files
```

---

## Chunk 9: Dock Domain (11 files)

```
PROMPT: Migrate dock domain into src/dock/.

SOURCE FILES:
- packages/framework/src/domains/dock/components/DockContainer.ts (280 lines)
- packages/framework/src/domains/dock/components/DockManager.ts (89 lines)
- packages/framework/src/domains/dock/components/PositionPicker.ts (121 lines)
- packages/framework/src/domains/dock/handlers/*.ts
- packages/framework/src/domains/dock/types.ts (3 lines)
- packages/framework/src/domains/dock/utils.ts (74 lines)

TARGET FILES (in src/dock/):
1. index.ts - Barrel (~15 lines)
2. dock-container.view.ts - Main (~60 lines)
3. dock-container.styles.ts - CSS (~80 lines)
4. dock-handle.view.ts - Handle (~40 lines)
5. dock-manager.view.ts - Manager (~50 lines)
6. position-picker.view.ts - Picker UI (~60 lines)
7. dock-set-position.handler.ts (~30 lines)
8. dock-toggle.handler.ts (~25 lines)
9. dock.types.ts (~20 lines)
10. dock-positions.utils.ts (~40 lines)
11. dock-layout.utils.ts (~30 lines)
```

---

## Chunk 10: Layout - Menu (11 files)

```
PROMPT: Migrate FrameworkMenu into src/layout/ (menu files).

SOURCE: packages/framework/src/domains/layout/components/FrameworkMenu.ts (478 lines)

TARGET FILES (in src/layout/):
1. menu.view.ts - Main component (~60 lines)
2. menu.styles.ts - CSS (~100 lines)
3. menu-header.view.ts - Header (~30 lines)
4. menu-item-parent.view.ts - Parent item (~40 lines)
5. menu-item-preset.view.ts - Preset item (~40 lines)
6. menu-item-action.view.ts - Action item (~40 lines)
7. menu-icons.utils.ts - Icons (~50 lines)
8. menu-drag.utils.ts - Drag handlers (~50 lines)
9. menu-hydrate.handler.ts - From registry.ts (~40 lines)
10. menu-reorder.handler.ts - From registry.ts (~30 lines)
11. menu-update-config.handler.ts - From registry.ts (~25 lines)
```

---

## Chunk 11: Layout - Presets (11 files)

```
PROMPT: Migrate preset components into src/layout/ (preset files).

SOURCE FILES:
- packages/framework/src/domains/layout/components/SavePresetContent.ts (215 lines)
- packages/framework/src/domains/layout/components/LoadPresetContent.ts (201 lines)
- Handlers from registry.ts

TARGET FILES (in src/layout/):
1. save-preset.view.ts - Save dialog (~60 lines)
2. save-preset.styles.ts - CSS (~60 lines)
3. save-preset-form.view.ts - Form (~50 lines)
4. load-preset.view.ts - Load dialog (~60 lines)
5. load-preset.styles.ts - CSS (~60 lines)
6. load-preset-list.view.ts - List (~50 lines)
7. preset-save.handler.ts - From registry.ts (~50 lines)
8. preset-load.handler.ts - From registry.ts (~50 lines)
9. preset-delete.handler.ts - From registry.ts (~30 lines)
10. preset-rename.handler.ts - From registry.ts (~35 lines)
11. preset-hydrate.handler.ts - From registry.ts (~35 lines)
```

---

## Chunk 12: Layout - Toolbars & Palette (15 files)

```
PROMPT: Migrate toolbars and palette into src/layout/.

SOURCE FILES:
- packages/framework/src/domains/layout/components/CustomToolbar.ts (205 lines) → RENAME admin-toolbar
- packages/framework/src/domains/layout/components/ToolbarContainer.ts (170 lines)
- packages/framework/src/domains/layout/components/ViewRegistryPanel.ts (202 lines) → RENAME view-palette

TARGET FILES (in src/layout/):
# Admin toolbar (was CustomToolbar)
1. admin-toolbar.view.ts (~60 lines)
2. admin-toolbar.styles.ts (~50 lines)
3. admin-toolbar-buttons.view.ts (~50 lines)
4. admin-toolbar-actions.utils.ts (~40 lines)

# Toolbar container
5. toolbar-container.view.ts (~50 lines)
6. toolbar-container.styles.ts (~40 lines)

# View palette (was ViewRegistryPanel)
7. view-palette.view.ts (~60 lines)
8. view-palette.styles.ts (~60 lines)
9. view-palette-item.view.ts (~40 lines)

# Layout handlers
10. toggle-design.handler.ts - From registry.ts (~35 lines)
11. set-expansion.handler.ts (~30 lines)
12. set-viewport-mode.handler.ts (~25 lines)
13. set-main-area-count.handler.ts - From registry.ts (~50 lines)
14. set-overlay.handler.ts (~25 lines)
15. view-instances.handler.ts (~50 lines)
16. drag.handler.ts (~30 lines)

Also add index.ts barrel for layout/ (~20 lines)

NAMING CHANGES:
- CustomToolbar → admin-toolbar (controls presets, design, layout)
- ViewRegistryPanel → view-palette (drag source for views)
```

---

## Chunk 13: Logging Domain (7 files)

```
PROMPT: Migrate logging domain into src/logging/.

SOURCE: packages/framework/src/domains/logging/components/LogView.ts (292 lines)

TARGET FILES (in src/logging/):
1. index.ts - Barrel (~10 lines)
2. log.view.ts - Main component (~60 lines)
3. log.styles.ts - CSS (~80 lines)
4. log-entry.view.ts - Entry rendering (~40 lines)
5. log-header.view.ts - Header (~30 lines)
6. log-format.utils.ts - Formatting (~40 lines)
7. log-filter.utils.ts - Filtering (~30 lines)
```

---

## Chunk 14: Workspace - Root (9 files)

```
PROMPT: Migrate WorkspaceRoot into src/workspace/ (root files).

SOURCE: packages/framework/src/domains/workspace/components/WorkspaceRoot.ts (457 lines)

TARGET FILES (in src/workspace/):
1. workspace-root.view.ts - Main (~70 lines)
2. workspace-root.styles.ts - CSS (~100 lines)
3. workspace-regions.view.ts - Regions (~50 lines)
4. workspace-main-area.view.ts - Main grid (~50 lines)
5. workspace-side-panel.view.ts - Side panels (~50 lines)
6. workspace-sash.view.ts - Sashes (~40 lines)
7. workspace-drop-zone.view.ts - Drop zones (~40 lines)
8. workspace-transitions.utils.ts - Transitions (~40 lines)
```

---

## Chunk 15: Workspace - Panel (7 files)

```
PROMPT: Migrate PanelView into src/workspace/ (panel files).

SOURCE: packages/framework/src/domains/workspace/components/PanelView.ts (402 lines)

TARGET FILES (in src/workspace/):
1. panel.view.ts - Main (~70 lines)
2. panel.styles.ts - CSS (~60 lines)
3. panel-content.view.ts - Content (~50 lines)
4. panel-overlay.view.ts - Overlay (~50 lines)
5. panel-drag.utils.ts - Drag (~50 lines)
6. panel-drop.utils.ts - Drop (~40 lines)
7. panel-load.utils.ts - Loading (~50 lines)
```

---

## Chunk 16: Workspace - Toolbar & Overlay (6 files)

```
PROMPT: Migrate toolbar and overlay into src/workspace/.

SOURCE FILES:
- packages/framework/src/domains/workspace/components/ToolbarView.ts (217 lines)
- packages/framework/src/domains/workspace/components/OverlayLayer.ts (145 lines)

TARGET FILES (in src/workspace/):
# Toolbar
1. toolbar.view.ts (~60 lines)
2. toolbar.styles.ts (~50 lines)
3. toolbar-items.view.ts (~40 lines)

# Overlay
4. overlay.view.ts (~60 lines)
5. overlay.styles.ts (~50 lines)
6. overlay-backdrop.view.ts (~30 lines)
```

---

## Chunk 17: Workspace - Handlers (16 files)

```
PROMPT: Migrate workspace handlers into src/workspace/.

SOURCE FILES:
- packages/framework/src/domains/workspace/handlers/registry.ts (904 lines)
- packages/framework/src/domains/workspace/handlers/workspace-panels.handlers.ts (395 lines)
- packages/framework/src/domains/workspace/handlers/workspace-layout.handlers.ts (135 lines)

TARGET FILES (in src/workspace/):
1. register-handlers.ts - Main registration (~40 lines)

# Panel handlers
2. panel-assign.handler.ts (~50 lines)
3. panel-remove.handler.ts (~40 lines)
4. panel-swap.handler.ts (~40 lines)
5. panel-move.handler.ts (~40 lines)

# Instance utils
6. instance-allocate.utils.ts (~40 lines)
7. instance-register.utils.ts (~30 lines)
8. region-order.utils.ts (~40 lines)

# Main view order
9. main-view-order.handler.ts (~60 lines)
10. main-view-derive.utils.ts (~30 lines)

# Normalization
11. layout-normalize.utils.ts (~50 lines)
12. auth-normalize.utils.ts (~30 lines)

# Other handlers
13. session-reset.handler.ts (~40 lines)
14. scope-mode.handler.ts (~30 lines)
15. log-action.utils.ts (~30 lines)

Also add index.ts barrel (~20 lines)

NOTE: Some handlers from registry.ts go to other domains:
- preset handlers → layout/
- menu handlers → layout/
- auth handlers → auth/
```

---

## Chunk 18: Components (10 files)

```
PROMPT: Migrate shared components into src/components/.

SOURCE: packages/framework/src/components/FrameworkRoot.ts (441 lines)
        packages/framework/src/components/ViewToken.ts (99 lines)
        packages/framework/src/components/Icons.ts (51 lines)

TARGET FILES (in src/components/):
1. index.ts - Barrel (~15 lines)
2. framework-root.view.ts - Main (~70 lines)
3. framework-root.styles.ts - CSS (~30 lines)
4. framework-context.view.ts - Context (~50 lines)
5. framework-dispatch.utils.ts - Dispatch (~60 lines)
6. framework-effects.utils.ts - Effects (~40 lines)
7. framework-firestore.utils.ts - Firestore (~50 lines)
8. framework-auth.utils.ts - Auth (~40 lines)
9. view-token.view.ts - ViewToken (~50 lines)
10. icons.ts - Icon definitions (~40 lines)
```

---

## Chunk 19: Config (1 file)

```
PROMPT: Migrate config files into src/config/.

SOURCE: packages/framework/src/config/admin-emails.example.ts (18 lines)

TARGET FILES (in src/config/):
1. admin-emails.config.ts (~20 lines)
```

---

## Chunk 20: Update Imports

```
PROMPT: Update all imports to use new 2-level paths.

TASKS:
1. Update src/index.ts public API exports
2. Update all internal imports:

OLD → NEW:
'./domains/auth/components/AuthView' → './auth/auth.view'
'./domains/dock/components/DockContainer' → './dock/dock-container.view'
'./domains/layout/components/FrameworkMenu' → './layout/menu.view'
'./domains/layout/components/CustomToolbar' → './layout/admin-toolbar.view'
'./domains/layout/components/ViewRegistryPanel' → './layout/view-palette.view'
'./domains/logging/components/LogView' → './logging/log.view'
'./domains/workspace/components/WorkspaceRoot' → './workspace/workspace-root.view'
'./domains/workspace/components/PanelView' → './workspace/panel.view'
'./domains/workspace/handlers/registry' → './workspace/register-handlers'
'./core/registry/handler-registry' → './core/handler.registry'
'./core/registry/view-registry' → './core/view.registry'

3. Create/update all index.ts barrel files
4. Ensure no circular dependencies
```

---

## Chunk 21: Cleanup & Validation

```
PROMPT: Clean up old structure and validate migration.

TASKS:
1. DELETE old folders:
   - packages/framework/src/domains/ (entire folder)

2. DELETE legacy files:
   - domains/layout/components/Workspace.ts (commented out)

3. VALIDATE:
   # Check folder depth (should be max 2)
   find src -type d | awk -F/ '{print NF-1, $0}' | sort -rn | head -20

   # Check file sizes (target ~50, max 80)
   find src -name "*.ts" -exec wc -l {} \; | sort -rn | head -20

   # Count files
   find src -name "*.ts" | wc -l

   # TypeScript check
   npx tsc --noEmit

4. Expected results:
   - Max folder depth: 2
   - ~192 TypeScript files
   - All files under 80 lines (target 50)
   - No TypeScript errors
```

---

## Execution Order

1. Pre-Migration Setup
2. Chunk 1: Types (11 files)
3. Chunk 2: State (8 files)
4. Chunk 3: Core (15 files)
5. Chunk 4: Utils (5 files)
6. Chunk 5: Persistence (15 files)
7. Chunk 6: Core Handlers (9 files)
8. Chunk 7: Effects (7 files)
9. Chunk 8: Auth Domain (18 files)
10. Chunk 9: Dock Domain (11 files)
11. Chunk 10: Layout - Menu (11 files)
12. Chunk 11: Layout - Presets (11 files)
13. Chunk 12: Layout - Toolbars & Palette (16 files)
14. Chunk 13: Logging Domain (7 files)
15. Chunk 14: Workspace - Root (9 files)
16. Chunk 15: Workspace - Panel (7 files)
17. Chunk 16: Workspace - Toolbar & Overlay (6 files)
18. Chunk 17: Workspace - Handlers (16 files)
19. Chunk 18: Components (10 files)
20. Chunk 19: Config (1 file)
21. Chunk 20: Update Imports
22. Chunk 21: Cleanup & Validation

**Total: ~192 new files from ~66 original files**
**Structure: 2 levels max (src/{domain}/file.ts)**
