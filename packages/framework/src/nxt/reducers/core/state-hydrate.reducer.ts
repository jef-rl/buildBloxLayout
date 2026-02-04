import type { UIState } from '../../../types/state';
import type { Action } from '../../runtime/actions/action';

export const stateHydrateReducer = (
  state: UIState,
  action: Action<any>,
  _config?: Record<string, unknown>,
): UIState => {
  const payload = action.payload ?? {};
  const patch = (payload.state ?? payload.patch ?? payload.value) as Partial<UIState> | undefined;
  if (!patch || typeof patch !== 'object') {
    return state;
  }
  return {
    ...state,
    ...patch,
    layout: patch.layout
      ? {
          ...state.layout,
          ...patch.layout,
          presets: state.layout?.presets ?? patch.layout?.presets ?? {},
        }
      : state.layout,
  };
};
