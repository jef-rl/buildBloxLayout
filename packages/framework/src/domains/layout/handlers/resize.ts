import { dispatchUiEvent } from '../../../utils/dispatcher';

export const resizeHandlers = {
    RESIZE_PANEL: (payload: { panelId: string; axis: 'width' | 'height'; size: number }) => {
        dispatchUiEvent(window, 'layout/setPanelSize', {
            panelId: payload.panelId,
            axis: payload.axis,
            size: payload.size,
        });
    },
};
