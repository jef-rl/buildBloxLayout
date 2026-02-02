import type { UiStateContextValue } from '../../../state/ui-state';
import type { FrameworkMenuItem, FrameworkMenuPresetItem, FrameworkMenuConfig } from '../../../types/state';

type UiDispatch = UiStateContextValue['dispatch'];

type UiEventTarget = {
  dispatchEvent: (event: Event) => boolean;
};

export const createFrameworkMenuHandlers = (
    _component: UiEventTarget,
    getDispatch: () => UiDispatch | null,
) => ({
    stopClickPropagation: (event: Event) => {
        event.stopPropagation();
    },

    loadPreset: (item: FrameworkMenuPresetItem) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: 'presets/load', name: item.presetName });
    },

    executeAction: (item: FrameworkMenuItem) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }

        if (item.type === 'preset') {
            dispatch({ type: 'presets/load', name: item.presetName });
        } else if (item.type === 'action') {
            dispatch({ type: item.actionType, ...item.payload });
        }
    },

    reorderItems: (draggedId: string, targetId: string) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: 'frameworkMenu/reorderItems', draggedId, targetId });
    },

    updateConfig: (config: FrameworkMenuConfig) => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: 'frameworkMenu/updateConfig', config });
    },

    hydrateMenu: () => {
        const dispatch = getDispatch();
        if (!dispatch) {
            return;
        }
        dispatch({ type: 'effects/frameworkMenu/hydrate' });
    },
});
