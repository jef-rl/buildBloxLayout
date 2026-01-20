// ============================================
// PUBLIC API - Framework Entry Point
// ============================================

// Shared/Foundational Components
export * from './components';

// Domain Exports
export * from './domains/workspace';
export * from './domains/panels';
export * from './domains/dock';
export * from './domains/layout';

// Core Framework (Bootstrap & Registries)
export * from './core';

// State Management
export * from './state';
export { ContextConsumer, ContextProvider } from '@lit/context';
export { uiStateContext } from './state/context';
export type { UiStateContextValue } from './state/ui-state';

// Event Handling & Utilities
export * from './utils';

// Types & Interfaces
export * from './types';

// Backward Compatibility Exports (Legacy Paths)
// These maintain the old import paths for existing consumers
export { ViewRegistry, viewRegistry } from './core/registry/view-registry';
export { ExpanderControls as Expander } from './domains/layout/components/Expander';
export { SizeControls as Resizer } from './domains/layout/components/Resizer';
export { ViewControls as Views } from './domains/layout/components/ViewControls';
export { Workspace } from './domains/layout/components/Workspace';
export { DockContainer } from './domains/dock/components/DockContainer';
export { DockManager } from './domains/dock/components/DockManager';
export { PositionPicker } from './domains/dock/components/PositionPicker';
export { FrameworkRoot } from './components/FrameworkRoot';
export { OverlayExpander as OverlayLayer } from './domains/workspace/components/OverlayLayer';
export { WorkspaceRoot } from './domains/workspace/components/WorkspaceRoot';
export { PanelView } from './domains/workspace/components/PanelView';
export { Icons } from './components/Icons';
export { ViewToken } from './components/ViewToken';
