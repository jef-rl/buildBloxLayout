import type { ViewControls } from '../../components/controls/Views';
import { dispatchUiEvent } from '../../utils/dispatcher';

export const createViewControlsHandlers = (
    controls: ViewControls,
    _getDispatch: () => unknown,
) => ({
    stopClickPropagation: (event: Event) => {
        event.stopPropagation();
    },
    assignView: (viewId: string, panelId?: string) => {
        dispatchUiEvent(controls, 'panels/assignView', { viewId, panelId });
    },
    setMainViewOrder: (viewOrder: string[]) => {
        dispatchUiEvent(controls, 'panels/setMainViewOrder', { viewOrder });
    },
    setMainAreaCount: (count: number) => {
        dispatchUiEvent(controls, 'layout/setMainAreaCount', { count });
    },
    setScopeMode: (mode: string) => {
        dispatchUiEvent(controls, 'panels/setScopeMode', { mode });
    },
    resetSession: () => {
        dispatchUiEvent(controls, 'session/reset');
    },
});
