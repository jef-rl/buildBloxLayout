import type { ToolbarPos, ViewportWidthMode } from './core';
import type { Panel, PanelContainer, View } from './panel';

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
};

export type ToolbarState = {
  positions: Record<string, ToolbarPos>;
  activePicker: string | null;
};

export type UIState = {
  containers: PanelContainer[];
  panels: Panel[];
  views: View[];
  layout: LayoutState;
  toolbars: ToolbarState;
  activeView: string | null;
  dock: unknown;
  theme: unknown;
};
