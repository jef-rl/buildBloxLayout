export type VisualBlockModalStateDto = {
  open: boolean;
  mode: string;
  title?: string;
  content?: string;
  contextId?: string;
};

export type VisualBlockUiStateDto = {
  zoom: number;
  mode: string;
  selectedIds: string[];
  blockId: string;
  rotationY: number;
  modalState: VisualBlockModalStateDto;
};
