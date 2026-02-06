import type { Action } from '../../../../framework/src/nxt/runtime/actions/action';
import type { VisualBlockUiStateDto } from '../dto/visual-block-ui-state.dto';

type VisualBlockUiContainer = {
  visualBlockUi?: VisualBlockUiStateDto;
};

type VisualBlockUiConfig = {
  mode: 'replace' | 'patch';
};

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

const resolvePayloadState = (payload: Record<string, unknown>): Partial<VisualBlockUiStateDto> | null => {
  const value = (payload.ui ?? payload.patch ?? payload.value) as
    | Partial<VisualBlockUiStateDto>
    | undefined;
  if (!value || typeof value !== 'object') {
    return null;
  }
  return value;
};

export const visualBlockUiReducer = <S extends VisualBlockUiContainer>(
  state: S,
  action: Action<any>,
  config?: VisualBlockUiConfig,
): S => {
  const payload = (action.payload ?? {}) as Record<string, unknown>;
  const nextValue = resolvePayloadState(payload);
  if (!nextValue) {
    return state;
  }

  const mode = config?.mode ?? 'patch';
  const baseState = state.visualBlockUi ?? defaultVisualBlockUi;

  const resolvedState =
    mode === 'replace'
      ? {
          ...defaultVisualBlockUi,
          ...nextValue,
        }
      : {
          ...baseState,
          ...nextValue,
          modalState: nextValue.modalState
            ? {
                ...baseState.modalState,
                ...nextValue.modalState,
              }
            : baseState.modalState,
        };

  return {
    ...state,
    visualBlockUi: resolvedState,
  };
};
