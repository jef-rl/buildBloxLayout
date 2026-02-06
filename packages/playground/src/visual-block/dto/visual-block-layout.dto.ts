import type { VisualBlockRectDto } from './visual-block-rect.dto';

export type VisualBlockLayoutDto = {
  columns?: number | string;
  maxWidth?: number | string;
  positions: VisualBlockRectDto[];
  styler?: Record<string, unknown>;
};
