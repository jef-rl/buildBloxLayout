import type { VisualBlockContentDto } from '../dto/visual-block-content.dto';
import type { VisualBlockLayoutDto } from '../dto/visual-block-layout.dto';
import type { VisualBlockRectDto } from '../dto/visual-block-rect.dto';

export type VisualBlockDataState = {
  layouts: Record<string, VisualBlockLayoutDto>;
  rects: Record<string, VisualBlockRectDto>;
  contents: Record<string, VisualBlockContentDto>;
  activeLayoutId: string | null;
};
