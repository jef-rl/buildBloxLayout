export type ValueChangeDetail<T> = T;

export interface ToolbarPositionDetail {
  toolbarId: string;
  position: string;
}

export interface PanelToggleDetail {
  panelId: string;
}

export interface ScopeModeDetail {
  mode: string;
}

export interface ViewportModeDetail {
  mode: string;
}

export interface ModalHostKeyDetail {
  key: string;
}

export interface JsonEditorPathDetail {
  path: (string | number)[];
}

export interface JsonEditorChangeDetail extends JsonEditorPathDetail {
  value?: unknown;
  type?: string;
}

export interface ProjectMetaDetail {
  id?: string;
  name?: string;
  tags?: string[] | string;
  event?: Event;
}

export interface AiPromptDetail {
  panelId?: string;
  prompt?: string;
}

export interface FileEventDetail {
  file?: File;
}
