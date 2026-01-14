import type { Panel, PanelContainer, PanelState, View } from '../../types/index';
import { viewRegistry } from '../../registry/ViewRegistry';
import type { UiState } from '../../core/state/ui-state';

export const panelHandlers = (uiState: UiState) => ({
    ADD_PANEL: (payload: { containerId: string, position?: number }) => {
        const { containerId, position } = payload;
        const container = uiState.getContainer(containerId);
        if (container) {
            const newPanel: Panel = {
                id: `panel-${Date.now()}`,
                views: [],
                activeView: null,
                width: 0,
                height: 0,
                element: null,
            };
            container.panels.splice(position ?? container.panels.length, 0, newPanel);
            uiState.update();
        }
    },

    REMOVE_PANEL: (payload: { panelId: string }) => {
        const { panelId } = payload;
        const container = uiState.findContainerByPanel(panelId);
        if (container) {
            container.panels = container.panels.filter((p: Panel) => p.id !== panelId);
            uiState.update();
        }
    },

    MOVE_PANEL: (payload: { panelId: string, toContainerId: string, position?: number }) => {
        const { panelId, toContainerId, position } = payload;
        const fromContainer = uiState.findContainerByPanel(panelId);
        const toContainer = uiState.getContainer(toContainerId);

        if (fromContainer && toContainer) {
            const panel = fromContainer.panels.find((p: Panel) => p.id === panelId);
            if (panel) {
                fromContainer.panels = fromContainer.panels.filter((p: Panel) => p.id !== panelId);
                toContainer.panels.splice(position ?? toContainer.panels.length, 0, panel);
                uiState.update();
            }
        }
    },

    ADD_VIEW_TO_PANEL: (payload: { panelId: string, viewId: string, data?: unknown, position?: number }) => {
        const { panelId, viewId, data, position } = payload;
        const panel = uiState.findPanel(panelId);
        if (panel) {
            const view = viewRegistry.createView(viewId, data);
            if (view) {
                panel.views.splice(position ?? panel.views.length, 0, view);
                panel.activeView = view.id;
                uiState.update();
            }
        }
    },

    REMOVE_VIEW_FROM_PANEL: (payload: { panelId: string, viewId: string }) => {
        const { panelId, viewId } = payload;
        const panel = uiState.findPanel(panelId);
        if (panel) {
            panel.views = panel.views.filter((v: View) => v.id !== viewId);
            if (panel.activeView === viewId) {
                panel.activeView = panel.views[0]?.id || null;
            }
            uiState.update();
        }
    },

    SET_ACTIVE_VIEW: (payload: { panelId: string, viewId: string }) => {
        const { panelId, viewId } = payload;
        const panel = uiState.findPanel(panelId);
        if (panel && panel.views.some((v: View) => v.id === viewId)) {
            panel.activeView = viewId;
            uiState.update();
        }
    },

    UPDATE_PANEL_STATE: (payload: { panelId: string, state: Partial<PanelState> }) => {
        const { panelId, state } = payload;
        const panel = uiState.findPanel(panelId);
        if (panel) {
            Object.assign(panel, state);
            uiState.update();
        }
    },
});
