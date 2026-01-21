import type { UIState } from '../../../types/state';
import type { HandlerAction, HandlerRegistry, ReducerHandler } from '../../../core/registry/handler-registry';
import { viewRegistry } from '../../../core/registry/view-registry';
import { applyLayoutAction, clampViewportModeToCapacity } from './workspace-layout.handlers';
import { applyMainViewOrder, deriveMainViewOrderFromPanels } from './workspace-panels.handlers';

export type FrameworkContextState = {
  state: UIState;
};

type StateActionPayload = {
  followUps?: HandlerAction[];
  [key: string]: unknown;
};

const toFollowUps = (payload?: StateActionPayload) => {
  if (!payload || !Array.isArray(payload.followUps)) {
    return [] as HandlerAction[];
  }
  const followUps = payload.followUps;
  return followUps.filter((action): action is HandlerAction => {
    return action !== null && action !== undefined && typeof (action as any)?.type === 'string';
  });
};

const normalizeLayoutState = (state: UIState): UIState => {
  const layout = typeof state.layout === 'object' && state.layout ? state.layout : ({} as UIState['layout']);
  return {
    ...state,
    layout: {
      ...layout,
      expansion: layout.expansion ?? { left: false, right: false, bottom: false },
      overlayView: layout.overlayView ?? null,
      viewportWidthMode: layout.viewportWidthMode ?? 'auto',
      mainAreaCount: layout.mainAreaCount ?? 1,
      mainViewOrder: Array.isArray(layout.mainViewOrder) ? layout.mainViewOrder : [],
    },
  };
};

const normalizeAuthState = (state: UIState): UIState => {
  const auth = typeof state.auth === 'object' && state.auth ? state.auth : ({} as UIState['auth']);
  return {
    ...state,
    auth: {
      ...auth,
      isLoggedIn: auth.isLoggedIn ?? false,
      user: auth.user ?? null,
    },
  };
};

const handleLayoutAction: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload;
  const normalizedState = normalizeLayoutState(context.state);
  const nextLayout = applyLayoutAction(normalizedState.layout, { ...payload, type: action.type });
  if (!nextLayout) {
    return { state: context, followUps: toFollowUps(payload) };
  }

  return {
    state: {
      ...context,
      state: {
        ...normalizedState,
        layout: nextLayout,
      },
    },
    followUps: toFollowUps(payload),
  };
};

const handleMainAreaCount: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload;
  const normalizedState = normalizeLayoutState(context.state);
  const nextLayout = applyLayoutAction(normalizedState.layout, { ...payload, type: action.type });
  if (!nextLayout) {
    return { state: context, followUps: toFollowUps(payload) };
  }

  // Clamp viewport width mode based on new mainAreaCount
  const clampedViewportMode = clampViewportModeToCapacity(
    nextLayout.viewportWidthMode,
    nextLayout.mainAreaCount,
  );

  // Apply clamped viewport mode if it changed
  const finalLayout = clampedViewportMode !== nextLayout.viewportWidthMode
    ? { ...nextLayout, viewportWidthMode: clampedViewportMode }
    : nextLayout;

  const draftState = {
    ...normalizedState,
    layout: finalLayout,
  };
  const fallbackOrder = draftState.layout.mainViewOrder?.length
    ? draftState.layout.mainViewOrder
    : deriveMainViewOrderFromPanels(draftState.panels);

  return {
    state: {
      ...context,
      state: applyMainViewOrder(draftState, fallbackOrder),
    },
    followUps: toFollowUps(payload),
  };
};

const handleSelectPanel: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload;
  const panelId = payload.panelId as string | undefined;
  if (!panelId) {
    return { state: context, followUps: toFollowUps(payload) };
  }

  return {
    state: {
      ...context,
      state: {
        ...context.state,
        panelState: {
          ...context.state.panelState,
          data: {
            ...context.state.panelState.data,
            targetPanelId: panelId,
          },
        },
      },
    },
    followUps: toFollowUps(payload),
  };
};

const handleAssignView: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload;
  const viewId = payload.viewId as string | undefined;
  const targetPanelId =
    (payload.panelId as string | undefined) ??
    (context.state.panelState.data?.targetPanelId as string | undefined);
  const panels = context.state.panels ?? [];
  const fallbackPanel = panels.find((panel) => panel.region === 'main') ?? panels[0];
  const panelId = targetPanelId ?? fallbackPanel?.id;
  const panel = panels.find((item) => item.id === panelId);

  if (!panel || !viewId) {
    return { state: context, followUps: toFollowUps(payload) };
  }

  const view = viewRegistry.createView(viewId);
  if (!view) {
    return { state: context, followUps: toFollowUps(payload) };
  }

  const nextPanels = panels.map((item) =>
    item.id === panel.id
      ? {
          ...item,
          view,
          viewId,
          activeViewId: viewId,
        }
      : item,
  );
  const nextViews = context.state.views
    .filter((existing) => existing.id !== view.id)
    .concat(view);

  return {
    state: {
      ...context,
      state: {
        ...context.state,
        panels: nextPanels,
        views: nextViews,
        activeView: view.id,
        layout: {
          ...context.state.layout,
          mainViewOrder: deriveMainViewOrderFromPanels(nextPanels),
        },
      },
    },
    followUps: toFollowUps(payload),
  };
};

const handleSetMainViewOrder: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload;
  const viewOrder = Array.isArray(payload.viewOrder) ? payload.viewOrder : [];
  return {
    state: {
      ...context,
      state: applyMainViewOrder(context.state, viewOrder),
    },
    followUps: toFollowUps(payload),
  };
};

const handleTogglePanel: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload;
  const panelId = (payload.panelId ?? payload.viewId) as string | undefined;
  if (!panelId) {
    return { state: context, followUps: toFollowUps(payload) };
  }

  const nextOpen = !context.state.panelState.open[panelId];
  return {
    state: {
      ...context,
      state: {
        ...context.state,
        panelState: {
          ...context.state.panelState,
          open: {
            ...context.state.panelState.open,
            [panelId]: nextOpen,
          },
        },
      },
    },
    followUps: toFollowUps(payload),
  };
};

const handleSetScopeMode: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload;
  return {
    state: {
      ...context,
      state: {
        ...context.state,
        panelState: {
          ...context.state.panelState,
          data: {
            ...context.state.panelState.data,
            scope: {
              ...(typeof context.state.panelState.data?.scope === 'object' && !Array.isArray(context.state.panelState.data?.scope) ? context.state.panelState.data.scope : {} as Record<string, unknown>),
              mode: payload.mode,
            },
          },
        },
      },
    },
    followUps: toFollowUps(payload),
  };
};

const handleSessionReset: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload;
  return {
    state: {
      ...context,
      state: {
        ...context.state,
        panelState: {
          ...context.state.panelState,
          errors: {},
          data: {},
        },
      },
    },
    followUps: toFollowUps(payload),
  };
};

const handleAuthSetUser: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload;
  const normalizedState = normalizeAuthState(context.state);
  const nextUser = payload.user as { uid: string; email?: string } | null | undefined;
  return {
    state: {
      ...context,
      state: {
        ...normalizedState,
        auth: {
          ...normalizedState.auth,
          user: nextUser ?? null,
          isLoggedIn: Boolean(nextUser),
        },
      },
    },
    followUps: toFollowUps(payload),
  };
};

const registerHandler = (
  registry: HandlerRegistry<FrameworkContextState>,
  type: string,
  handler: ReducerHandler<FrameworkContextState>,
): void => {
  registry.register(type, handler);
};

export const registerWorkspaceHandlers = (
  registry: HandlerRegistry<FrameworkContextState>,
): void => {
  ['layout/setExpansion', 'layout/setOverlayView', 'layout/setViewportWidthMode'].forEach((type) =>
    registerHandler(registry, type, handleLayoutAction),
  );
  registerHandler(registry, 'layout/setMainAreaCount', handleMainAreaCount);
  registerHandler(registry, 'panels/selectPanel', handleSelectPanel);
  registerHandler(registry, 'panels/assignView', handleAssignView);
  registerHandler(registry, 'panels/setMainViewOrder', handleSetMainViewOrder);
  registerHandler(registry, 'panels/togglePanel', handleTogglePanel);
  registerHandler(registry, 'panels/setScopeMode', handleSetScopeMode);
  registerHandler(registry, 'session/reset', handleSessionReset);
  registerHandler(registry, 'auth/setUser', handleAuthSetUser);
};
