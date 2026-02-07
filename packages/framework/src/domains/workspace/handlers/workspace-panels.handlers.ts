
import type { Panel, PanelContainer, PanelState, UIState, View, LayoutState } from '../../../types/index';
import { viewRegistry } from '../../../../nxt/runtime/registries/views/view-registry-legacy-api';
import { ReducerHandler } from '../../../core/registry/ReducerHandler.type';
import { ActionCatalog } from '../../../../nxt/runtime/actions/action-catalog';

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
             const allocation = allocateViewInstance(state, targetId, undefined, viewInstanceCounter);
             viewInstanceCounter = allocation.nextCounter;
             const v = allocation.view!;
             
             return {
                ...panel,
                view: v,
                viewId: v.id,
                activeViewId: v.id,
                _pendingCreation: true, // Marker
                _definitionId: targetId
             };
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
    placement?: 'top' | 'bottom',
    swap?: boolean,
): UIState => {
    let instanceId = inputViewId;
    let definitionId = inputViewId;
    let nextViewInstances = { ...(state.viewInstances || {}) };
    
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

    // --- LOGIC FOR REMOVING SOURCE PANEL IF DRAGGING FROM SIDE PANEL (WITHOUT CTRL) ---
    let panelIdToRemove: string | null = null;
    const sourcePanel = state.panels.find(p => p.viewId === instanceId || p.activeViewId === instanceId);
    
    if (sourcePanel && !swap && sourcePanel.id !== panel.id) {
         const isSideRegion = ['left', 'right', 'bottom'].includes(sourcePanel.region);
         if (isSideRegion) {
             const panelsInRegion = state.panels.filter(p => p.region === sourcePanel.region).length;
             // Only remove if there is more than 1 panel in that region
             if (panelsInRegion > 1) {
                 panelIdToRemove = sourcePanel.id;
             }
         }
    }
    // ----------------------------------------------------------------------------------

    const targetPanelViewId = panel.viewId;

    let nextPanels = state.panels.map(p => {
        if (p.id === panel.id) {
            return nextPanel;
        }
        // Enforce 1:1 rule: remove view from its old position
        if (p.viewId === instanceId || p.activeViewId === instanceId) {
             if (swap && targetPanelViewId) {
                 // Swap: put the view that was in the target panel into the source panel
                 const targetViewInstance = nextViewInstances[targetPanelViewId];
                 return {
                     ...p,
                     viewId: targetPanelViewId,
                     activeViewId: targetPanelViewId,
                     view: targetViewInstance ? {
                         id: targetPanelViewId,
                         name: targetViewInstance.title || targetViewInstance.definitionId,
                         component: targetViewInstance.definitionId,
                         data: targetViewInstance.localContext
                     } : p.view // Fallback to existing if not found (should be rare)
                 };
             }
             // If not swapping, clear the source panel (it will be removed later if panelIdToRemove matches)
             return { ...p, view: null, viewId: undefined, activeViewId: undefined };
        }
        return p;
    });

    if (panelIdToRemove) {
        nextPanels = nextPanels.filter(p => p.id !== panelIdToRemove);
    }

    // Sync legacy views array and ensure each panel.view has a matching entry.
    const activePanelViews = nextPanels
        .map((nextPanelState) => nextPanelState.view)
        .filter((panelView): panelView is View => Boolean(panelView));
    const inactiveViews = state.views.filter(
        (existingView) => !activePanelViews.some((panelView) => panelView.id === existingView.id),
    );
    const nextViews = uniqueViews([...activePanelViews, ...inactiveViews]);

    // NEW: Update region view order for side panels
    let nextLayout: LayoutState = {
        ...state.layout,
        mainViewOrder: deriveMainViewOrderFromPanels(nextPanels),
    };

    // Update view orders for side panels if panels were removed
    if (panelIdToRemove) {
         const removedRegion = sourcePanel!.region;
         if (['left', 'right', 'bottom'].includes(removedRegion)) {
             const key = `${removedRegion}ViewOrder` as keyof LayoutState;
             // @ts-ignore
             const currentOrder = (state.layout[key] as string[]) || [];
             // Filter out any view IDs that might have been associated with the removed panel 
             // (though we moved the view, so strictly speaking the ID is still valid, but the *slot* is gone.
             //  Actually, 'ViewOrder' in side panels is less about slots and more about the views themselves,
             //  but if we remove a panel, we rely on the panel count to drive the layout.
             //  The view order array tracks view IDs. Since we moved the view `instanceId` to a new panel (or region),
             //  we should update the order arrays.)
         }
    }

    // Helper to update order for a specific region
    const updateRegionOrder = (region: string, addedId: string, removedId?: string) => {
        if (!['left', 'right', 'bottom'].includes(region)) return;
        
        const key = `${region}ViewOrder` as keyof LayoutState;
        // @ts-ignore
        let order = (state.layout[key] as string[]) || [];
        
        // Remove the view ID if it was already in this region (it's moving within or away)
        order = order.filter(id => id !== addedId);
        
        // If we are strictly removing a view from this region (e.g. moved to another region),
        // filtering above handles it.
        
        // If this region is the TARGET, add the view ID
        if (panel.region === region) {
             if (placement === 'top') {
                order = [addedId, ...order];
             } else if (placement === 'bottom') {
                order = [...order, addedId];
             } else {
                 // Default to top/start if unspecified, or maintain relative pos if we knew it?
                 // For now, prepend is safe default for "add to this region"
                 order = [addedId, ...order];
             }
        }
        
        // If we removed a source panel from this region, we might need to cleanup
        // (The filtering of `addedId` handles the case where the view moved out).
        
        // @ts-ignore
        nextLayout[key] = order;
    };

    // Update all side regions to ensure consistency
    ['left', 'right', 'bottom'].forEach(r => updateRegionOrder(r, instanceId));


    return {
        ...state,
        panels: nextPanels,
        views: nextViews,
        viewInstances: nextViewInstances,
        activeView: instanceId,
        layout: nextLayout,
    };
};

// === Handler Implementation ===

const assignViewHandler: ReducerHandler<UIState> = (state, action) => {
    const payload = action.payload as { panelId: string; viewId: string; data?: unknown; placement?: 'top' | 'bottom'; swap?: boolean } | undefined;
    if (!payload || !payload.panelId || !payload.viewId) {
        return { state, followUps: [] };
    }

    const panel = state.panels.find((p) => p.id === payload.panelId);
    if (!panel) {
        return { state, followUps: [] };
    }

    const nextState = assignViewToPanel(state, panel, payload.viewId, payload.data, payload.placement, payload.swap);
    return { state: nextState, followUps: [] };
};

const removeViewHandler: ReducerHandler<UIState> = (state, action) => {
    const payload = action.payload as { panelId: string; viewId?: string | null } | undefined;
    if (!payload?.panelId) {
        return { state, followUps: [] };
    }

    const panel = state.panels.find(p => p.id === payload.panelId);
    if (!panel) return { state, followUps: [] };
    
    const viewIdToRemove = payload.viewId ?? panel.viewId;
    const shouldClearPanel =
        panel.region === 'main' ||
        !payload.viewId ||
        panel.viewId === viewIdToRemove ||
        panel.activeViewId === viewIdToRemove;

    const nextPanels = state.panels.map((p) => {
        if (p.id === payload.panelId && shouldClearPanel) {
             return { ...p, view: null, viewId: undefined, activeViewId: undefined };
        }
        return p;
    });
    
    let nextLayout = {
        ...state.layout,
        mainViewOrder: deriveMainViewOrderFromPanels(nextPanels),
    };

    if (viewIdToRemove && ['left', 'right', 'bottom'].includes(panel.region)) {
        const key = `${panel.region}ViewOrder` as keyof LayoutState;
        // @ts-ignore
        const currentOrder = (state.layout[key] as string[]) || [];
        const nextOrder = currentOrder.filter(id => id !== viewIdToRemove);
        nextLayout = {
            ...nextLayout,
            [key]: nextOrder
        };
    }

    return {
        state: {
            ...state,
            panels: nextPanels,
            layout: nextLayout
        },
        followUps: []
    };
};

export const workspacePanelHandlers = {
    [ActionCatalog.PanelsAssignView]: assignViewHandler,
    [ActionCatalog.PanelsRemoveView]: removeViewHandler,
};
