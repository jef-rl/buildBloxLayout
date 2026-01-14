import type { View } from '../../types/index';
import { dispatchUiEvent } from '../../utils/dispatcher';

export const viewHandlers = {
    VIEW_ADDED: (payload: { view: View }) => {
        dispatchUiEvent(window, 'view-added', payload);
    },
    VIEW_REMOVED: (payload: { viewId: string }) => {
        dispatchUiEvent(window, 'view-removed', payload);
    },
    VIEW_UPDATED: (payload: { viewId: string, data: Partial<View> }) => {
        dispatchUiEvent(window, 'view-updated', payload);
    },
    VIEW_FOCUSED: (payload: { viewId: string }) => {
        dispatchUiEvent(window, 'view-focused', payload);
    },
    VIEW_DRAG_START: (payload: { viewId: string, event: DragEvent }) => {
        payload.event.dataTransfer?.setData('text/plain', payload.viewId);
        dispatchUiEvent(window, 'view-drag-start', payload);
    },
    VIEW_DRAG_END: (payload: { viewId: string }) => {
        dispatchUiEvent(window, 'view-drag-end', payload);
    },
};
