import type { LogEntry, LogLevel, LogState, UIState } from '../../types/state';
import type { Action } from '../../runtime/actions/action';

const LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error'];
const DEFAULT_LOG_LIMIT = 200;

const normalizeLogLevel = (level: unknown): LogLevel =>
  LOG_LEVELS.includes(level as LogLevel) ? (level as LogLevel) : 'info';

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

const buildLogEntry = (payload: Record<string, unknown>, state: UIState): LogEntry | null => {
  const entry = payload.entry as LogEntry | undefined;
  const fallbackTimestamp = state.logs?.entries?.length ?? 0;
  const baseTimestamp =
    typeof payload.timestamp === 'number'
      ? payload.timestamp
      : typeof entry?.timestamp === 'number'
        ? entry.timestamp
        : fallbackTimestamp;
  const baseId =
    typeof payload.id === 'string' && payload.id.trim() !== ''
      ? payload.id
      : typeof entry?.id === 'string' && entry.id.trim() !== ''
        ? entry.id
        : `${baseTimestamp}-${(state.logs?.entries?.length ?? 0) + 1}`;

  if (entry && typeof entry.message === 'string') {
    const timestamp = typeof entry.timestamp === 'number' ? entry.timestamp : baseTimestamp;
    const id = typeof entry.id === 'string' && entry.id.trim() !== '' ? entry.id : baseId;
    return {
      ...entry,
      id,
      timestamp,
      level: normalizeLogLevel(entry.level),
    };
  }

  if (typeof payload.message !== 'string' || payload.message.trim() === '') {
    return null;
  }

  return {
    id: baseId,
    level: normalizeLogLevel(payload.level),
    message: payload.message,
    timestamp: baseTimestamp,
    data: payload.data,
    source: typeof payload.source === 'string' ? payload.source : undefined,
  };
};

export const logsAppendReducer = (
  state: UIState,
  action: Action<any>,
  _config?: Record<string, unknown>,
): UIState => {
  const payload = (action.payload ?? {}) as Record<string, unknown>;
  const currentLogs = normalizeLogState(state);
  const entry = buildLogEntry(payload, state);
  if (!entry) {
    return state;
  }
  const nextEntries = [...currentLogs.entries, entry];
  const trimmedEntries =
    nextEntries.length > currentLogs.maxEntries
      ? nextEntries.slice(nextEntries.length - currentLogs.maxEntries)
      : nextEntries;
  return {
    ...state,
    logs: {
      entries: trimmedEntries,
      maxEntries: currentLogs.maxEntries,
    },
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
