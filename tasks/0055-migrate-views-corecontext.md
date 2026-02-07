# Task 0055 — Migrate views to CoreContext selectors

## Migration Rules (Must Be Obeyed)

**R0 — Shim rule**
When moving or splitting a file, leave a same-path shim that only re-exports from the new location.
No logic in shims.

**R1 — Single purpose**
Each new file must have exactly one responsibility.
`index.ts` files are re-export only.

**R2 — Build gate**
This task is complete only if `npm run build` passes.

## Goal
Replace legacy UI state and dispatcher usage in views with CoreContext selectors and dispatch.

## Scope
- packages/framework/src/domains/layout/components/LoadPresetContent.ts
- packages/framework/src/domains/layout/components/Menu.ts
- packages/framework/src/domains/layout/components/SavePresetContent.ts
- packages/framework/src/domains/layout/components/ViewRegistryPanel.ts
- packages/framework/src/domains/logging/components/LogView.ts
- packages/framework/src/domains/auth/components/AuthView.ts
- packages/framework/src/core/bootstrap.ts
- packages/framework/src/core/framework-singleton.ts
- packages/framework/src/domains/dock/handlers/dock.ts
- packages/framework/src/domains/dock/handlers/positioning.ts
- packages/framework/src/domains/layout/handlers/menu.handlers.ts
- packages/framework/src/domains/layout/handlers/preset-manager.handlers.ts
- packages/framework/src/domains/layout/handlers/drag.handlers.ts
- packages/framework/src/domains/layout/handlers/views.ts
- packages/framework/nxt/selectors/auth/auth-state.selector.ts
- packages/framework/nxt/selectors/auth/auth-ui.selector.ts
- packages/framework/nxt/selectors/layout/active-preset.selector.ts
- packages/framework/nxt/selectors/layout/can-drag-views.selector.ts
- packages/framework/nxt/selectors/layout/menu-items.selector.ts
- packages/framework/nxt/selectors/layout/presets.selector.ts
- packages/framework/nxt/selectors/logs/logs-view.selector.ts
- packages/framework/nxt/selectors/views/view-definitions.selector.ts
- packages/framework/nxt/selectors/register-framework-selectors.ts
- tasks/0055-migrate-views-corecontext.md

## Steps
1. Introduce CoreContext selectors for view data.
2. Update views and handlers to use CoreContext dispatch and selectors.

## DoD
- Build passes
