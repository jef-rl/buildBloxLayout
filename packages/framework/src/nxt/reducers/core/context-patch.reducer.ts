import type { UIState } from '../../../types/state';
import type { Action } from '../../runtime/actions/action';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const contextPatchReducer = (
  state: UIState,
  action: Action<any>,
  _config?: Record<string, unknown>,
): UIState => {
  const payload = action.payload ?? {};
  const namespace = (payload.namespace as string | undefined) ?? null;
  const patch = (payload.changes ?? payload.patch ?? payload.value) as unknown;
  if (!namespace) {
    return state;
  }
  const currentValue = (state as Record<string, unknown>)[namespace];
  const nextValue =
    isRecord(currentValue) && isRecord(patch) ? { ...currentValue, ...patch } : patch;
  return {
    ...state,
    [namespace]: nextValue,
  } as UIState;
};
