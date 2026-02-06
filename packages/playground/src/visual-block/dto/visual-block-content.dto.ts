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
