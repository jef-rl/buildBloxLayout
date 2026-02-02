import { UiStateContextValue } from "./ui.state";

type UiDispatch = UiStateContextValue['dispatch'];

type UiEventTarget = {
  dispatchEvent: (event: Event) => boolean;
};

export const createPresetManagerHandlers = (
    _component: UiEventTarget,
    getDispatch: () => UiDispatch | null,
) => ({
    stopClickPropagation: (event: Event) => {
        event.stopPropagation();
    },

    savePreset: (name: string) => {
        const dispatch = getDispatch();
        if (!dispatch || !name.trim()) {
            return;
        }
        dispatch({ type: 'presets/save', name: name.trim() });
    },

    loadPreset: (name: string) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: 'presets/load', name });
    },

    deletePreset: (name: string) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: 'presets/delete', name });
    },

    renamePreset: (oldName: string, newName: string) => {
        const dispatch = getDispatch();
        if (!dispatch || !newName.trim()) {
            return;
        }
        dispatch({ type: 'presets/rename', oldName, newName: newName.trim() });
    },

    toggleDesignMode: (inDesign?: boolean) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: 'layout/toggleInDesign', inDesign });
    },
});
