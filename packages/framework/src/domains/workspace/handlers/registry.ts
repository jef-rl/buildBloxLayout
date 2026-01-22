import type { UIState, LayoutPreset, LayoutPresets, FrameworkMenuConfig, FrameworkMenuItem, LayoutExpansion } from '../../../types/state';
import type { HandlerAction, HandlerRegistry, ReducerHandler } from '../../../core/registry/handler-registry';
import { viewRegistry } from '../../../core/registry/view-registry';
import { applyLayoutAction, clampViewportModeToCapacity } from './workspace-layout.handlers';
import { applyMainViewOrder, deriveMainViewOrderFromPanels } from './workspace-panels.handlers';
import { presetPersistence } from '../../../utils/persistence';
import { frameworkMenuPersistence } from '../../../utils/framework-menu-persistence';
import { migrateLegacyExpansion, type LegacyLayoutExpansion } from '../../../utils/expansion-helpers.js';

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

  // Migration logic: detect and convert legacy boolean format
  let expansion: LayoutExpansion;
  if (layout.expansion) {
    const exp = layout.expansion as any;
    // Detect legacy format by checking for boolean 'left' property
    if (typeof exp.left === 'boolean') {
      expansion = migrateLegacyExpansion(exp as LegacyLayoutExpansion);
    } else if (exp.expanderLeft) {
      expansion = exp as LayoutExpansion;
    } else {
      // Fallback to defaults
      expansion = { expanderLeft: 'Closed', expanderRight: 'Closed', expanderBottom: 'Closed' };
    }
  } else {
    expansion = { expanderLeft: 'Closed', expanderRight: 'Closed', expanderBottom: 'Closed' };
  }

  return {
    ...state,
    layout: {
      ...layout,
      expansion,
      overlayView: layout.overlayView ?? null,
      viewportWidthMode: layout.viewportWidthMode ?? '1x',
      mainAreaCount: layout.mainAreaCount ?? 1,
      mainViewOrder: Array.isArray(layout.mainViewOrder) ? layout.mainViewOrder : [],
      presets: layout.presets ?? {},
      activePreset: layout.activePreset ?? null,
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

  // === SYNC PANEL COUNT TO MATCH CAPACITY ===
  const currentMainPanels = normalizedState.panels.filter(p => p.region === 'main');
  const targetCount = finalLayout.mainAreaCount;
  const currentCount = currentMainPanels.length;

  let nextPanels = [...normalizedState.panels];

  if (currentCount < targetCount) {
    // CASE 1: Need to create more panels
    const panelsToCreate = targetCount - currentCount;
    for (let i = 0; i < panelsToCreate; i++) {
      const newPanelIndex = currentCount + i;
      nextPanels.push({
        id: `panel-main-${newPanelIndex + 1}`,
        name: `Main Panel ${newPanelIndex + 1}`,
        region: 'main',
        viewId: undefined,
        view: null
      });
    }
  } else if (currentCount > targetCount) {
    // CASE 2: Need to remove excess panels
    const mainPanelsToKeep = currentMainPanels.slice(0, targetCount);
    const otherPanels = normalizedState.panels.filter(p => p.region !== 'main');
    nextPanels = [...mainPanelsToKeep, ...otherPanels];
  }
  // === END SYNC CODE ===

  const draftState = {
    ...normalizedState,
    layout: finalLayout,
    panels: nextPanels,
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

// === PRESET HANDLERS ===

const handlePresetSave: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload;
  const name = payload.name as string | undefined;
  if (!name) {
    return { state: context, followUps: toFollowUps(payload) };
  }

  const normalizedState = normalizeLayoutState(context.state);
  const panels = normalizedState.panels ?? [];

  const leftPanel = panels.find(p => p.region === 'left');
  const rightPanel = panels.find(p => p.region === 'right');
  const bottomPanel = panels.find(p => p.region === 'bottom');

  const preset: LayoutPreset = {
    name,
    mainAreaCount: normalizedState.layout.mainAreaCount,
    viewportWidthMode: normalizedState.layout.viewportWidthMode,
    expansion: { ...normalizedState.layout.expansion },
    mainViewOrder: [...normalizedState.layout.mainViewOrder],
    leftViewId: leftPanel?.viewId ?? leftPanel?.activeViewId ?? null,
    rightViewId: rightPanel?.viewId ?? rightPanel?.activeViewId ?? null,
    bottomViewId: bottomPanel?.viewId ?? bottomPanel?.activeViewId ?? null,
  };

  const nextPresets = {
    ...normalizedState.layout.presets,
    [name]: preset,
  };

  // Persist to localStorage
  presetPersistence.saveAll(nextPresets);

  return {
    state: {
      ...context,
      state: {
        ...normalizedState,
        layout: {
          ...normalizedState.layout,
          presets: nextPresets,
          activePreset: name,
        },
      },
    },
    followUps: toFollowUps(payload),
  };
};

const handlePresetLoad: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload;
  const name = payload.name as string | undefined;
  if (!name) {
    return { state: context, followUps: toFollowUps(payload) };
  }

  const normalizedState = normalizeLayoutState(context.state);
  const preset = normalizedState.layout.presets?.[name];
  if (!preset) {
    return { state: context, followUps: toFollowUps(payload) };
  }

  // Build follow-up actions for view assignments
  const followUps: HandlerAction[] = [...toFollowUps(payload)];

  // Assign views to side panels if specified
  if (preset.leftViewId) {
    const leftPanel = normalizedState.panels.find(p => p.region === 'left');
    if (leftPanel) {
      followUps.push({ type: 'panels/assignView', payload: { viewId: preset.leftViewId, panelId: leftPanel.id } });
    }
  }
  if (preset.rightViewId) {
    const rightPanel = normalizedState.panels.find(p => p.region === 'right');
    if (rightPanel) {
      followUps.push({ type: 'panels/assignView', payload: { viewId: preset.rightViewId, panelId: rightPanel.id } });
    }
  }
  if (preset.bottomViewId) {
    const bottomPanel = normalizedState.panels.find(p => p.region === 'bottom');
    if (bottomPanel) {
      followUps.push({ type: 'panels/assignView', payload: { viewId: preset.bottomViewId, panelId: bottomPanel.id } });
    }
  }

  // Apply main view order after setting main area count
  followUps.push({ type: 'panels/setMainViewOrder', payload: { viewOrder: preset.mainViewOrder } });

  // Migrate expansion if needed
  let expansion: LayoutExpansion;
  const presetExpansion = preset.expansion as any;
  if (typeof presetExpansion.left === 'boolean') {
    expansion = migrateLegacyExpansion(presetExpansion as LegacyLayoutExpansion);
  } else {
    expansion = { ...preset.expansion } as LayoutExpansion;
  }

  return {
    state: {
      ...context,
      state: {
        ...normalizedState,
        layout: {
          ...normalizedState.layout,
          expansion,
          viewportWidthMode: preset.viewportWidthMode,
          mainAreaCount: preset.mainAreaCount,
          activePreset: name,
        },
      },
    },
    followUps,
  };
};

const handlePresetDelete: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload;
  const name = payload.name as string | undefined;
  if (!name) {
    return { state: context, followUps: toFollowUps(payload) };
  }

  const normalizedState = normalizeLayoutState(context.state);
  const nextPresets = { ...normalizedState.layout.presets };
  delete nextPresets[name];

  // Persist to localStorage
  presetPersistence.saveAll(nextPresets);

  // Clear activePreset if it was the deleted one
  const nextActivePreset = normalizedState.layout.activePreset === name
    ? null
    : normalizedState.layout.activePreset;

  return {
    state: {
      ...context,
      state: {
        ...normalizedState,
        layout: {
          ...normalizedState.layout,
          presets: nextPresets,
          activePreset: nextActivePreset,
        },
      },
    },
    followUps: toFollowUps(payload),
  };
};

const handlePresetRename: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload;
  const oldName = payload.oldName as string | undefined;
  const newName = payload.newName as string | undefined;
  if (!oldName || !newName || oldName === newName) {
    return { state: context, followUps: toFollowUps(payload) };
  }

  const normalizedState = normalizeLayoutState(context.state);
  const preset = normalizedState.layout.presets?.[oldName];
  if (!preset) {
    return { state: context, followUps: toFollowUps(payload) };
  }

  const nextPresets = { ...normalizedState.layout.presets };
  delete nextPresets[oldName];
  nextPresets[newName] = { ...preset, name: newName };

  // Persist to localStorage
  presetPersistence.saveAll(nextPresets);

  // Update activePreset if it was renamed
  const nextActivePreset = normalizedState.layout.activePreset === oldName
    ? newName
    : normalizedState.layout.activePreset;

  return {
    state: {
      ...context,
      state: {
        ...normalizedState,
        layout: {
          ...normalizedState.layout,
          presets: nextPresets,
          activePreset: nextActivePreset,
        },
      },
    },
    followUps: toFollowUps(payload),
  };
};

const handlePresetHydrate: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload;
  const normalizedState = normalizeLayoutState(context.state);

  // Check if presets were passed directly (from async Firestore load)
  const providedPresets = payload.presets as LayoutPresets | undefined;
  if (providedPresets) {
    // Merge with existing presets (Firestore presets as base, existing as overrides)
    const existingPresets = normalizedState.layout.presets ?? {};
    const mergedPresets = { ...providedPresets, ...existingPresets };
    return {
      state: {
        ...context,
        state: {
          ...normalizedState,
          layout: {
            ...normalizedState.layout,
            presets: mergedPresets,
          },
        },
      },
      followUps: toFollowUps(payload),
    };
  }

  // Fallback to localStorage (existing behavior)
  const loadedPresets = presetPersistence.loadAll();
  if (!loadedPresets) {
    return { state: context, followUps: toFollowUps(payload) };
  }

  return {
    state: {
      ...context,
      state: {
        ...normalizedState,
        layout: {
          ...normalizedState.layout,
          presets: loadedPresets,
        },
      },
    },
    followUps: toFollowUps(payload),
  };
};

// === END PRESET HANDLERS ===

// === FRAMEWORK MENU HANDLERS ===

const handleFrameworkMenuReorderItems: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload & { draggedId?: string; targetId?: string };
  const normalizedState = normalizeLayoutState(context.state);
  const { draggedId, targetId } = payload;

  if (!draggedId || !targetId) {
    return { state: context, followUps: toFollowUps(payload) };
  }

  const currentConfig = normalizedState.layout.frameworkMenu ?? frameworkMenuPersistence.getDefaultConfig();
  const newItems = frameworkMenuPersistence.reorderItems(currentConfig.items, draggedId, targetId);
  const newConfig: FrameworkMenuConfig = { ...currentConfig, items: newItems };

  frameworkMenuPersistence.save(newConfig);

  return {
    state: {
      ...context,
      state: {
        ...normalizedState,
        layout: {
          ...normalizedState.layout,
          frameworkMenu: newConfig,
        },
      },
    },
    followUps: toFollowUps(payload),
  };
};

const handleFrameworkMenuUpdateConfig: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload & { config?: FrameworkMenuConfig };
  const normalizedState = normalizeLayoutState(context.state);
  const { config } = payload;

  if (!config) {
    return { state: context, followUps: toFollowUps(payload) };
  }

  frameworkMenuPersistence.save(config);

  return {
    state: {
      ...context,
      state: {
        ...normalizedState,
        layout: {
          ...normalizedState.layout,
          frameworkMenu: config,
        },
      },
    },
    followUps: toFollowUps(payload),
  };
};

const handleFrameworkMenuHydrate: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload;
  const normalizedState = normalizeLayoutState(context.state);

  const loadedConfig = frameworkMenuPersistence.load() ?? frameworkMenuPersistence.getDefaultConfig();

  return {
    state: {
      ...context,
      state: {
        ...normalizedState,
        layout: {
          ...normalizedState.layout,
          frameworkMenu: loadedConfig,
        },
      },
    },
    followUps: toFollowUps(payload),
  };
};

// === END FRAMEWORK MENU HANDLERS ===

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

  // Preset handlers
  registerHandler(registry, 'presets/save', handlePresetSave);
  registerHandler(registry, 'presets/load', handlePresetLoad);
  registerHandler(registry, 'presets/delete', handlePresetDelete);
  registerHandler(registry, 'presets/rename', handlePresetRename);
  registerHandler(registry, 'presets/hydrate', handlePresetHydrate);

  // Framework menu handlers
  registerHandler(registry, 'frameworkMenu/reorderItems', handleFrameworkMenuReorderItems);
  registerHandler(registry, 'frameworkMenu/updateConfig', handleFrameworkMenuUpdateConfig);
  registerHandler(registry, 'frameworkMenu/hydrate', handleFrameworkMenuHydrate);
};
