import type { VisualBlockUiStateDto } from '../dto/visual-block-ui-state.dto';
import type { VisualBlockDataState } from '../state/visual-block-data-state';
import {
  type VisualBlockRenderModel,
  visualBlockRenderModelSelectorImpl,
} from '../selectors/visual-block-render-model.selector';
import { visualBlockUiSelectorImpl } from '../selectors/visual-block-ui.selector';

export const visualBlockInspectorModelSelectorKey = 'selector:visual-block/inspector-model';

export type VisualBlockInspectorItem = {
  id: string;
  contentId: string;
  type?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z?: number;
  rotationY: number;
};

export type VisualBlockInspectorModel = {
  selectedIds: string[];
  items: VisualBlockInspectorItem[];
  activeId: string | null;
};

type VisualBlockStateContainer = {
  visualBlockUi?: VisualBlockUiStateDto;
  visualBlockData?: VisualBlockDataState;
};

const buildItem = (
  rectId: string,
  model: VisualBlockRenderModel,
  rotationY: number,
): VisualBlockInspectorItem | null => {
  const rect = model.rects.find((entry) => entry._positionID === rectId);
  if (!rect) {
    return null;
  }
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
    rotationY,
  };
};

export const visualBlockInspectorModelSelectorImpl = <S extends VisualBlockStateContainer>(
  state: S,
): VisualBlockInspectorModel => {
  const renderModel = visualBlockRenderModelSelectorImpl(state);
  const uiState = visualBlockUiSelectorImpl(state);
  const selectedIds = uiState.selectedIds ?? [];
  const rotationY = uiState.rotationY ?? 0;

  const items = selectedIds
    .map((id) => buildItem(id, renderModel, rotationY))
    .filter((item): item is VisualBlockInspectorItem => Boolean(item));

  return {
    selectedIds,
    items,
    activeId: uiState.blockId || selectedIds[0] || null,
  };
};
