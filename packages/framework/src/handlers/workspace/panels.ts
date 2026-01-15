import type { Panel, PanelContainer, PanelState, View } from '../../types/index';
import { viewRegistry } from '../../registry/ViewRegistry';
import type { UiState } from '../../state/ui-state';

const MIN_MAIN_PANELS = 1;
const MAX_MAIN_PANELS = 5;

const applyEqualSizing = (container: PanelContainer) => {
    const count = container.panels.length;
    if (count === 0) return;

    const sizePercent = 100 / count;
    container.panels.forEach((panel: Panel) => {
        if (container.direction === 'row') {
            panel.width = sizePercent;
        } else {
            panel.height = sizePercent;
        }

        if (panel.element) {
            panel.element.style.flex = `0 0 ${sizePercent}%`;
            if (container.direction === 'row') {
                panel.element.style.width = `${sizePercent}%`;
                panel.element.style.maxWidth = `${sizePercent}%`;
            } else {
                panel.element.style.height = `${sizePercent}%`;
                panel.element.style.maxHeight = `${sizePercent}%`;
            }
        }
    });
};

const canAddPanel = (container: PanelContainer) => container.panels.length < MAX_MAIN_PANELS;
const canRemovePanel = (container: PanelContainer) => container.panels.length > MIN_MAIN_PANELS;

export const panelHandlers = (uiState: UiState) => ({
    ADD_PANEL: (payload: { containerId: string, position?: number }) => {
        const { containerId, position } = payload;
        const container = uiState.getContainer(containerId);
        if (container && canAddPanel(container)) {
            const newPanel: Panel = {
                id: `panel-${Date.now()}`,
                name: '',
                region: 'main',
                view: null,
                viewId: undefined,
                width: 0,
                height: 0,
                element: null,
            };
            container.panels.splice(position ?? container.panels.length, 0, newPanel);
            applyEqualSizing(container);
            uiState.update(uiState.getState());
        }
    },

    REMOVE_PANEL: (payload: { panelId: string }) => {
        const { panelId } = payload;
        const container = uiState.findContainerByPanel(panelId);
        if (container && canRemovePanel(container)) {
            container.panels = container.panels.filter((p: Panel) => p.id !== panelId);
            applyEqualSizing(container);
            uiState.update(uiState.getState());
        }
    },

    MOVE_PANEL: (payload: { panelId: string, toContainerId: string, position?: number }) => {
        const { panelId, toContainerId, position } = payload;
        const fromContainer = uiState.findContainerByPanel(panelId);
        const toContainer = uiState.getContainer(toContainerId);

        if (fromContainer && toContainer && canAddPanel(toContainer) && canRemovePanel(fromContainer)) {
            const panel = fromContainer.panels.find((p: Panel) => p.id === panelId);
            if (panel) {
                fromContainer.panels = fromContainer.panels.filter((p: Panel) => p.id !== panelId);
                toContainer.panels.splice(position ?? toContainer.panels.length, 0, panel);
                applyEqualSizing(fromContainer);
                applyEqualSizing(toContainer);
                uiState.update(uiState.getState());
            }
        }
    },

    ADD_VIEW_TO_PANEL: (payload: { panelId: string, viewId: string, data?: unknown, position?: number }) => {
        const { panelId, viewId, data } = payload;
        const panel = uiState.findPanel(panelId);
        if (panel) {
            const view = viewRegistry.createView(viewId, data);
            if (view) {
                panel.view = view;
                panel.viewId = viewId;
                uiState.getState().views = uiState.views.filter((existing) => existing.id !== view.id).concat(view);
                uiState.getState().activeView = view.id;
                uiState.update(uiState.getState());
            }
        }
    },

    REMOVE_VIEW_FROM_PANEL: (payload: { panelId: string, viewId: string }) => {
        const { panelId, viewId } = payload;
        const panel = uiState.findPanel(panelId);
        if (panel && panel.view?.id === viewId) {
            panel.view = null;
            panel.viewId = undefined;
            uiState.getState().views = uiState.views.filter((v: View) => v.id !== viewId);
            if (uiState.getState().activeView === viewId) {
                uiState.getState().activeView = null;
            }
            uiState.update(uiState.getState());
        }
    },

    SET_ACTIVE_VIEW: (payload: { panelId: string, viewId: string }) => {
        const { panelId, viewId } = payload;
        const panel = uiState.findPanel(panelId);
        if (panel && panel.view?.id === viewId) {
            uiState.getState().activeView = viewId;
            uiState.update(uiState.getState());
        }
    },

    UPDATE_PANEL_STATE: (payload: { panelId: string, state: Partial<PanelState> }) => {
        const { panelId, state } = payload;
        const panel = uiState.findPanel(panelId);
        if (panel) {
            Object.assign(panel, state);
            uiState.update(uiState.getState());
        }
    },
});
