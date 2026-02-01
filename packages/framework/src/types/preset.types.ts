// Preset types

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
}