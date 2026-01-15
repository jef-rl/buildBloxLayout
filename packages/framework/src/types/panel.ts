export interface Panel {
  id: string;
  name: string;
  views: View[];
  element?: HTMLElement | null;
  activeView?: string | null;
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
  activePanel: string;
  panels: Panel[];
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
