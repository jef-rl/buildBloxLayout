# Legacy registry usage ledger

This ledger captures current references to legacy registry shims, dispatcher utilities, and UI state bridge types. Use it to track migrations to CoreContext + NXT registries.

## core/registry/view-registry

- `packages/framework/src/components/FrameworkRoot.ts`
- `packages/framework/src/domains/layout/handlers/view-instances.ts`
- `packages/framework/src/domains/workspace/handlers/workspace-panels.handlers.ts`
- `packages/framework/src/domains/workspace/handlers/registry.ts`
- `packages/framework/src/domains/workspace/components/ToolbarView.ts`
- `packages/framework/src/domains/workspace/components/PanelView.ts`
- `packages/framework/src/nxt/views/components/WorkspaceRoot.ts`
- `packages/framework/src/index.ts`

## core/registry/handler-registry

- `packages/framework/src/components/FrameworkRoot.ts`

## core/registry/effect-registry

- `packages/framework/src/components/FrameworkRoot.ts`
- `packages/framework/src/effects/auth.effects.ts`
- `packages/framework/src/effects/framework-menu.effects.ts`
- `packages/framework/src/effects/register.ts`
- `packages/framework/src/effects/preset.effects.ts`

## utils/dispatcher

- `packages/framework/src/core/bootstrap.ts`
- `packages/framework/src/core/framework-singleton.ts`
- `packages/framework/src/domains/auth/components/AuthView.ts`
- `packages/framework/src/domains/dock/handlers/dock.ts`
- `packages/framework/src/domains/dock/handlers/positioning.ts`
- `packages/framework/src/domains/layout/components/ToolbarContainer.ts`
- `packages/framework/src/domains/layout/handlers/views.ts`
- `packages/framework/src/domains/logging/components/LogView.ts`

## uiStateContext

- `packages/framework/src/components/FrameworkRoot.ts`
- `packages/framework/src/domains/auth/components/AuthView.ts`
- `packages/framework/src/domains/layout/components/CustomToolbar.ts`
- `packages/framework/src/domains/layout/components/FrameworkMenu.ts`
- `packages/framework/src/domains/layout/components/LoadPresetContent.ts`
- `packages/framework/src/domains/layout/components/SavePresetContent.ts`
- `packages/framework/src/domains/layout/components/ViewRegistryPanel.ts`
- `packages/framework/src/domains/layout/components/Workspace.ts` (commented)
- `packages/framework/src/domains/logging/components/LogView.ts`
- `packages/framework/src/domains/workspace/components/OverlayLayer.ts`
- `packages/framework/src/domains/workspace/components/PanelView.ts`
- `packages/framework/src/domains/workspace/components/ToolbarView.ts`
- `packages/framework/src/index.ts`
- `packages/framework/src/state/context.ts`

## UiEventDetail

- `packages/framework/src/components/FrameworkRoot.ts`
- `packages/framework/src/components/UiEventDetail.type.ts`
- `packages/framework/src/types/events.ts`
- `packages/framework/src/utils/dispatcher.ts`

## UiDispatchPayload

- `packages/framework/src/components/FrameworkRoot.ts`
- `packages/framework/src/components/UiDispatchPayload.type.ts`
