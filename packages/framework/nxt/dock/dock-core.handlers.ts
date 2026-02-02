import { dispatchUiEvent } from "../helpers/dispatcher.utils";
import { DockManager, DockPosition } from "./dock-manager.view";

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
        dispatchUiEvent(window, 'dock-state-change', dm.getState());
    },
});
