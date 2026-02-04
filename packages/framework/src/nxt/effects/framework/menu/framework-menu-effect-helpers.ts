import type { Action } from '../../../runtime/actions/action';
import { ActionCatalog } from '../../../runtime/actions/action-catalog';

export type ActionDispatch = (action: Action<any>) => void;

export const dispatchLog = (
  dispatch: ActionDispatch,
  level: 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, unknown>,
): void => {
  dispatch({
    action: ActionCatalog.LogsAppend,
    payload: {
      level,
      message,
      data,
      source: 'effects/framework-menu',
    },
  });
};

export const dispatchActions = (dispatch: ActionDispatch, actions: Action<any>[]): void => {
  actions.forEach((action) => dispatch(action));
};
