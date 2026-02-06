export type VisualBlockRectDto = {
  _positionID: string;
  _contentID: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z?: number;
};

export type VisualBlockLayoutDto = {
  columns?: number | string;
  maxWidth?: number | string;
  positions: VisualBlockRectDto[];
  styler?: Record<string, unknown>;
};

export type VisualBlockContentUiDto = {
  content?: string;
  [key: string]: unknown;
};

export type VisualBlockContentDto = {
  _contentID: string;
  type?: string;
  src?: string;
  ui?: VisualBlockContentUiDto;
  styler?: Record<string, unknown>;
  [key: string]: unknown;
};

export type VisualBlockDataDefinitionDTO = {
  layouts: Record<string, VisualBlockLayoutDto>;
  rects: Record<string, VisualBlockRectDto>;
  contents: Record<string, VisualBlockContentDto>;
  activeLayoutId: string | null;
};
