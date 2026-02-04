import type { UIState } from '../../../types/state';
import type { Action } from '../../runtime/actions/action';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const layoutUpdateReducer = (
  state: UIState,
  action: Action<any>,
  _config?: Record<string, unknown>,
): UIState => {
  const payload = action.payload ?? {};
  const changes = (payload.changes ?? payload.layout ?? payload.value) as unknown;
  if (!isRecord(changes)) {
    return state;
  }
  return {
    ...state,
    layout: {
      ...state.layout,
      ...changes,
    },
  };
};
