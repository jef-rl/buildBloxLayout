import type { VisualBlockUiStateDto } from '../dto/visual-block-ui-state.dto';
import type { VisualBlockDataState } from '../state/visual-block-data-state';
import {
  type VisualBlockRenderModel,
  visualBlockRenderModelSelectorImpl,
} from '../selectors/visual-block-render-model.selector';
import { visualBlockUiSelectorImpl } from '../selectors/visual-block-ui.selector';

export const visualBlockProjectionModelSelectorKey = 'selector:visual-block/projection-model';

export type VisualBlockProjectionBlock = {
  id: string;
  contentId: string;
  type?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z?: number;
};

export type VisualBlockProjectionModel = {
  rotationY: number;
  selectedIds: string[];
  blocks: VisualBlockProjectionBlock[];
  columns: number;
  rowHeight: number;
  padding: number;
  rowCount: number;
  maxWidth?: number | string;
};

type VisualBlockStateContainer = {
  visualBlockUi?: VisualBlockUiStateDto;
  visualBlockData?: VisualBlockDataState;
};

const buildBlocks = (model: VisualBlockRenderModel): VisualBlockProjectionBlock[] =>
  model.rects.map((rect) => {
    const content = model.contents[rect._contentID];
    return {
      id: rect._positionID,
      contentId: rect._contentID,
      type: content?.type,
      x: rect.x,
      y: rect.y,
      w: rect.w,
      h: rect.h,
      z: rect.z,
    };
  });

export const visualBlockProjectionModelSelectorImpl = <S extends VisualBlockStateContainer>(
  state: S,
): VisualBlockProjectionModel => {
  const renderModel = visualBlockRenderModelSelectorImpl(state);
  const uiState = visualBlockUiSelectorImpl(state);

  return {
    rotationY: uiState.rotationY ?? 0,
    selectedIds: uiState.selectedIds ?? [],
    blocks: buildBlocks(renderModel),
    columns: renderModel.columns,
    rowHeight: renderModel.rowHeight,
    padding: renderModel.padding,
    rowCount: renderModel.rowCount,
    maxWidth: renderModel.maxWidth,
  };
};
