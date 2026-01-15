export type PanelRegion = 'main' | 'left' | 'right' | 'bottom' | 'overlay';

export interface Panel {
  id: string;
  name: string;
  region: PanelRegion;
  view: View | null;
  viewId?: string;
  activeViewId?: string;
  element?: HTMLElement | null;
  width?: number;
  height?: number;
}

export interface PanelContainer {
  id: string;
  name: string;
  panels: Panel[];
  direction: 'row' | 'column';
  element?: HTMLElement | null;
}

export interface PanelState {
  view: View | null;
  viewId?: string;
  activeViewId?: string;
  region?: PanelRegion;
  width?: number;
  height?: number;
  name?: string;
}

export interface View {
  id: string;
  name: string;
  component: string;
  data?: unknown;
  element?: HTMLElement;
}

export type ViewComponent = () => Promise<any>;

export interface ViewDefinition {
  id: string;
  name: string;
  component: ViewComponent;
  title: string;
  tag: string;
}
