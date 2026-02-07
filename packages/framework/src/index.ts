// ============================================
// PUBLIC API - NXT Framework Entry Point
// ============================================
// This file defines the supported, stable surface for framework consumers.
// Everything else in the legacy src folders is implementation detail
// and may change without notice.

// Core context + actions
export { coreContext } from '../nxt/runtime/context/core-context-key';
export type { CoreContext } from '../nxt/runtime/context/core-context';
export type { Action, ActionName } from '../nxt/runtime/actions/action';
export { ActionCatalog } from '../nxt/runtime/actions/action-catalog';

// NXT view components
export { WorkspaceRoot } from '../nxt/views/components/WorkspaceRoot.js';
export { ToolbarContainer } from '../nxt/views/components/ToolbarContainer.js';
export { CustomToolbar } from '../nxt/views/components/CustomToolbar.js';
export { OverlayLayer } from '../nxt/views/components/OverlayLayer.js';
export { PanelView } from '../nxt/views/components/PanelView.js';
export { ViewOverlay } from '../nxt/views/components/ViewOverlay.js';
export { ViewHost } from '../nxt/views/host/view-host.js';
