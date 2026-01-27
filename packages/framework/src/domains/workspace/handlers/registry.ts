import type { UIState, LayoutPreset, LayoutPresets, FrameworkMenuConfig, LayoutExpansion } from '../../../types/state';
import type { HandlerAction, HandlerRegistry, ReducerHandler } from '../../../core/registry/handler-registry';
import { viewRegistry } from '../../../core/registry/view-registry';
import { applyLayoutAction, clampViewportModeToCapacity } from './workspace-layout.handlers';
import { applyMainViewOrder, deriveMainViewOrderFromPanels, workspacePanelHandlers } from './workspace-panels.handlers';
import { dragHandlers } from '../../layout/handlers/drag.handlers';
import { frameworkMenuPersistence } from '../../../utils/framework-menu-persistence';
import { migrateLegacyExpansion, type LegacyLayoutExpansion } from '../../../utils/expansion-helpers.js';
import { generateAuthMenuItems } from '../../../utils/auth-menu-items';
import { FRAMEWORK_ADMIN_EMAILS } from '../../../config/admin-emails';

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

const LOG_SOURCE = 'workspace/handlers';

const buildLogAction = (
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, unknown>,
): HandlerAction => ({
  type: 'logs/append',
  payload: {
    level,
    message,
    data,
    source: LOG_SOURCE,
  },
});

const withLog = (
  followUps: HandlerAction[],
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, unknown>,
) => [...followUps, buildLogAction(level, message, data)];

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
      inDesign: typeof layout.inDesign === 'boolean' ? layout.inDesign : false,
      viewportWidthMode: layout.viewportWidthMode ?? '1x',
      mainAreaCount: layout.mainAreaCount ?? 1,
      mainViewOrder: Array.isArray(layout.mainViewOrder) ? layout.mainViewOrder : [],
      presets: layout.presets ?? {},
      activePreset: layout.activePreset ?? null,
    },
  };
};

// Wrapper helper to convert UIState handlers to FrameworkContextState handlers
const wrapHandler = (handler: ReducerHandler<UIState>): ReducerHandler<FrameworkContextState> => {
  return (context, action) => {
    const result = handler(context.state, action);
    return {
      state: {
        ...context,
        state: result.state,
      },
      followUps: result.followUps,
    };
  };
};

const handleToggleInDesign: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload & { overlayViewId?: string; inDesign?: boolean };
  const normalizedState = normalizeLayoutState(context.state);

  if (!normalizedState.auth?.isAdmin) {
    return {
      state: context,
      followUps: withLog(toFollowUps(payload), 'warn', 'In-design toggle ignored: admin only.'),
    };
  }

  const nextInDesign = typeof payload.inDesign === 'boolean'
    ? payload.inDesign
    : !normalizedState.layout.inDesign;
  const followUps = toFollowUps(payload);
  if (nextInDesign && payload.overlayViewId) {
    followUps.push({
      type: 'layout/setOverlayView',
      payload: { viewId: payload.overlayViewId },
    });
  }

  return {
    state: {
      ...context,
      state: {
        ...normalizedState,
        layout: {
          ...normalizedState.layout,
          inDesign: nextInDesign,
        },
      },
    },
    followUps,
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
    authUi: {
      loading: state.authUi?.loading ?? false,
      error: state.authUi?.error ?? null,
      success: state.authUi?.success ?? null,
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

  // Determine admin status from both framework-level and implementation-level lists
  const frameworkAdmins = FRAMEWORK_ADMIN_EMAILS;
  const implementationAdmins = normalizedState.authConfig?.adminEmails ?? [];
  const userEmail = nextUser?.email?.toLowerCase();
  const isAdmin = !!userEmail && (
    frameworkAdmins.some((email: string) => email.toLowerCase() === userEmail) ||
    implementationAdmins.some((email: string) => email.toLowerCase() === userEmail)
  );

  const authConfig = normalizedState.authConfig;
  const authViewId = authConfig?.authViewId ?? 'firebase-auth';
  const shouldAutoShowAuth = !nextUser && authConfig?.enabled && authConfig?.autoShowOnStartup;
  const shouldOpenAuthOverlay = shouldAutoShowAuth && normalizedState.layout?.overlayView !== authViewId;

  const followUps = toFollowUps(payload);
  if (shouldOpenAuthOverlay) {
    followUps.push({
      type: 'layout/setOverlayView',
      payload: { viewId: authViewId },
    });
  }

  return {
    state: {
      ...context,
      state: {
        ...normalizedState,
        auth: {
          ...normalizedState.auth,
          user: nextUser ?? null,
          isLoggedIn: Boolean(nextUser),
          isAdmin,
        },
      },
    },
    followUps,
  };
};

const handleAuthLogout: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload;
  const followUps = toFollowUps(payload);
  followUps.push({ type: 'effects/auth/logout', payload: {} });
  return { state: context, followUps };
};

const handleAuthSetUi: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload & {
    loading?: boolean;
    error?: string | null;
    success?: string | null;
  };
  return {
    state: {
      ...context,
      state: {
        ...context.state,
        authUi: {
          ...context.state.authUi,
          loading: typeof payload.loading === 'boolean' ? payload.loading : context.state.authUi.loading,
          error: payload.error !== undefined ? payload.error : context.state.authUi.error,
          success: payload.success !== undefined ? payload.success : context.state.authUi.success,
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
    return {
      state: context,
      followUps: withLog(toFollowUps(payload), 'warn', 'Preset save skipped: missing name.'),
    };
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

  const followUps = withLog(
    toFollowUps(payload),
    'info',
    'Saving preset.',
    { name },
  );
  followUps.push({
    type: 'effects/presets/save',
    payload: { name, preset },
  });

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
    followUps,
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

  const followUps = toFollowUps(payload);
  followUps.push({
    type: 'effects/presets/delete',
    payload: { name },
  });

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
    followUps,
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

  const followUps = toFollowUps(payload);
  followUps.push({
    type: 'effects/presets/rename',
    payload: { oldName, newName },
  });

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
    followUps,
  };
};

const handlePresetHydrate: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload;
  const normalizedState = normalizeLayoutState(context.state);
  const baseFollowUps = toFollowUps(payload);

  const providedPresets = payload.presets as LayoutPresets | undefined;
  if (!providedPresets) {
    return {
      state: context,
      followUps: baseFollowUps,
    };
  }

  // Merge with existing presets (payload presets as base, existing as overrides)
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
    followUps: withLog(
      baseFollowUps,
      'info',
      'Presets hydrated from payload.',
      {
        providedCount: Object.keys(providedPresets).length,
        mergedCount: Object.keys(mergedPresets).length,
      },
    ),
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

  const followUps = toFollowUps(payload);
  followUps.push({
    type: 'effects/frameworkMenu/save',
    payload: { config: newConfig },
  });

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
    followUps,
  };
};

const handleFrameworkMenuUpdateConfig: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload & { config?: FrameworkMenuConfig };
  const normalizedState = normalizeLayoutState(context.state);
  const { config } = payload;

  if (!config) {
    return { state: context, followUps: toFollowUps(payload) };
  }

  const followUps = toFollowUps(payload);
  followUps.push({
    type: 'effects/frameworkMenu/save',
    payload: { config },
  });

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
    followUps,
  };
};

const handleFrameworkMenuHydrate: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload;
  const normalizedState = normalizeLayoutState(context.state);

  const providedConfig = payload.config as FrameworkMenuConfig | undefined;
  const loadedConfig = providedConfig ?? frameworkMenuPersistence.getDefaultConfig();

  // Inject auth menu items if auth is configured
  const authConfig = normalizedState.authConfig;
  let finalMenuItems = [...loadedConfig.items];

  if (finalMenuItems.length === 0) {
    const presets = normalizedState.layout?.presets ?? {};
    const systemPresets = Object.values(presets).filter((preset) => preset.isSystemPreset === true);
    if (systemPresets.length > 0) {
      finalMenuItems = systemPresets.map((preset, index) => ({
        id: `preset-${preset.name}`,
        type: 'preset' as const,
        label: preset.name,
        presetName: preset.name,
        order: index,
      }));
    }
  }

  if (authConfig?.enabled) {
    const authItems = generateAuthMenuItems(authConfig, normalizedState.auth);
    // Auth items should appear at the beginning of the menu
    finalMenuItems = [...authItems, ...finalMenuItems];
  }

  const finalConfig = {
    ...loadedConfig,
    items: finalMenuItems,
  };

  return {
    state: {
      ...context,
      state: {
        ...normalizedState,
        layout: {
          ...normalizedState.layout,
          frameworkMenu: finalConfig,
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
  registerHandler(registry, 'layout/toggleInDesign', handleToggleInDesign);
  registerHandler(registry, 'panels/selectPanel', handleSelectPanel);
  
  // Use the robust handler from workspace-panels.handlers
  registerHandler(registry, 'panels/assignView', wrapHandler(workspacePanelHandlers['panels/assignView']));
  
  registerHandler(registry, 'panels/setMainViewOrder', handleSetMainViewOrder);
  registerHandler(registry, 'panels/togglePanel', handleTogglePanel);
  registerHandler(registry, 'panels/setScopeMode', handleSetScopeMode);
  registerHandler(registry, 'session/reset', handleSessionReset);
  registerHandler(registry, 'auth/setUser', handleAuthSetUser);
  registerHandler(registry, 'auth/logout', handleAuthLogout);
  registerHandler(registry, 'auth/setUi', handleAuthSetUi);

  // Register Drag Handlers
  Object.entries(dragHandlers).forEach(([type, handler]) => {
      registerHandler(registry, type, wrapHandler(handler));
  });

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
