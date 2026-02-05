import type { ToolbarPos, ViewportWidthMode } from './core';
import type { Panel, PanelContainer, View, ViewInstance } from '../domains/panels/types';
import type { ExpanderState } from '../utils/expansion-helpers.js';

export type LayoutExpansion = {
  expanderLeft: ExpanderState;
  expanderRight: ExpanderState;
  expanderBottom: ExpanderState;
};

export type MainAreaPanelCount = 1 | 2 | 3 | 4 | 5;

export type PanelSizeConfig = {
  width?: number;
  height?: number;
};

export type LayoutPreset = {
  name: string;
  mainAreaCount: MainAreaPanelCount;
  viewportWidthMode: ViewportWidthMode;
  expansion: LayoutExpansion;
  mainViewOrder: string[];
  leftViewOrder?: string[];
  rightViewOrder?: string[];
  bottomViewOrder?: string[];
  leftViewId?: string | null;
  rightViewId?: string | null;
  bottomViewId?: string | null;
  panelSizes?: {
    left?: PanelSizeConfig;
    right?: PanelSizeConfig;
    bottom?: PanelSizeConfig;
  };
  isSystemPreset?: boolean;
  viewInstances?: Record<string, ViewInstance>;
};

export type LayoutPresets = Record<string, LayoutPreset>;

// === Framework Menu Types ===

export type MenuItemType = 'parent' | 'preset' | 'action';

export interface MenuItemBase {
  id: string;
  label: string;
  icon?: string;
  order: number;
}

export interface MenuParentItem extends MenuItemBase {
  type: 'parent';
  children: MenuItem[];
}

export interface MenuPresetItem extends MenuItemBase {
  type: 'preset';
  presetName: string;
}

export interface MenuActionItem extends MenuItemBase {
  type: 'action';
  actionType: string;
  payload?: Record<string, unknown>;
}

export type MenuItem = MenuParentItem | MenuPresetItem | MenuActionItem;

export interface MenuConfig {
  items: MenuItem[];
  version: number;
}

export type LayoutState = {
  expansion: LayoutExpansion;
  overlayView: string | null;
  inDesign: boolean;
  viewportWidthMode: ViewportWidthMode;
  mainAreaCount: MainAreaPanelCount;
  mainViewOrder: string[];
  leftViewOrder: string[];
  rightViewOrder: string[];
  bottomViewOrder: string[];
  presets?: LayoutPresets;
  activePreset?: string | null;
  menu?: MenuConfig;
  draggedViewId?: string | null;
};

export type ViewDefinitionSummary = {
  id: string;
  name: string;
  title: string;
  icon: string;
};

/**
 * @deprecated Legacy-only view token cache. Prefer deriving tokens from viewDefinitions.
 */
export type LegacyViewTokenState = {
  registered: Array<{ id: string; label: string }>;
  activeSlots: Array<string | null>;
  tokenOrder: string[];
};

export type ToolbarState = {
  positions: Record<string, ToolbarPos>;
  activePicker: string | null;
};

export type AuthUser = {
  uid: string;
  email?: string;
};

export type AuthState = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  user?: AuthUser | null;
};

export type AuthUiState = {
  loading: boolean;
  error: string | null;
  success: string | null;
};

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: number;
  source?: string;
  data?: any;
}


export type LogState = {
  entries: LogEntry[];
  maxEntries: number;
};

export type FrameworkAuthConfig = {
  enabled: boolean;
  authViewId?: string;
  autoShowOnStartup?: boolean;
  requireAuthForActions?: string[];
  adminEmails?: string[];
};

export type PanelState = {
  open: Record<string, boolean>;
  data: Record<string, unknown>;
  errors: Record<string, unknown>;
};

export type UIState = {
  containers: PanelContainer[];
  panels: Panel[];
  views: View[];
  viewInstances: Record<string, ViewInstance>;
  viewDefinitions: ViewDefinitionSummary[];
  viewInstanceCounter: number;
  viewTokens?: LegacyViewTokenState;
  layout: LayoutState;
  toolbars: ToolbarState;
  activeView: string | null;
  dock: unknown;
  theme: unknown;
  auth: AuthState;
  authUi: AuthUiState;
  authConfig?: FrameworkAuthConfig;
  panelState: PanelState;
  logs: LogState;
};
