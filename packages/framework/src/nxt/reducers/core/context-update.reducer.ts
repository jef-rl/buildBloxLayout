import type { UIState } from '../../../types/state';
import { applyContextUpdate } from '../../../state/context-update';
import type { Action } from '../../runtime/actions/action';

export const contextUpdateReducer = (
  state: UIState,
  action: Action<any>,
  _config?: Record<string, unknown>,
): UIState => {
  const payload = action.payload ?? {};
  const path = payload.path as string | string[] | undefined;
  const value = payload.value;
  return applyContextUpdate(state, { path: path ?? '', value });
};
