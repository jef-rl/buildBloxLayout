import type { UiStateContextValue } from '../../../state/ui-state';
import type { ExpanderState } from '../../../utils/expansion-helpers';

type UiDispatch = UiStateContextValue['dispatch'];

type UiEventTarget = {
  dispatchEvent: (event: Event) => boolean;
};

export const createControlToolbarHandlers = (
    _controls: UiEventTarget,
    getDispatch: () => UiDispatch | null,
) => ({
    stopClickPropagation: (event: Event) => {
        event.stopPropagation();
    },
    // From expander-controls
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
    // From size-controls
    setViewportWidthMode: (mode: string) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: 'layout/setViewportWidthMode', mode });
    },
    setMainAreaCount: (count: number) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: 'layout/setMainAreaCount', count });
    },
});
