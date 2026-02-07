import type { UiStateContextValue } from '../../../state/ui-state';
import type { MenuItem, MenuPresetItem, MenuConfig } from '../../../types/state';
import { ActionCatalog } from '../../../../nxt/runtime/actions/action-catalog';

type UiDispatch = UiStateContextValue['dispatch'];

type UiEventTarget = {
  dispatchEvent: (event: Event) => boolean;
};

export const createMenuHandlers = (
    _component: UiEventTarget,
    getDispatch: () => UiDispatch | null,
) => ({
    stopClickPropagation: (event: Event) => {
        event.stopPropagation();
    },

    loadPreset: (item: MenuPresetItem) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: ActionCatalog.PresetsLoad, name: item.presetName });
    },

    executeAction: (item: MenuItem) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }

        if (item.type === 'preset') {
            dispatch({ type: ActionCatalog.PresetsLoad, name: item.presetName });
        } else if (item.type === 'action') {
            dispatch({ type: item.actionType, ...item.payload });
        }
    },

    reorderItems: (draggedId: string, targetId: string) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: ActionCatalog.MenuReorderItems, draggedId, targetId });
    },

    updateConfig: (config: MenuConfig) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: ActionCatalog.MenuUpdateConfig, config });
    },

    hydrateMenu: () => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: ActionCatalog.EffectsMenuHydrate });
    },
});
