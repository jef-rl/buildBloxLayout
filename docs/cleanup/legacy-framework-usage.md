# Legacy framework usage report

## Scope

Scanned for:
- `@project/framework` import usage (static + dynamic imports).
- `packages/framework/src` import paths.
- Path aliases targeting `../framework/src`.

## Findings

### `@project/framework` consumers

- `DOCS/FRAMEWORK_DEVELOPMENT_GUIDE.md`
  - `bootstrapFramework` → **missing**
  - `uiStateContext` → `packages/framework/nxt/runtime/context/core-context-key.ts` (`coreContext`)
  - `dispatchUiEvent` → **missing**
  - `UiStateContextValue` → `packages/framework/nxt/runtime/context/core-context.ts` (`CoreContext`)
  - `FrameworkPlugin` → **missing**
  - `PluginContext` → **missing**
  - `pluginManager` → **missing**
  - `setFrameworkLogger` → **missing**

- `README.md`
  - `bootstrapFramework` → **missing**
  - `uiStateContext` → `packages/framework/nxt/runtime/context/core-context-key.ts` (`coreContext`)
  - `dispatchUiEvent` → **missing**
  - `UiStateContextValue` → `packages/framework/nxt/runtime/context/core-context.ts` (`CoreContext`)
  - `UIState` → **missing**
  - `HandlerAction` → **missing**
  - `HandlerResult` → **missing**

- `packages/playground/src/components/simple-view.ts`
  - `uiStateContext` → `packages/framework/nxt/runtime/context/core-context-key.ts` (`coreContext`)
  - `UiStateContextValue` → `packages/framework/nxt/runtime/context/core-context.ts` (`CoreContext`)

- `packages/playground/src/components/demo-view.ts`
  - `uiStateContext` → `packages/framework/nxt/runtime/context/core-context-key.ts` (`coreContext`)
  - `dispatchUiEvent` → **missing**
  - `UiStateContextValue` → `packages/framework/nxt/runtime/context/core-context.ts` (`CoreContext`)

- `packages/playground/src/components/login-overlay.ts`
  - `dispatchUiEvent` → **missing**

- `packages/playground/src/components/counter-view.ts`
  - `dispatchUiEvent` → **missing**

- `packages/playground/src/components/configurator-view.ts`
  - `dispatchUiEvent` → **missing**

- `packages/playground/src/main.ts`
  - `Framework` → **missing**
  - `SimpleViewConfig` → **missing**

- `packages/playground/src/data/demo-layout.ts`
  - `MainAreaPanelCount` → **missing**
  - `Panel` → **missing**
  - `UIState` → **missing**
  - `View` → **missing**
  - Dynamic import symbol usage:
    - `AuthView` → `packages/framework/nxt/views/components/AuthView.ts`
    - `LogView` → `packages/framework/nxt/views/components/LogView.ts`
    - `ToolbarContainer` → `packages/framework/nxt/views/components/ToolbarContainer.ts`
    - `CustomToolbar` → `packages/framework/nxt/views/components/CustomToolbar.ts`

### `packages/framework/src` import paths

- No direct import statements referencing `packages/framework/src` were found.

### Path aliases targeting `../framework/src`

- `packages/playground/vite.config.ts`
  - Alias: `@project/framework` → `../framework/src`
  - Migration target: `packages/framework/nxt/index.ts` (or a `packages/framework/nxt` entrypoint)
