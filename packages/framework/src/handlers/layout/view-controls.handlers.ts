import { dispatchUiEvent } from '../../utils/dispatcher';
import type { ViewControls } from '../../components/controls/Toolbar';

export const createViewControlsHandlers = (_controls: ViewControls) => ({
    stopClickPropagation: (event: Event) => {
        event.stopPropagation();
    },
    assignView: (viewId: string, panelId?: string) => {
        dispatchUiEvent(window, 'panels/assignView', { viewId, panelId });
    },
    setScopeMode: (mode: string) => {
        dispatchUiEvent(window, 'panels/setScopeMode', { mode });
    },
    resetSession: () => {
        dispatchUiEvent(window, 'session/reset');
    },
});
