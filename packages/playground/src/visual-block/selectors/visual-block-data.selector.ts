import type { VisualBlockDataState } from '../state/visual-block-data-state';

export const visualBlockDataSelectorKey = 'selector:visual-block/data';

const defaultVisualBlockData: VisualBlockDataState = {
  layouts: {},
  rects: {},
  contents: {},
  activeLayoutId: null,
};

type VisualBlockDataContainer = {
  visualBlockData?: VisualBlockDataState;
};

export const visualBlockDataSelectorImpl = <S extends VisualBlockDataContainer>(
  state: S,
): VisualBlockDataState => state.visualBlockData ?? defaultVisualBlockData;
