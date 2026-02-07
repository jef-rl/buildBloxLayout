import type { View } from '../../../types/index';

const dispatchViewEvent = (type: string, payload?: unknown) => {
    const root = window.document?.querySelector('framework-root') ?? window;
    root.dispatchEvent(new CustomEvent('ui-event', {
        detail: { type, payload },
        bubbles: true,
        composed: true,
    }));
};

export const viewHandlers = {
    VIEW_ADDED: (payload: { view: View }) => {
        dispatchViewEvent('view-added', payload);
    },
    VIEW_REMOVED: (payload: { viewId: string }) => {
        dispatchViewEvent('view-removed', payload);
    },
    VIEW_UPDATED: (payload: { viewId: string, data: Partial<View> }) => {
        dispatchViewEvent('view-updated', payload);
    },
    VIEW_FOCUSED: (payload: { viewId: string }) => {
        dispatchViewEvent('view-focused', payload);
    },
    VIEW_DRAG_START: (payload: { viewId: string, event: DragEvent }) => {
        payload.event.dataTransfer?.setData('text/plain', payload.viewId);
        dispatchViewEvent('view-drag-start', payload);
    },
    VIEW_DRAG_END: (payload: { viewId: string }) => {
        dispatchViewEvent('view-drag-end', payload);
    },
};
