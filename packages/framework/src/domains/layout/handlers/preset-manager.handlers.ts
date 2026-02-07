import type { CoreContext } from '../../../../nxt/runtime/context/core-context';
import type { Action } from '../../../../nxt/runtime/actions/action';
import { ActionCatalog } from '../../../../nxt/runtime/actions/action-catalog';
import type { UIState } from '../../../types/state';

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
        const action: Action = { action: ActionCatalog.PresetsSave, payload: { name: name.trim() } };
        core.dispatch(action);
    },

    loadPreset: (name: string) => {
        const core = getCore();
        if (!core) {
            return;
        }
        const action: Action = { action: ActionCatalog.PresetsLoad, payload: { name } };
        core.dispatch(action);
    },

    deletePreset: (name: string) => {
        const core = getCore();
        if (!core) {
            return;
        }
        const action: Action = { action: ActionCatalog.PresetsDelete, payload: { name } };
        core.dispatch(action);
    },

    renamePreset: (oldName: string, newName: string) => {
        const core = getCore();
        if (!core || !newName.trim()) {
            return;
        }
        const action: Action = {
            action: ActionCatalog.PresetsRename,
            payload: { oldName, newName: newName.trim() },
        };
        core.dispatch(action);
    },

    toggleDesignMode: (inDesign?: boolean) => {
        const core = getCore();
        if (!core) {
            return;
        }
        const action: Action = { action: ActionCatalog.LayoutToggleInDesign, payload: { inDesign } };
        core.dispatch(action);
    },
});
