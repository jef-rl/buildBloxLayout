import type { CoreContext } from '../../../../nxt/runtime/context/core-context';
import type { Action, ActionName } from '../../../../nxt/runtime/actions/action';
import { ActionCatalog } from '../../../../nxt/runtime/actions/action-catalog';
import type { UIState } from '../../../types/state';
import type { MenuConfig, MenuItem, MenuPresetItem } from '../../../types/state';

type UiEventTarget = {
  dispatchEvent: (event: Event) => boolean;
};

const actionNames = new Set(Object.values(ActionCatalog));

const resolveActionName = (actionType: string): ActionName | null =>
    actionNames.has(actionType as ActionName) ? (actionType as ActionName) : null;

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
        const action: Action = { action: ActionCatalog.PresetsLoad, payload: { name: item.presetName } };
        core.dispatch(action);
    },

    executeAction: (item: MenuItem) => {
        const core = getCore();
        if (!core) {
            return;
        }

        if (item.type === 'preset') {
            const action: Action = { action: ActionCatalog.PresetsLoad, payload: { name: item.presetName } };
            core.dispatch(action);
        } else if (item.type === 'action') {
            const actionName = resolveActionName(item.actionType);
            if (!actionName) {
                return;
            }
            const action: Action = { action: actionName, payload: item.payload ?? {} };
            core.dispatch(action);
        }
    },

    reorderItems: (draggedId: string, targetId: string) => {
        const core = getCore();
        if (!core) {
            return;
        }
        const action: Action = { action: ActionCatalog.MenuReorderItems, payload: { draggedId, targetId } };
        core.dispatch(action);
    },

    updateConfig: (config: MenuConfig) => {
        const core = getCore();
        if (!core) {
            return;
        }
        const action: Action = { action: ActionCatalog.MenuUpdateConfig, payload: { config } };
        core.dispatch(action);
    },

    hydrateMenu: () => {
        const core = getCore();
        if (!core) {
            return;
        }
        const action: Action = { action: ActionCatalog.EffectsMenuHydrate, payload: {} };
        core.dispatch(action);
    },
});
