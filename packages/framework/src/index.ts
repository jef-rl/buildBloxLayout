// Public components
export * from './components/controls/Expander';
export * from './components/controls/Resizer';
export * from './components/controls/Toolbar';
export * from './components/layout/DockContainer';
export * from './components/layout/DockManager';
export * from './components/layout/OverlayLayer';
export * from './components/layout/PositionPicker';
export * from './components/layout/workspace-root';
export * from './components/ui/Icons';

// Core functionality & state management
export * from './registry/ViewRegistry';
export * from './state/context';
export * from './state/selectors';
export * from './state/ui-state';

// Event handling
export * from './utils/dispatcher';

// Types & Interfaces
export * from './types/core';
export * from './types/events';

// Utilities
export * from './utils/helpers';

// Handlers
export * from './handlers/layout/dock';
export * from './handlers/layout/dock.handlers';
export * from './handlers/layout/positioning';
export * from './handlers/layout/position-picker.handlers';
export * from './handlers/layout/resize';
export * from './handlers/layout/size-controls.handlers';
export * from './handlers/layout/views';
export * from './handlers/layout/view-controls.handlers';
export * from './handlers/workspace/panels';
