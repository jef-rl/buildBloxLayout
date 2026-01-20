import type { ToolbarPos, ViewportWidthMode } from './core';
import type { Panel, PanelContainer, View } from '../domains/panels/types';

export type LayoutExpansion = {
  left: boolean;
  right: boolean;
  bottom: boolean;
};

export type MainAreaPanelCount = 1 | 2 | 3 | 4 | 5;

export type LayoutState = {
  expansion: LayoutExpansion;
  overlayView: string | null;
  viewportWidthMode: ViewportWidthMode;
  mainAreaCount: MainAreaPanelCount;
  mainViewOrder: string[];
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
