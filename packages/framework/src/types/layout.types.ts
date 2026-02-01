// Layout state types

export type LayoutState = {
  expansion: LayoutExpansion;
  overlayView: string | null;
  overlayExpander?: string | null;
  inDesign: boolean;
  viewportWidthMode: ViewportWidthMode;
  mainAreaCount: MainAreaPanelCount;
  mainViewOrder: string[];
  leftViewOrder: string[];
  rightViewOrder: string[];
  bottomViewOrder: string[];
  presets?: LayoutPresets;
  activePreset?: string | null;
  frameworkMenu?: FrameworkMenuConfig;
  draggedViewId?: string | null;
}