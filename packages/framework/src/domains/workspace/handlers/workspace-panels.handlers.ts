
import type { Panel, PanelContainer, PanelState, UIState, View } from '../../../types/index';
import { viewRegistry } from '../../../core/registry/view-registry';

const MIN_MAIN_PANELS = 1;
const MAX_MAIN_PANELS = 5;

const getPanelViewDefinitionId = (panel: Panel): string | null => {
    return panel.view?.component ?? panel.viewId ?? panel.activeViewId ?? null;
};

const uniqueViews = (views: View[]): View[] => {
    const seen = new Set<string>();
    return views.filter((view) => {
        if (seen.has(view.id)) return false;
        seen.add(view.id);
        return true;
    });
};

const allocateViewInstance = (
    state: UIState,
    viewDefId: string,
    data?: unknown,
    counterOverride?: number,
): { view: View | undefined; nextCounter: number } => {
    const baseCounter = Number.isFinite(state.viewInstanceCounter) ? state.viewInstanceCounter : 0;
    const nextCounter = (counterOverride ?? baseCounter) + 1;
    const instanceId = `${viewDefId}-${nextCounter}`;
    return {
        view: viewRegistry.createView(viewDefId, data, instanceId),
        nextCounter,
    };
};

export const deriveMainViewOrderFromPanels = (panels: Panel[]): string[] =>
    [...new Set(panels
        .filter((panel) => panel.region === 'main')
        .map(getPanelViewDefinitionId)
        .filter((viewId): viewId is string => Boolean(viewId))
    )];

export const applyMainViewOrder = (state: UIState, viewOrder: string[]): UIState => {
    const capacity = Math.min(MAX_MAIN_PANELS, Math.max(MIN_MAIN_PANELS, Number(state.layout.mainAreaCount ?? 1)));
    const uniqueOrder = [...new Set(viewOrder)];
    const effectiveOrder = uniqueOrder.slice(0, capacity);

    const mainPanels = state.panels.filter((panel) => panel.region === 'main');
    const mainPanelIds = mainPanels.map((panel) => panel.id);

    let viewInstanceCounter = Number.isFinite(state.viewInstanceCounter) ? state.viewInstanceCounter : 0;
    const nextPanels = state.panels.map((panel) => {
        if (panel.region !== 'main') return panel;

        const slotIndex = mainPanelIds.indexOf(panel.id);
        const viewDefId = effectiveOrder[slotIndex];

        if (!viewDefId) {
            return { ...panel, view: null, viewId: undefined, activeViewId: undefined };
        }

        const existingView = state.views.find((v) => v.component === viewDefId);

        if (panel.view && panel.view.id === existingView?.id) return panel;

        if (existingView) {
            return { ...panel, view: existingView, viewId: viewDefId, activeViewId: viewDefId };
        }

        const allocation = allocateViewInstance(state, viewDefId, undefined, viewInstanceCounter);
        const newView = allocation.view;
        viewInstanceCounter = allocation.nextCounter;
        return {
            ...panel,
            view: newView ?? null,
            viewId: newView ? viewDefId : undefined,
            activeViewId: newView ? viewDefId : undefined,
        };
    });

    const activePanelViews = nextPanels.map((p) => p.view).filter((v): v is View => Boolean(v));
    const inactiveViews = state.views.filter(v => !activePanelViews.some(av => av.id === v.id));
    const nextViews = uniqueViews([...activePanelViews, ...inactiveViews]);
    
    const nextActiveView = state.views.find(v => v.id === state.activeView)?.id ?? nextViews[0]?.id ?? null;

    return {
        ...state,
        panels: nextPanels,
        views: nextViews,
        activeView: nextActiveView,
        viewInstanceCounter,
        layout: {
            ...state.layout,
            mainViewOrder: uniqueOrder,
        },
    };
};

const assignViewToPanel = (
    state: UIState,
    panel: Panel,
    viewDefId: string,
    data?: unknown,
): UIState => {
    let viewInstance = state.views.find((v) => v.component === viewDefId);
    let viewNeedsUpdate = false;

    if (viewInstance) {
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            const existingData = (typeof viewInstance.data === 'object' && !Array.isArray(viewInstance.data)) ? viewInstance.data as Record<string, unknown> : {};
            viewInstance = {
                ...viewInstance,
                data: { ...existingData, ...data as Record<string, unknown> },
            };
            viewNeedsUpdate = true;
        }
    } else {
        const allocation = allocateViewInstance(state, viewDefId, data);
        viewInstance = allocation.view;
        if (viewInstance) {
            state = {
                ...state,
                viewInstanceCounter: allocation.nextCounter,
            };
        }
        if (!viewInstance) return state;
        viewNeedsUpdate = true;
    }

    const nextPanel = {
        ...panel,
        view: viewInstance,
        viewId: viewDefId,
        activeViewId: viewDefId,
    };

    const nextPanels = state.panels.map(p => p.id === panel.id ? nextPanel : p);

    const otherViews = state.views.filter((v) => v.id !== viewInstance!.id);
    const nextViews = viewNeedsUpdate ? [...otherViews, viewInstance] : state.views;

    return {
        ...state,
        panels: nextPanels,
        views: uniqueViews(nextViews),
        activeView: viewInstance.id,
        layout: {
            ...state.layout,
            mainViewOrder: deriveMainViewOrderFromPanels(nextPanels),
        },
    };
};
