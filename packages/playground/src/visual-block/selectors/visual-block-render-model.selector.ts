import type { VisualBlockContentDto } from '../dto/visual-block-content.dto';
import type { VisualBlockLayoutDto } from '../dto/visual-block-layout.dto';
import type { VisualBlockRectDto } from '../dto/visual-block-rect.dto';
import type { VisualBlockDataState } from '../state/visual-block-data-state';
import { visualBlockDataSelectorImpl } from './visual-block-data.selector';

export const visualBlockRenderModelSelectorKey = 'selector:visual-block/render-model';

const DEFAULT_COLUMNS = 36;
const DEFAULT_ROW_HEIGHT = 15;
const DEFAULT_PADDING = 50;

export type VisualBlockRenderModel = {
  layoutId: string | null;
  layout: VisualBlockLayoutDto | null;
  rects: VisualBlockRectDto[];
  contents: Record<string, VisualBlockContentDto>;
  columns: number;
  rowHeight: number;
  padding: number;
  rowCount: number;
  maxWidth?: number | string;
};

type VisualBlockDataContainer = {
  visualBlockData?: VisualBlockDataState;
};

const parseColumns = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return DEFAULT_COLUMNS;
};

const resolveLayoutId = (data: VisualBlockDataState): string | null => {
  if (data.activeLayoutId && data.layouts[data.activeLayoutId]) {
    return data.activeLayoutId;
  }
  const [firstKey] = Object.keys(data.layouts);
  return firstKey ?? null;
};

const resolveRowCount = (rects: VisualBlockRectDto[]): number => {
  const maxRowIndex = rects.reduce((max, rect) => {
    const rowEnd = rect.y + rect.h;
    return rowEnd > max ? rowEnd : max;
  }, 0);
  return maxRowIndex > 0 ? maxRowIndex : 1;
};

export const visualBlockRenderModelSelectorImpl = <S extends VisualBlockDataContainer>(
  state: S,
): VisualBlockRenderModel => {
  const data = visualBlockDataSelectorImpl(state);
  const layoutId = resolveLayoutId(data);
  const layout = layoutId ? data.layouts[layoutId] ?? null : null;
  const rects = layout?.positions ?? [];

  return {
    layoutId,
    layout,
    rects,
    contents: data.contents,
    columns: parseColumns(layout?.columns),
    rowHeight: DEFAULT_ROW_HEIGHT,
    padding: DEFAULT_PADDING,
    rowCount: resolveRowCount(rects),
    maxWidth: layout?.maxWidth,
  };
};
