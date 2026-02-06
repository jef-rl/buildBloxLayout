import type { VisualBlockUiStateDto } from '../dto/visual-block-ui-state.dto';

export const visualBlockUiSelectorKey = 'selector:visual-block/ui';

const defaultVisualBlockUi: VisualBlockUiStateDto = {
  zoom: 1,
  mode: 'design',
  selectedIds: [],
  blockId: '',
  rotationY: 25,
  modalState: {
    open: false,
    mode: 'architect',
    title: '',
    content: '',
  },
};

type VisualBlockUiContainer = {
  visualBlockUi?: VisualBlockUiStateDto;
};

export const visualBlockUiSelectorImpl = <S extends VisualBlockUiContainer>(
  state: S,
): VisualBlockUiStateDto => state.visualBlockUi ?? defaultVisualBlockUi;
