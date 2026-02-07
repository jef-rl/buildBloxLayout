import type { Action } from '../../actions/action';
import { getFrameworkLogger } from '../../../utils/logger';

export type StateSummary = {
  type: string;
  keys?: string[];
  size?: number;
};

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogMessage = {
  message: string;
  context?: unknown;
};

const isDev = (() => {
  try {
    return Boolean(import.meta.env?.DEV);
  } catch {
    return false;
  }
})();

const emitLog = ({ message, context }: LogMessage, level: LogLevel): void => {
  try {
    const logger = getFrameworkLogger();
    const handler = logger?.[level];
    if (handler) {
      handler(message, context);
      return;
    }

    if (!isDev) {
      return;
    }

    const consoleHandler = console[level] ?? console.log;
    consoleHandler(`[BuildBlox] ${message}`, context ?? '');
  } catch {
    // Logging should never throw.
  }
};

export const summarizeState = (state: unknown): StateSummary => {
  if (Array.isArray(state)) {
    return { type: 'array', size: state.length };
  }

  if (state && typeof state === 'object') {
    return {
      type: 'object',
      keys: Object.keys(state as Record<string, unknown>),
    };
  }

  return { type: typeof state };
};

export const logInfo = (message: string, context?: unknown): void => {
  emitLog({ message, context }, 'info');
};

export const logWarn = (message: string, context?: unknown): void => {
  emitLog({ message, context }, 'warn');
};

export const logDebug = (message: string, context?: unknown): void => {
  emitLog({ message, context }, 'debug');
};

export const logError = (error: unknown, context?: unknown): void => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  emitLog({ message: `Framework error: ${message}`, context: { error, context } }, 'error');
};

export const logAction = (
  action: Action<any>,
  prevStateSummary: StateSummary,
  nextStateSummary?: StateSummary,
): void => {
  logDebug('Action dispatched.', {
    action,
    prevStateSummary,
    nextStateSummary,
  });
};
