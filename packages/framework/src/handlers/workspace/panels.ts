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
                views: [],
                activeView: null,
                width: 0,
                height: 0,
                element: null,
            };
            container.panels.splice(position ?? container.panels.length, 0, newPanel);
            applyEqualSizing(container);
            uiState.update();
        }
    },

    REMOVE_PANEL: (payload: { panelId: string }) => {
        const { panelId } = payload;
        const container = uiState.findContainerByPanel(panelId);
        if (container && canRemovePanel(container)) {
            container.panels = container.panels.filter((p: Panel) => p.id !== panelId);
            applyEqualSizing(container);
            uiState.update();
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
                uiState.update();
            }
        }
    },

    ADD_VIEW_TO_PANEL: (payload: { panelId: string, viewId: string, data?: unknown, position?: number }) => {
        const { panelId, viewId, data } = payload;
        const panel = uiState.findPanel(panelId);
        if (panel) {
            const view = viewRegistry.createView(viewId, data);
            if (view) {
                panel.views = [view];
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
