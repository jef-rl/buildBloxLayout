import { dispatchUiEvent } from '../../utils/dispatcher';
import type { ViewControls } from '../../components/controls/Toolbar';

export const createViewControlsHandlers = (_controls: ViewControls) => ({
    stopClickPropagation: (event: Event) => {
        event.stopPropagation();
    },
    togglePanel: (viewId: string, panelId?: string) => {
        dispatchUiEvent(window, 'panels/togglePanel', { viewId, panelId });
    },
    setScopeMode: (mode: string) => {
        dispatchUiEvent(window, 'panels/setScopeMode', { mode });
    },
    resetSession: () => {
        dispatchUiEvent(window, 'session/reset');
    },
});
