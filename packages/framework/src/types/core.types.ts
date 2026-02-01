export type PanelMode = 'text' | 'visual';
export type ViewportWidthMode = '1x' | '2x' | '3x' | '4x' | '5x' | string ;

export type ToolbarPos =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-right'
  | 'bottom-right'
  | 'bottom-center'
  | 'bottom-left'
  | 'middle-left';

export type ViewId =
  | 'project-save'
  | 'open-library'
  | 'import-paste'
  | 'ai-prompt'
  | 'settings'
  | 'visual-editor'
  | 'visual-render'
  | 'visual-preview'
  | 'visual-projection'
  | 'visual-inspector'
  | '';

export type ModalType = ViewId;

export type AiPanel = 'scope' | 'template' | 'styles' | '';

export interface CloudProjectMeta {
  id: string;
  name: string;
  tags?: string[];
}

export interface ProjectPayload {
  name: string;
  tags: string[];
  scope: string;
  template: string;
  styles: string;
}

export interface StoredProject {
  id?: string;
  name: string;
  tags: string[];
  scope: string;
  template: string;
  styles: string;
}
