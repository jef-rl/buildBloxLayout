
import type { Panel, PanelContainer, PanelState, UIState, View } from '../../types/index';
import { viewRegistry } from '../../registry/ViewRegistry';
import type { UiState } from '../../state/ui-state';

const MIN_MAIN_PANELS = 1;
const MAX_MAIN_PANELS = 5;

// Helper to get a unique identifier for the view definition associated with a panel
const getPanelViewDefinitionId = (panel: Panel): string | null => {
    return panel.view?.component ?? panel.viewId ?? panel.activeViewId ?? null;
};

// Creates a unique array of view IDs, preserving the original order
const uniqueViewIds = (viewIds: string[]): string[] => {
    return [...new Set(viewIds)];
};

// Derives the canonical view order from the current state of main panels
export const deriveMainViewOrderFromPanels = (panels: Panel[]): string[] =>
    uniqueViewIds(
        panels
            .filter((panel) => panel.region === 'main')
            .map(getPanelViewDefinitionId)
            .filter((viewId): viewId is string => Boolean(viewId)),
    );

// Core logic to reconcile the main panel area with a desired view order
export const applyMainViewOrder = (state: UIState, viewOrder: string[]): UIState => {
    const capacity = Math.min(MAX_MAIN_PANELS, Math.max(MIN_MAIN_PANELS, Number(state.layout.mainAreaCount ?? 1)));
    const uniqueOrder = uniqueViewIds(viewOrder);
    const effectiveOrder = uniqueOrder.slice(0, capacity);

    const mainPanels = state.panels.filter((panel) => panel.region === 'main');
    const mainPanelIds = mainPanels.map((panel) => panel.id);

    const nextPanels = state.panels.map((panel) => {
        if (panel.region !== 'main') {
            return panel;
        }

        const slotIndex = mainPanelIds.indexOf(panel.id);
        const viewDefId = effectiveOrder[slotIndex];

        // If no view is assigned to this slot, clear the panel
        if (!viewDefId) {
            return { ...panel, view: null, viewId: undefined, activeViewId: undefined };
        }

        // Find the existing view instance from the central state.views array
        const existingView = state.views.find((v) => v.component === viewDefId);

        // If the panel already has the correct view instance, do nothing
        if (panel.view && panel.view.id === existingView?.id) {
            return panel;
        }

        // If an existing view instance is found, assign it to the panel
        if (existingView) {
            return { ...panel, view: existingView, viewId: viewDefId, activeViewId: viewDefId };
        }

        // If no instance exists, create a new one
        const newView = viewRegistry.createView(viewDefId);
        return {
            ...panel,
            view: newView ?? null,
            viewId: newView ? viewDefId : undefined,
            activeViewId: newView ? viewDefId : undefined,
        };
    });

    const nextViews = nextPanels.map((panel) => panel.view).filter((v): v is View => Boolean(v));
    const nextActiveView = state.views.find(v => v.id === state.activeView)?.id ?? nextViews[0]?.id ?? null;

    return {
        ...state,
        panels: nextPanels,
        views: uniqueViewIds(state.views.map(v => v.component)), // Ensure view instances are unique
        activeView: nextActiveView,
        layout: {
            ...state.layout,
            mainViewOrder: uniqueOrder,
        },
    };
};

// Assigns a view to a specific panel, handling instance creation and data updates
const assignViewToPanel = (
    state: UiState,
    panel: Panel,
    viewDefId: string,
    data?: unknown,
): UiState => {
    let viewInstance = state.views.find((v) => v.component === viewDefId);
    let viewNeedsUpdate = false;

    // If an instance already exists, update its data if new data is provided
    if (viewInstance) {
        if (data) {
            viewInstance.data = { ...(viewInstance.data || {}), ...data as object };
            viewNeedsUpdate = true;
        }
    } else {
        // If no instance exists, create a new one
        viewInstance = viewRegistry.createView(viewDefId, data);
        if (!viewInstance) {
            return state; // View creation failed
        }
        viewNeedsUpdate = true;
    }

    // Update the panel to link to this view instance
    panel.view = viewInstance;
    panel.viewId = viewDefId;
    panel.activeViewId = viewDefId;

    const nextState = { ...state };

    // Update the central views array if necessary
    if (viewNeedsUpdate) {
        const otherViews = state.views.filter((v) => v.id !== viewInstance!.id);
        nextState.views = [...otherViews, viewInstance];
    }

    // Recalculate derived state
    nextState.activeView = viewInstance.id;
    nextState.layout.mainViewOrder = deriveMainViewOrderFromPanels(nextState.panels);

    return nextState;
};

// Exported handlers for panel-related actions
export const panelHandlers = (uiState: UiState) => ({
    // ... (ADD_PANEL, REMOVE_PANEL, MOVE_PANEL handlers remain the same) ...

    ASSIGN_VIEW_TO_PANEL: (payload: { panelId: string, viewId: string, data?: unknown }) => {
        const { panelId, viewId, data } = payload;
        const panel = uiState.findPanel(panelId);
        if (panel) {
            const nextState = assignViewToPanel(uiState.getState(), panel, viewId, data);
            uiState.update(nextState);
        }
    },

    SET_MAIN_VIEW_ORDER: (payload: { viewOrder: string[] }) => {
        const viewOrder = Array.isArray(payload.viewOrder) ? payload.viewOrder : [];
        const nextState = applyMainViewOrder(uiState.getState(), viewOrder);
        uiState.update(nextState);
    },

    // ... (REMOVE_VIEW_FROM_PANEL, SET_ACTIVE_VIEW, UPDATE_PANEL_STATE handlers remain the same) ...
});
