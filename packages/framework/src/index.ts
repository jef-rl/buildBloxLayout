// ============================================
// PUBLIC API - Framework Entry Point
// ============================================
// This file defines the supported, stable surface for framework consumers.
// Everything else in src/nxt and internal folders is implementation detail
// and may change without notice.

// Framework bootstrap/configuration
export { Framework, type FrameworkConfig } from './core/framework-singleton';
export { bootstrapFramework, type BootstrapFrameworkOptions } from './core/bootstrap';
export { view, frameworkView, type ViewDecoratorOptions } from './core/decorators';
export { type SimpleViewConfig } from './core/simple-view-config';

// Core UI root component
export { FrameworkRoot } from './components/FrameworkRoot';

// Built-in view components intended for embedding/extension
export { LogView } from './domains/logging/components/LogView';
export { ToolbarContainer } from './domains/layout/components/ToolbarContainer';
export { CustomToolbar } from './domains/layout/components/CustomToolbar';

// Context and event dispatch
export { uiStateContext } from './state/context';
export type { UiStateContextValue } from './state/ui-state';
export { dispatchUiEvent } from './legacy/dispatcher';

// Public types
export type { MainAreaPanelCount, UIState, FrameworkAuthConfig } from './types/state';
export type { Panel, View, ViewDefinition } from './domains/panels/types';
