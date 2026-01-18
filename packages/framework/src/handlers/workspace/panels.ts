import type { Panel, PanelContainer, PanelState, UIState, View } from '../../types/index';
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

const getPanelViewId = (panel: Panel) =>
    panel.activeViewId ?? panel.viewId ?? panel.view?.component ?? null;

const uniqueViewIds = (viewIds: string[]) => {
    const seen = new Set<string>();
    return viewIds.filter((viewId) => {
        if (seen.has(viewId)) {
            return false;
        }
        seen.add(viewId);
        return true;
    });
};

export const deriveMainViewOrderFromPanels = (panels: Panel[]) =>
    uniqueViewIds(
        panels
            .filter((panel) => panel.region === 'main')
            .map((panel) => getPanelViewId(panel))
            .filter((viewId): viewId is string => Boolean(viewId)),
    );

export const applyMainViewOrder = (state: UIState, viewOrder: string[]): UIState => {
    const capacity = Math.min(5, Math.max(1, Number(state.layout.mainAreaCount ?? 1)));
    const uniqueOrder = uniqueViewIds(viewOrder);
    const nextOrder = uniqueOrder.slice(0, capacity);
    const mainPanels = state.panels.filter((panel) => panel.region === 'main');
    const mainPanelIds = mainPanels.map((panel) => panel.id);
    const nextPanels = state.panels.map((panel) => {
        if (panel.region !== 'main') {
            return panel;
        }

        const slotIndex = mainPanelIds.indexOf(panel.id);
        const viewId = nextOrder[slotIndex];
        if (!viewId) {
            return {
                ...panel,
                view: null,
                viewId: undefined,
                activeViewId: undefined,
            };
        }

        if (panel.view && panel.viewId === viewId) {
            return {
                ...panel,
                viewId,
                activeViewId: viewId,
            };
        }

        const view = viewRegistry.createView(viewId);
        if (!view) {
            return {
                ...panel,
                view: null,
                viewId: undefined,
                activeViewId: undefined,
            };
        }

        return {
            ...panel,
            view,
            viewId,
            activeViewId: viewId,
        };
    });
    const nextViews = nextPanels.map((panel) => panel.view).filter(Boolean) as View[];
    const nextActiveView =
        nextViews.find((view) => view.id === state.activeView)?.id ?? nextViews[0]?.id ?? null;

    return {
        ...state,
        panels: nextPanels,
        views: nextViews,
        activeView: nextActiveView,
        layout: {
            ...state.layout,
            mainViewOrder: uniqueOrder,
        },
    };
};

const assignViewToPanel = (
    uiState: UiState,
    panel: Panel,
    viewId: string,
    data?: unknown,
) => {
    const view = viewRegistry.createView(viewId, data);
    if (!view) {
        return;
    }

    panel.view = view;
    panel.viewId = viewId;
    panel.activeViewId = viewId;
    uiState.getState().views = uiState.views.filter((existing) => existing.id !== view.id).concat(view);
    uiState.getState().activeView = view.id;
    uiState.getState().layout.mainViewOrder = deriveMainViewOrderFromPanels(uiState.getState().panels);
    uiState.update(uiState.getState());
};

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
                activeViewId: undefined,
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
            assignViewToPanel(uiState, panel, viewId, data);
        }
    },

    ASSIGN_VIEW_TO_PANEL: (payload: { panelId: string, viewId: string, data?: unknown }) => {
        const { panelId, viewId, data } = payload;
        const panel = uiState.findPanel(panelId);
        if (panel) {
            assignViewToPanel(uiState, panel, viewId, data);
        }
    },

    SET_MAIN_VIEW_ORDER: (payload: { viewOrder: string[] }) => {
        const viewOrder = Array.isArray(payload.viewOrder) ? payload.viewOrder : [];
        const nextState = applyMainViewOrder(uiState.getState(), viewOrder);
        uiState.update(nextState);
    },

    REMOVE_VIEW_FROM_PANEL: (payload: { panelId: string, viewId: string }) => {
        const { panelId, viewId } = payload;
        const panel = uiState.findPanel(panelId);
        if (panel && panel.view?.id === viewId) {
            panel.view = null;
            panel.viewId = undefined;
            panel.activeViewId = undefined;
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
            panel.activeViewId = panel.viewId;
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
