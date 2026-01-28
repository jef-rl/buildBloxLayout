
import type { Panel, PanelContainer, PanelState, UIState, View } from '../../../types/index';
import { viewRegistry } from '../../../core/registry/view-registry';
import { ReducerHandler } from '../../../core/registry/handler-registry';

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
        .map(p => p.viewId ?? p.activeViewId ?? p.view?.component)
        .filter((viewId): viewId is string => Boolean(viewId))
    )];

export const applyMainViewOrder = (state: UIState, viewOrder: string[]): UIState => {
    const capacity = Math.min(MAX_MAIN_PANELS, Math.max(MIN_MAIN_PANELS, Number(state.layout.mainAreaCount ?? 1)));
    const uniqueOrder = [...new Set(viewOrder)];
    const effectiveOrder = uniqueOrder.slice(0, capacity);
    const viewIdsInMainArea = new Set(effectiveOrder);

    const mainPanels = state.panels.filter((panel) => panel.region === 'main');
    const mainPanelIds = mainPanels.map((panel) => panel.id);

    let viewInstanceCounter = Number.isFinite(state.viewInstanceCounter) ? state.viewInstanceCounter : 0;
    
    // Create map for fast lookup
    const viewInstances = state.viewInstances || {};

    const nextPanels = state.panels.map((panel) => {
        if (panel.region !== 'main') {
            // Enforce 1:1 rule: if this view is now in the main area, remove it from side panels
            if (panel.viewId && viewIdsInMainArea.has(panel.viewId)) {
                return { ...panel, view: null, viewId: undefined, activeViewId: undefined };
            }
            return panel;
        }

        const slotIndex = mainPanelIds.indexOf(panel.id);
        const targetId = effectiveOrder[slotIndex]; // Could be InstanceId or DefinitionId

        if (!targetId) {
            return { ...panel, view: null, viewId: undefined, activeViewId: undefined };
        }

        // Check if targetId is an existing instance
        const existingInstance = viewInstances[targetId];
        
        if (existingInstance) {
            // It's an instance, assign it
             return { 
                 ...panel, 
                 viewId: targetId, 
                 activeViewId: targetId,
                 view: {
                     id: targetId,
                     name: existingInstance.title || existingInstance.definitionId,
                     component: existingInstance.definitionId,
                     data: existingInstance.localContext
                 }
             };
        }

        // It might be a definition ID, or a legacy view ID
        const definition = viewRegistry.get(targetId);
        if (definition) {
             // Create new instance
             const newInstance = viewRegistry.createInstance(targetId);
             if (newInstance) {
                 // We need to mutate state here (conceptually), but we are inside map.
                 // This is tricky. We'll handle state update after map.
                 // For now, mark as needing creation.
                 // Actually, let's use the legacy allocateViewInstance for now if we can't easily update state.viewInstances here.
                 // But we want to use the new system.
                 
                 // LIMITATION: This function is pure. We can't update state.viewInstances easily while iterating.
                 // However, we can return the new instance info and merge it later.
                 // To simplify, we will fall back to legacy behavior for "applying main view order" if it involves creation, 
                 // or we accept that "mainViewOrder" should ideally contain Instance IDs.
                 
                 // If `viewOrder` contains Definition IDs (e.g. from a Preset), we MUST create instances.
                 const allocation = allocateViewInstance(state, targetId, undefined, viewInstanceCounter);
                 viewInstanceCounter = allocation.nextCounter;
                 const v = allocation.view!;
                 
                 // Create proper ViewInstance entry too (hacky but needed for transition)
                 // We'll rely on the caller or side-effects to persist this if we were truly strict, 
                 // but here we are returning a new UIState.
                 
                 // let's return a "placeholder" and we'll fix the viewInstances map at the end of function.
                 return {
                    ...panel,
                    view: v,
                    viewId: v.id,
                    activeViewId: v.id,
                    _pendingCreation: true, // Marker
                    _definitionId: targetId
                 };
             }
        }
        
        // Check legacy views array
        const existingView = state.views.find((v) => v.component === targetId);
        if (existingView) {
             return { ...panel, view: existingView, viewId: targetId, activeViewId: targetId };
        }

        return { ...panel, view: null, viewId: undefined, activeViewId: undefined };
    });
    
    // Post-process to collect new instances
    const nextViewInstances = { ...(state.viewInstances || {}) };
    const finalPanels = nextPanels.map((p: any) => {
        if (p._pendingCreation) {
            const v = p.view!;
            // Register in new system
            nextViewInstances[v.id] = {
                instanceId: v.id,
                definitionId: p._definitionId,
                title: v.name,
                localContext: v.data as Record<string, any> || {}
            };
            const { _pendingCreation, _definitionId, ...rest } = p;
            return rest;
        }
        return p;
    });

    const activePanelViews = finalPanels.map((p) => p.view).filter((v): v is View => Boolean(v));
    const inactiveViews = state.views.filter(v => !activePanelViews.some(av => av.id === v.id));
    const nextViews = uniqueViews([...activePanelViews, ...inactiveViews]);
    
    const nextActiveView = state.views.find(v => v.id === state.activeView)?.id ?? nextViews[0]?.id ?? null;

    return {
        ...state,
        panels: finalPanels,
        views: nextViews,
        viewInstances: nextViewInstances,
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
    inputViewId: string,
    data?: unknown,
): UIState => {
    let instanceId = inputViewId;
    let definitionId = inputViewId;
    let nextViewInstances = { ...(state.viewInstances || {}) };
    let viewNeedsUpdate = false;
    
    // Check if it's already an instance
    const existingInstance = nextViewInstances[inputViewId];
    
    if (existingInstance) {
        definitionId = existingInstance.definitionId;
        if (data) {
             nextViewInstances[instanceId] = {
                 ...existingInstance,
                 localContext: { ...existingInstance.localContext, ...(data as any) }
             };
        }
    } else {
        // Assume it's a definition ID or legacy logic needed
        const definition = viewRegistry.get(inputViewId);
        if (definition) {
             const newInstance = viewRegistry.createInstance(inputViewId, {
                 localContext: data as Record<string, any>
             });
             if (newInstance) {
                 instanceId = newInstance.instanceId;
                 definitionId = inputViewId;
                 nextViewInstances[instanceId] = newInstance;
             }
        }
    }

    const nextPanel = {
        ...panel,
        viewId: instanceId,
        activeViewId: instanceId,
        // Sync legacy view object
        view: {
            id: instanceId,
            name: nextViewInstances[instanceId]?.title || definitionId,
            component: definitionId,
            data: nextViewInstances[instanceId]?.localContext
        }
    };

    const nextPanels = state.panels.map(p => {
        if (p.id === panel.id) {
            return nextPanel;
        }
        // Enforce 1:1 rule
        if (p.viewId === instanceId || p.activeViewId === instanceId) {
             return { ...p, view: null, viewId: undefined, activeViewId: undefined };
        }
        return p;
    });

    // Sync legacy views array
    const viewInstanceObject = nextPanel.view!;
    const otherViews = state.views.filter((v) => v.id !== instanceId);
    const nextViews = [...otherViews, viewInstanceObject];

    return {
        ...state,
        panels: nextPanels,
        views: uniqueViews(nextViews),
        viewInstances: nextViewInstances,
        activeView: instanceId,
        layout: {
            ...state.layout,
            mainViewOrder: deriveMainViewOrderFromPanels(nextPanels),
        },
    };
};

// === Handler Implementation ===

const assignViewHandler: ReducerHandler<UIState> = (state, action) => {
    const payload = action.payload as { panelId: string; viewId: string; data?: unknown } | undefined;
    if (!payload || !payload.panelId || !payload.viewId) {
        return { state, followUps: [] };
    }

    const panel = state.panels.find((p) => p.id === payload.panelId);
    if (!panel) {
        return { state, followUps: [] };
    }

    const nextState = assignViewToPanel(state, panel, payload.viewId, payload.data);
    return { state: nextState, followUps: [] };
};

export const workspacePanelHandlers = {
    'panels/assignView': assignViewHandler,
};
