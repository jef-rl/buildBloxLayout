// ============================================
// PUBLIC API - Framework Entry Point
// ============================================

// Shared/Foundational Components
export * from './components';

// Domain Exports
export * from './domains/workspace';
export * from './types';
export * from './domains/dock';
export * from './domains/layout';
export * from './domains/auth';
export * from './domains/logging';

// Core Framework (Bootstrap & Registries)
export * from './core';

// State Management
export * from './state';
export { ContextConsumer, ContextProvider } from '@lit/context';
export { uiStateContext } from './state/context';
export type { UiStateContextValue } from './state/ui.state';

// Event Handling & Utilities
export * from './utils';

// Types & Interfaces
export * from './types';

// Backward Compatibility Exports (Legacy Paths)
// These maintain the old import paths for existing consumers
export { ViewRegistry, viewRegistry } from './core/view.registry';
// export { Workspace } from './domains/layout/components/Workspace';
export { DockContainer } from './dock/dock-container.view';
export { DockManager } from './dock/dock-manager.view';
export { PositionPicker } from './dock/position-picker.view';
export { FrameworkRoot } from './components/framework-root.view';
export { OverlayExpander as OverlayLayer } from './workspace/overlay.view';
export { WorkspaceRoot } from './workspace/workspace-root.view';
export { PanelView } from './workspace/panel.view';
// export { Icons } from './components/icons';
