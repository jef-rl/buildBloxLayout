import { DockManager, DockPosition } from '../components/DockManager';

const dispatchDockEvent = (type: string, payload?: unknown) => {
    const root = window.document?.querySelector('framework-root') ?? window;
    root.dispatchEvent(new CustomEvent('ui-event', {
        detail: { type, payload },
        bubbles: true,
        composed: true,
    }));
};

export const dockHandlers = (dm: DockManager) => ({
    DOCK_TOGGLE_PICKER: (payload: { id: string }) => {
        dm.togglePicker(payload.id);
    },
    DOCK_CLOSE_PICKER: () => {
        dm.closePicker();
    },
    DOCK_SET_POSITION: (payload: { id: string; position: DockPosition }) => {
        dm.setPosition(payload.id, payload.position);
    },
    DOCK_UPDATE_STATE: () => {
        dispatchDockEvent('dock-state-change', dm.getState());
    },
});
