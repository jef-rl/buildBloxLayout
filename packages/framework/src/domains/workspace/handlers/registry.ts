import type { UIState, LayoutPreset, LayoutPresets, MenuConfig, LayoutExpansion } from '../../../types/state';
import type { HandlerAction } from '../../../core/registry/HandlerAction.type';
import type { HandlerRegistry } from '../../../core/registry/HandlerRegistry.type';
import type { ReducerHandler } from '../../../core/registry/ReducerHandler.type';
import { applyLayoutAction, clampViewportModeToCapacity } from './workspace-layout.handlers';
import { applyMainViewOrder, deriveMainViewOrderFromPanels, workspacePanelHandlers } from './workspace-panels.handlers';
import { dragHandlers } from '../../layout/handlers/drag.handlers';
import { viewInstanceHandlers } from '../../layout/handlers/view-instances';
import { menuPersistence } from '../../../utils/menu-persistence';
import { migrateLegacyExpansion, type LegacyLayoutExpansion } from '../../../utils/expansion-helpers.js';
import { generateAuthMenuItems } from '../../../utils/auth-menu-items';
import { ActionCatalog } from '../../../../nxt/runtime/actions/action-catalog';

export const FRAMEWORK_ADMIN_EMAILS: string[] = ['jef@@gourmetguide.co.uk']

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
  type: ActionCatalog.LogsAppend,
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
      leftViewOrder: Array.isArray(layout.leftViewOrder) ? layout.leftViewOrder : [],
      rightViewOrder: Array.isArray(layout.rightViewOrder) ? layout.rightViewOrder : [],
      bottomViewOrder: Array.isArray(layout.bottomViewOrder) ? layout.bottomViewOrder : [],
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
      type: ActionCatalog.LayoutSetOverlayView,
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

const handleLayoutReset: ReducerHandler<FrameworkContextState> = (context) => {
  const normalizedState = normalizeLayoutState(context.state);
  const nextPanels = normalizedState.panels.map((panel) => ({
    ...panel,
    view: null,
    viewId: undefined,
    activeViewId: undefined,
  }));

  return {
    state: {
      ...context,
      state: {
        ...normalizedState,
        panels: nextPanels,
        layout: {
          ...normalizedState.layout,
          expansion: {
            expanderLeft: 'Closed',
            expanderRight: 'Closed',
            expanderBottom: 'Closed',
          },
          mainViewOrder: deriveMainViewOrderFromPanels(nextPanels),
          leftViewOrder: [],
          rightViewOrder: [],
          bottomViewOrder: [],
        },
      },
    },
    followUps: [],
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
      type: ActionCatalog.LayoutSetOverlayView,
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

  // Filter instances logic
  const allUsedViewIds = new Set<string>();
  
  // From Main
  normalizedState.layout.mainViewOrder.forEach(id => allUsedViewIds.add(id));
  
  // From Side Panels (New Orders)
  normalizedState.layout.leftViewOrder.forEach(id => allUsedViewIds.add(id));
  normalizedState.layout.rightViewOrder.forEach(id => allUsedViewIds.add(id));
  normalizedState.layout.bottomViewOrder.forEach(id => allUsedViewIds.add(id));
  
  // From active IDs (just in case they aren't in order list, though they should be)
  panels.forEach(p => {
      if (p.viewId) allUsedViewIds.add(p.viewId);
      if (p.activeViewId) allUsedViewIds.add(p.activeViewId);
  });

  const capturedInstances: Record<string, any> = {};
  const currentInstances = normalizedState.viewInstances || {};
  
  allUsedViewIds.forEach(id => {
      if (currentInstances[id]) {
          capturedInstances[id] = currentInstances[id];
      }
  });

  const preset: LayoutPreset = {
    name,
    mainAreaCount: normalizedState.layout.mainAreaCount,
    viewportWidthMode: normalizedState.layout.viewportWidthMode,
    expansion: { ...normalizedState.layout.expansion },
    mainViewOrder: [...normalizedState.layout.mainViewOrder],
    leftViewOrder: [...normalizedState.layout.leftViewOrder],
    rightViewOrder: [...normalizedState.layout.rightViewOrder],
    bottomViewOrder: [...normalizedState.layout.bottomViewOrder],
    leftViewId: leftPanel?.viewId ?? leftPanel?.activeViewId ?? null,
    rightViewId: rightPanel?.viewId ?? rightPanel?.activeViewId ?? null,
    bottomViewId: bottomPanel?.viewId ?? bottomPanel?.activeViewId ?? null,
    viewInstances: capturedInstances,
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
    type: ActionCatalog.EffectsPresetsSave,
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

  // === CLEAN SLATE: CLEAR ALL PANEL ASSIGNMENTS BEFORE LOADING PRESET ===
  // This ensures we don't have conflicts with the 1:1 view-to-panel constraint
  // but we keep the view instances alive in the background.
  const clearedPanels = normalizedState.panels.map(p => ({
      ...p,
      view: null,
      viewId: undefined,
      activeViewId: undefined
  }));

  // Restore Instances
  const restoredInstances = { ...(normalizedState.viewInstances || {}), ...(preset.viewInstances || {}) };

  const intermediateState = {
      ...normalizedState,
      panels: clearedPanels,
      viewInstances: restoredInstances,
      layout: {
          ...normalizedState.layout,
          mainViewOrder: []
      }
  };

  // Build follow-up actions for view assignments
  const followUps: HandlerAction[] = [...toFollowUps(payload)];

  // Assign views to side panels if specified
  if (preset.leftViewId) {
    const leftPanel = clearedPanels.find(p => p.region === 'left');
    if (leftPanel) {
      followUps.push({ type: ActionCatalog.PanelsAssignView, payload: { viewId: preset.leftViewId, panelId: leftPanel.id } });
    }
  }
  if (preset.rightViewId) {
    const rightPanel = clearedPanels.find(p => p.region === 'right');
    if (rightPanel) {
      followUps.push({ type: ActionCatalog.PanelsAssignView, payload: { viewId: preset.rightViewId, panelId: rightPanel.id } });
    }
  }
  if (preset.bottomViewId) {
    const bottomPanel = clearedPanels.find(p => p.region === 'bottom');
    if (bottomPanel) {
      followUps.push({ type: ActionCatalog.PanelsAssignView, payload: { viewId: preset.bottomViewId, panelId: bottomPanel.id } });
    }
  }

  // Apply main view order after setting main area count
  followUps.push({ type: ActionCatalog.PanelsSetMainViewOrder, payload: { viewOrder: preset.mainViewOrder } });

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
        ...intermediateState,
        layout: {
          ...intermediateState.layout,
          expansion,
          viewportWidthMode: preset.viewportWidthMode,
          mainAreaCount: preset.mainAreaCount,
          activePreset: name,
          leftViewOrder: preset.leftViewOrder || [],
          rightViewOrder: preset.rightViewOrder || [],
          bottomViewOrder: preset.bottomViewOrder || [],
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
    type: ActionCatalog.EffectsPresetsDelete,
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
    type: ActionCatalog.EffectsPresetsRename,
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

const handleMenuReorderItems: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload & { draggedId?: string; targetId?: string };
  const normalizedState = normalizeLayoutState(context.state);
  const { draggedId, targetId } = payload;

  if (!draggedId || !targetId) {
    return { state: context, followUps: toFollowUps(payload) };
  }

  const currentConfig = normalizedState.layout.menu ?? menuPersistence.getDefaultConfig();
  const newItems = menuPersistence.reorderItems(currentConfig.items, draggedId, targetId);
  const newConfig: MenuConfig = { ...currentConfig, items: newItems };

  const followUps = toFollowUps(payload);
  followUps.push({
    type: ActionCatalog.EffectsMenuSave,
    payload: { config: newConfig },
  });

  return {
    state: {
      ...context,
      state: {
        ...normalizedState,
        layout: {
          ...normalizedState.layout,
          menu: newConfig,
        },
      },
    },
    followUps,
  };
};

const handleMenuUpdateConfig: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload & { config?: MenuConfig };
  const normalizedState = normalizeLayoutState(context.state);
  const { config } = payload;

  if (!config) {
    return { state: context, followUps: toFollowUps(payload) };
  }

  const followUps = toFollowUps(payload);
  followUps.push({
    type: ActionCatalog.EffectsMenuSave,
    payload: { config },
  });

  return {
    state: {
      ...context,
      state: {
        ...normalizedState,
        layout: {
          ...normalizedState.layout,
          menu: config,
        },
      },
    },
    followUps,
  };
};

const handleMenuHydrate: ReducerHandler<FrameworkContextState> = (context, action) => {
  const payload = (action.payload ?? {}) as StateActionPayload;
  const normalizedState = normalizeLayoutState(context.state);

  const providedConfig = payload.config as MenuConfig | undefined;
  const loadedConfig = providedConfig ?? menuPersistence.getDefaultConfig();

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
          menu: finalConfig,
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
  [
    ActionCatalog.LayoutSetExpansion,
    ActionCatalog.LayoutSetOverlayView,
    ActionCatalog.LayoutSetViewportWidthMode,
  ].forEach((type) => registerHandler(registry, type, handleLayoutAction));
  registerHandler(registry, ActionCatalog.LayoutSetMainAreaCount, handleMainAreaCount);
  registerHandler(registry, ActionCatalog.LayoutResetWorkspace, handleLayoutReset);
  registerHandler(registry, ActionCatalog.LayoutToggleInDesign, handleToggleInDesign);
  registerHandler(registry, ActionCatalog.PanelsSelectPanel, handleSelectPanel);
  
  // Use the robust handler from workspace-panels.handlers
  registerHandler(registry, ActionCatalog.PanelsAssignView, wrapHandler(workspacePanelHandlers[ActionCatalog.PanelsAssignView]));
  registerHandler(registry, ActionCatalog.PanelsRemoveView, wrapHandler(workspacePanelHandlers[ActionCatalog.PanelsRemoveView]));
  
  registerHandler(registry, ActionCatalog.PanelsSetMainViewOrder, handleSetMainViewOrder);
  registerHandler(registry, ActionCatalog.AuthSetUser, handleAuthSetUser);
  registerHandler(registry, ActionCatalog.AuthSetUi, handleAuthSetUi);

  // Register Drag Handlers
  Object.entries(dragHandlers).forEach(([type, handler]) => {
      registerHandler(registry, type, wrapHandler(handler));
  });

  // Register View Instance Handlers
  Object.entries(viewInstanceHandlers).forEach(([type, handler]) => {
      registerHandler(registry, type, handler);
  });

  // Preset handlers
  registerHandler(registry, ActionCatalog.PresetsSave, handlePresetSave);
  registerHandler(registry, ActionCatalog.PresetsLoad, handlePresetLoad);
  registerHandler(registry, ActionCatalog.PresetsDelete, handlePresetDelete);
  registerHandler(registry, ActionCatalog.PresetsRename, handlePresetRename);
  registerHandler(registry, ActionCatalog.PresetsHydrate, handlePresetHydrate);

  // Framework menu handlers
  registerHandler(registry, ActionCatalog.MenuReorderItems, handleMenuReorderItems);
  registerHandler(registry, ActionCatalog.MenuUpdateConfig, handleMenuUpdateConfig);
  registerHandler(registry, ActionCatalog.MenuHydrate, handleMenuHydrate);
};
