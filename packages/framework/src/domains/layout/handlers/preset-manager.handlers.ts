import type { UiStateContextValue } from '../../../state/ui-state';
import { ActionCatalog } from '../../../nxt/runtime/actions/action-catalog';

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
        dispatch({ type: ActionCatalog.PresetsSave, name: name.trim() });
    },

    loadPreset: (name: string) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: ActionCatalog.PresetsLoad, name });
    },

    deletePreset: (name: string) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: ActionCatalog.PresetsDelete, name });
    },

    renamePreset: (oldName: string, newName: string) => {
        const dispatch = getDispatch();
        if (!dispatch || !newName.trim()) {
            return;
        }
        dispatch({ type: ActionCatalog.PresetsRename, oldName, newName: newName.trim() });
    },

    toggleDesignMode: (inDesign?: boolean) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: ActionCatalog.LayoutToggleInDesign, inDesign });
    },
});
