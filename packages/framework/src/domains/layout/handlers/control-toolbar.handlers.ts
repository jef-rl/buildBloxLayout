import type { UiStateContextValue } from '../../../state/ui-state';

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
    // From size-controls
    setViewport: (mode: string) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: 'layout/setViewportWidthMode', mode });
    },
});
