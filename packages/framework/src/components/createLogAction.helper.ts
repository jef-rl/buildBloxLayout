import { HandlerAction } from '../core/registry/HandlerAction.type';
import { LogLevel } from './LogLevel.type';
import { ActionCatalog } from '../nxt/runtime/actions/action-catalog';

export const createLogAction = (
  level: LogLevel,
  message: string,
  data?: Record<string, unknown>
): HandlerAction => ({
  type: ActionCatalog.LogsAppend,
  payload: {
    level,
    message,
    data,
    source: 'framework',
  },
});
