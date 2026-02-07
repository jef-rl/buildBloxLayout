export type PanelRegion = 'main' | 'left' | 'right' | 'bottom' | 'overlay';

export type PanelView = {
  id?: string;
  component?: string;
  viewType?: string;
  data?: unknown;
};

export type Panel = {
  id: string;
  region: PanelRegion;
  viewId?: string | null;
  activeViewId?: string | null;
  view?: PanelView | null;
};
