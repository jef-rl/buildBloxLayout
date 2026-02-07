import type { CoreContext } from '../../../../nxt/runtime/context/core-context';
import type { UIState } from '../../../types/state';
import type { MenuItem, MenuPresetItem, MenuConfig } from '../../../types/state';
import { ActionCatalog } from '../../../../nxt/runtime/actions/action-catalog';

type UiEventTarget = {
  dispatchEvent: (event: Event) => boolean;
};

export const createMenuHandlers = (
    _component: UiEventTarget,
    getCore: () => CoreContext<UIState> | null,
) => ({
    stopClickPropagation: (event: Event) => {
        event.stopPropagation();
    },

    loadPreset: (item: MenuPresetItem) => {
        const core = getCore();
        if (!core) {
            return;
        }
        core.dispatch({ action: ActionCatalog.PresetsLoad, payload: { name: item.presetName } });
    },

    executeAction: (item: MenuItem) => {
        const core = getCore();
        if (!core) {
            return;
        }

        if (item.type === 'preset') {
            core.dispatch({ action: ActionCatalog.PresetsLoad, payload: { name: item.presetName } });
        } else if (item.type === 'action') {
            core.dispatch({ action: item.actionType as any, payload: item.payload ?? {} });
        }
    },

    reorderItems: (draggedId: string, targetId: string) => {
        const core = getCore();
        if (!core) {
            return;
        }
        core.dispatch({ action: ActionCatalog.MenuReorderItems, payload: { draggedId, targetId } });
    },

    updateConfig: (config: MenuConfig) => {
        const core = getCore();
        if (!core) {
            return;
        }
        core.dispatch({ action: ActionCatalog.MenuUpdateConfig, payload: { config } });
    },

    hydrateMenu: () => {
        const core = getCore();
        if (!core) {
            return;
        }
        core.dispatch({ action: ActionCatalog.EffectsMenuHydrate, payload: {} });
    },
});
