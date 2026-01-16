import type { ViewControls } from '../../components/controls/Toolbar';
import type { UiStateContextValue } from '../../state/ui-state';

type UiDispatch = UiStateContextValue['dispatch'];

export const createViewControlsHandlers = (
    _controls: ViewControls,
    getDispatch: () => UiDispatch | null,
) => ({
    stopClickPropagation: (event: Event) => {
        event.stopPropagation();
    },
    assignView: (viewId: string, panelId?: string) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: 'panels/assignView', viewId, panelId });
    },
    setScopeMode: (mode: string) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: 'panels/setScopeMode', mode });
    },
    resetSession: () => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: 'session/reset' });
    },
});
