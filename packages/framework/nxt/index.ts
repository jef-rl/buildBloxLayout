// NXT public API surface.
// Only the minimal runtime contracts are exported here; all other NXT internals
// are implementation detail and may change without notice.

export type { Action, ActionName } from './runtime/actions/action';
export { CoreContext } from './runtime/context/core-context';
export { coreContext } from './runtime/context/core-context-key';
export { coreContext as uiStateContext } from './runtime/context/core-context-key';
export type { UiStateContextValue } from './compat/ui-state-context-value';
export { dispatchUiEvent } from './compat/dispatch-ui-event';
export { Framework } from '../src/core/framework-singleton';
export type { SimpleViewConfig } from '../src/core/simple-view-config';
export type { MainAreaPanelCount, UIState } from '../src/types/state';
export type { Panel, View } from '../src/domains/panels/types';
export { LogView } from './views/components/LogView';
export { ToolbarContainer } from './views/components/ToolbarContainer';
export { CustomToolbar } from './views/components/CustomToolbar';
