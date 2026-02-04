import type { LogState, UIState } from '../../../types/state';
import type { Action } from '../../runtime/actions/action';

const DEFAULT_LOG_LIMIT = 200;

const normalizeLogState = (state: UIState): LogState => {
  const fallback: LogState = { entries: [], maxEntries: DEFAULT_LOG_LIMIT };
  const logs = state.logs ?? fallback;
  const maxEntries = Number.isFinite(logs.maxEntries)
    ? Math.max(1, Math.floor(logs.maxEntries))
    : DEFAULT_LOG_LIMIT;
  return {
    entries: Array.isArray(logs.entries) ? logs.entries : [],
    maxEntries,
  };
};

export const logsSetMaxReducer = (
  state: UIState,
  action: Action<any>,
  _config?: Record<string, unknown>,
): UIState => {
  const payload = (action.payload ?? {}) as Record<string, unknown>;
  const currentLogs = normalizeLogState(state);
  const nextMax = Number.isFinite(Number(payload.maxEntries))
    ? Math.max(1, Math.floor(Number(payload.maxEntries)))
    : currentLogs.maxEntries;
  const trimmedEntries =
    currentLogs.entries.length > nextMax
      ? currentLogs.entries.slice(currentLogs.entries.length - nextMax)
      : currentLogs.entries;
  return {
    ...state,
    logs: {
      entries: trimmedEntries,
      maxEntries: nextMax,
    },
  };
};
