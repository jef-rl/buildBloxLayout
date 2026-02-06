import type { Action } from '../../../../framework/src/nxt/runtime/actions/action';
import type { VisualBlockDataState } from '../state/visual-block-data-state';

type VisualBlockDataContainer = {
  visualBlockData?: VisualBlockDataState;
};

type VisualBlockDataConfig = {
  mode: 'replace' | 'patch';
};

const defaultVisualBlockData: VisualBlockDataState = {
  layouts: {},
  rects: {},
  contents: {},
  activeLayoutId: null,
};

const resolvePayloadState = (payload: Record<string, unknown>): Partial<VisualBlockDataState> | null => {
  const value = (payload.data ?? payload.patch ?? payload.value) as
    | Partial<VisualBlockDataState>
    | undefined;
  if (!value || typeof value !== 'object') {
    return null;
  }
  return value;
};

export const visualBlockDataReducer = <S extends VisualBlockDataContainer>(
  state: S,
  action: Action<any>,
  config?: VisualBlockDataConfig,
): S => {
  const payload = (action.payload ?? {}) as Record<string, unknown>;
  const nextValue = resolvePayloadState(payload);
  if (!nextValue) {
    return state;
  }

  const mode = config?.mode ?? 'patch';
  const baseState = state.visualBlockData ?? defaultVisualBlockData;

  const resolvedState =
    mode === 'replace'
      ? {
          ...defaultVisualBlockData,
          ...nextValue,
        }
      : {
          ...baseState,
          ...nextValue,
          layouts: nextValue.layouts
            ? { ...baseState.layouts, ...nextValue.layouts }
            : baseState.layouts,
          rects: nextValue.rects
            ? { ...baseState.rects, ...nextValue.rects }
            : baseState.rects,
          contents: nextValue.contents
            ? { ...baseState.contents, ...nextValue.contents }
            : baseState.contents,
        };

  return {
    ...state,
    visualBlockData: resolvedState,
  };
};
