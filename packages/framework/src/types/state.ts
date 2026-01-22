import type { ToolbarPos, ViewportWidthMode } from './core';
import type { Panel, PanelContainer, View } from '../domains/panels/types';
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
  leftViewId?: string | null;
  rightViewId?: string | null;
  bottomViewId?: string | null;
  panelSizes?: {
    left?: PanelSizeConfig;
    right?: PanelSizeConfig;
    bottom?: PanelSizeConfig;
  };
  isSystemPreset?: boolean;
};

export type LayoutPresets = Record<string, LayoutPreset>;

// === Framework Menu Types ===

export type FrameworkMenuItemType = 'parent' | 'preset' | 'action';

export interface FrameworkMenuItemBase {
  id: string;
  label: string;
  icon?: string;
  order: number;
}

export interface FrameworkMenuParentItem extends FrameworkMenuItemBase {
  type: 'parent';
  children: FrameworkMenuItem[];
}

export interface FrameworkMenuPresetItem extends FrameworkMenuItemBase {
  type: 'preset';
  presetName: string;
}

export interface FrameworkMenuActionItem extends FrameworkMenuItemBase {
  type: 'action';
  actionType: string;
  payload?: Record<string, unknown>;
}

export type FrameworkMenuItem = FrameworkMenuParentItem | FrameworkMenuPresetItem | FrameworkMenuActionItem;

export interface FrameworkMenuConfig {
  items: FrameworkMenuItem[];
  version: number;
}

export type LayoutState = {
  expansion: LayoutExpansion;
  overlayView: string | null;
  viewportWidthMode: ViewportWidthMode;
  mainAreaCount: MainAreaPanelCount;
  mainViewOrder: string[];
  presets?: LayoutPresets;
  activePreset?: string | null;
  frameworkMenu?: FrameworkMenuConfig;
};

export type RegisteredViewSummary = {
  id: string;
  label: string;
};

export type ViewTokenState = {
  registered: RegisteredViewSummary[];
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
  user?: AuthUser | null;
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
  viewTokens: ViewTokenState;
  layout: LayoutState;
  toolbars: ToolbarState;
  activeView: string | null;
  dock: unknown;
  theme: unknown;
  auth: AuthState;
  panelState: PanelState;
};
