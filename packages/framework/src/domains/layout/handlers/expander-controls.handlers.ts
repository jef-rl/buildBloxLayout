import type { ExpanderControls } from '../components/Expander';
import type { UiStateContextValue } from '../../../state/ui-state';

type UiDispatch = UiStateContextValue['dispatch'];

export const createExpanderControlsHandlers = (
    _controls: ExpanderControls,
    getDispatch: () => UiDispatch | null,
) => ({
    stopClickPropagation: (event: Event) => {
        event.stopPropagation();
    },
    setExpansion: (side: 'left' | 'right' | 'bottom', expanded: boolean) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: 'layout/setExpansion', side, expanded });
    },
    setOverlayView: (viewId: string | null) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: 'layout/setOverlayView', viewId });
    },
});
