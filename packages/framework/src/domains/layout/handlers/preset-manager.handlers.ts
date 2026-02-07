import type { CoreContext } from '../../../../nxt/runtime/context/core-context';
import type { UIState } from '../../../types/state';
import { ActionCatalog } from '../../../../nxt/runtime/actions/action-catalog';

type UiEventTarget = {
  dispatchEvent: (event: Event) => boolean;
};

export const createPresetManagerHandlers = (
    _component: UiEventTarget,
    getCore: () => CoreContext<UIState> | null,
) => ({
    stopClickPropagation: (event: Event) => {
        event.stopPropagation();
    },

    savePreset: (name: string) => {
        const core = getCore();
        if (!core || !name.trim()) {
            return;
        }
        core.dispatch({ action: ActionCatalog.PresetsSave, payload: { name: name.trim() } });
    },

    loadPreset: (name: string) => {
        const core = getCore();
        if (!core) {
            return;
        }
        core.dispatch({ action: ActionCatalog.PresetsLoad, payload: { name } });
    },

    deletePreset: (name: string) => {
        const core = getCore();
        if (!core) {
            return;
        }
        core.dispatch({ action: ActionCatalog.PresetsDelete, payload: { name } });
    },

    renamePreset: (oldName: string, newName: string) => {
        const core = getCore();
        if (!core || !newName.trim()) {
            return;
        }
        core.dispatch({
            action: ActionCatalog.PresetsRename,
            payload: { oldName, newName: newName.trim() },
        });
    },

    toggleDesignMode: (inDesign?: boolean) => {
        const core = getCore();
        if (!core) {
            return;
        }
        core.dispatch({ action: ActionCatalog.LayoutToggleInDesign, payload: { inDesign } });
    },
});
