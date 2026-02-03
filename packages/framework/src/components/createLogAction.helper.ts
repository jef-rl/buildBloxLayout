import { HandlerAction } from '../core/registry/HandlerAction.type';
import { LogLevel } from './LogLevel.type';

export const createLogAction = (
  level: LogLevel,
  message: string,
  data?: Record<string, unknown>
): HandlerAction => ({
  type: 'logs/append',
  payload: {
    level,
    message,
    data,
    source: 'framework',
  },
});
