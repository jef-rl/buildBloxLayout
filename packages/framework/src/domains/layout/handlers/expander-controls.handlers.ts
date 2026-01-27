import type { ExpanderControls } from '../components/Expander';
import type { UiStateContextValue } from '../../../state/ui-state';
import type { ExpanderState } from '../../../utils/expansion-helpers.js';

type UiDispatch = UiStateContextValue['dispatch'];

type UiEventTarget = {
  dispatchEvent: (event: Event) => boolean;
};

export const createExpanderControlsHandlers = (
    _controls: UiEventTarget,
    getDispatch: () => UiDispatch | null,
) => ({
    stopClickPropagation: (event: Event) => {
        event.stopPropagation();
    },
    setExpansion: (side: 'left' | 'right' | 'bottom', state: ExpanderState) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: 'layout/setExpansion', side, state });
    },
    setOverlayView: (viewId: string | null) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: 'layout/setOverlayView', viewId });
    },
});
