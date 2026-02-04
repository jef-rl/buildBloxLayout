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

export const logsClearReducer = (
  state: UIState,
  _action: Action<any>,
  _config?: Record<string, unknown>,
): UIState => {
  const currentLogs = normalizeLogState(state);
  if (currentLogs.entries.length === 0) {
    return state;
  }
  return {
    ...state,
    logs: {
      ...currentLogs,
      entries: [],
    },
  };
};
