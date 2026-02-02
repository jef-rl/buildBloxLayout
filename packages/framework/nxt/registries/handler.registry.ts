import { applyContextUpdate } from "../context/context-update.state";
import { getFrameworkLogger } from "../helpers/logger.utils";
import { LogLevel, UIState, LogState, LogEntry } from "../types/state.types";


export type HandlerAction<TPayload = Record<string, unknown>> = {
  type: string;
  payload?: TPayload;
};

export type HandlerResult<TState> = {
  state: TState;
  followUps: HandlerAction[];
};

export type ReducerHandler<TState> = (
  state: TState,
  action: HandlerAction,
) => HandlerResult<TState>;

export type HandlerRegistry<TState> = {
  register: (type: string, handler: ReducerHandler<TState>) => void;
  get: (type: string) => ReducerHandler<TState> | undefined;
  handle: (state: TState, action: HandlerAction) => HandlerResult<TState>;
  list: () => string[];
};

const summarizeChanges = (changes: unknown) => {
  if (Array.isArray(changes)) {
    const panelIds = changes
      .map((item) => {
        if (item && typeof item === 'object') {
          const record = item as Record<string, unknown>;
          return (record.panelId ?? record.id) as string | undefined;
        }
        return undefined;
      })
      .filter((value): value is string => Boolean(value));
    return panelIds.length > 0
      ? { count: changes.length, panelIds }
      : { count: changes.length };
  }

  if (changes && typeof changes === 'object') {
    return { keys: Object.keys(changes as Record<string, unknown>) };
  }

  return { valueType: typeof changes };
};

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
  const baseTimestamp =
    typeof payload.timestamp === 'number' ? payload.timestamp : Date.now();
  const baseId = typeof payload.id === 'string' && payload.id.trim() !== ''
    ? payload.id
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

const logAction = (actionType: string, namespace: string | null, changes: unknown) => {
  const logger = getFrameworkLogger();
  logger?.info?.('Handled action.', {
    actionType,
    namespace,
    changes: summarizeChanges(changes),
  });
};

const normalizeNamespace = (path?: string | string[]) => {
  if (Array.isArray(path)) {
    return typeof path[0] === 'string' ? path[0] : null;
  }
  if (typeof path === 'string') {
    const [namespace] = path.split('.');
    return namespace ?? null;
  }
  return null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const toFollowUps = (actions: unknown): HandlerAction[] => {
  if (!Array.isArray(actions)) {
    return [];
  }
  return actions.filter((action): action is HandlerAction => Boolean(action?.type));
};

export const coreHandlers: Record<string, ReducerHandler<UIState>> = {
  'state/hydrate': (state, action) => {
    const payload = action.payload ?? {};
    const patch = (payload.state ?? payload.patch ?? payload.value) as Partial<UIState> | undefined;
    if (!patch || typeof patch !== 'object') {
      logAction(action.type, 'state', patch);
      return { state, followUps: toFollowUps(payload.followUps) };
    }
    // Deep merge layout to preserve presets
    const nextState = {
      ...state,
      ...patch,
      layout: patch.layout ? {
        ...state.layout,
        ...patch.layout,
        presets: state.layout?.presets ?? patch.layout?.presets ?? {},
      } : state.layout,
    };
    logAction(action.type, 'state', patch);
    return { state: nextState, followUps: toFollowUps(payload.followUps) };
  },
  'context/update': (state, action) => {
    const payload = action.payload ?? {};
    const path = payload.path as string | string[] | undefined;
    const value = payload.value;
    const nextState = applyContextUpdate(state, { path: path ?? '', value });
    logAction(action.type, normalizeNamespace(path), { path, value });
    return { state: nextState, followUps: toFollowUps(payload.followUps) };
  },
  'context/patch': (state, action) => {
    const payload = action.payload ?? {};
    const namespace = (payload.namespace as string | undefined) ?? null;
    const patch = (payload.changes ?? payload.patch ?? payload.value) as unknown;
    if (!namespace) {
      logAction(action.type, null, patch);
      return { state, followUps: toFollowUps(payload.followUps) };
    }
    const currentValue = (state as Record<string, unknown>)[namespace];
    const nextValue =
      isRecord(currentValue) && isRecord(patch) ? { ...currentValue, ...patch } : patch;
    const nextState = {
      ...state,
      [namespace]: nextValue,
    };
    logAction(action.type, namespace, patch);
    return { state: nextState, followUps: toFollowUps(payload.followUps) };
  },
  'layout/update': (state, action) => {
    const payload = action.payload ?? {};
    const changes = (payload.changes ?? payload.layout ?? payload.value) as unknown;
    if (!isRecord(changes)) {
      logAction(action.type, 'layout', changes);
      return { state, followUps: toFollowUps(payload.followUps) };
    }
    const nextState = {
      ...state,
      layout: {
        ...state.layout,
        ...changes,
      },
    };
    logAction(action.type, 'layout', changes);
    return { state: nextState, followUps: toFollowUps(payload.followUps) };
  },
  'panels/update': (state, action) => {
    const payload = action.payload ?? {};
    const panels = payload.panels as UIState['panels'] | undefined;
    const panelId = payload.panelId as string | undefined;
    const changes = (payload.changes ?? payload.panel ?? payload.value) as unknown;
    let nextPanels = state.panels;

    if (Array.isArray(panels)) {
      nextPanels = panels;
    } else if (panelId && isRecord(changes)) {
      nextPanels = state.panels.map((panel) =>
        panel.id === panelId ? { ...panel, ...changes } : panel,
      );
    }

    const nextState = nextPanels === state.panels ? state : { ...state, panels: nextPanels };
    logAction(action.type, 'panels', panels ?? { panelId, changes });
    return { state: nextState, followUps: toFollowUps(payload.followUps) };
  },
  'logs/append': (state, action) => {
    const payload = (action.payload ?? {}) as Record<string, unknown>;
    const currentLogs = normalizeLogState(state);
    const entry = buildLogEntry(payload, state);
    if (!entry) {
      logAction(action.type, 'logs', { reason: 'invalid-payload' });
      return { state, followUps: toFollowUps(payload.followUps) };
    }
    const nextEntries = [...currentLogs.entries, entry];
    const trimmedEntries =
      nextEntries.length > currentLogs.maxEntries
        ? nextEntries.slice(nextEntries.length - currentLogs.maxEntries)
        : nextEntries;
    const nextState = {
      ...state,
      logs: {
        entries: trimmedEntries,
        maxEntries: currentLogs.maxEntries,
      },
    };
    logAction(action.type, 'logs', { count: trimmedEntries.length });
    return { state: nextState, followUps: toFollowUps(payload.followUps) };
  },
  'logs/clear': (state, action) => {
    const payload = (action.payload ?? {}) as Record<string, unknown>;
    const currentLogs = normalizeLogState(state);
    if (currentLogs.entries.length === 0) {
      return { state, followUps: toFollowUps(payload.followUps) };
    }
    const nextState = {
      ...state,
      logs: {
        ...currentLogs,
        entries: [],
      },
    };
    logAction(action.type, 'logs', { cleared: currentLogs.entries.length });
    return { state: nextState, followUps: toFollowUps(payload.followUps) };
  },
  'logs/setMax': (state, action) => {
    const payload = (action.payload ?? {}) as Record<string, unknown>;
    const currentLogs = normalizeLogState(state);
    const nextMax = Number.isFinite(Number(payload.maxEntries))
      ? Math.max(1, Math.floor(Number(payload.maxEntries)))
      : currentLogs.maxEntries;
    const trimmedEntries =
      currentLogs.entries.length > nextMax
        ? currentLogs.entries.slice(currentLogs.entries.length - nextMax)
        : currentLogs.entries;
    const nextState = {
      ...state,
      logs: {
        entries: trimmedEntries,
        maxEntries: nextMax,
      },
    };
    logAction(action.type, 'logs', { maxEntries: nextMax });
    return { state: nextState, followUps: toFollowUps(payload.followUps) };
  },
};

export const createHandlerRegistry = <TState>(
  initialHandlers: Record<string, ReducerHandler<TState>> = {},
): HandlerRegistry<TState> => {
  const handlers = new Map<string, ReducerHandler<TState>>(Object.entries(initialHandlers));

  return {
    register: (type, handler) => {
      handlers.set(type, handler);
    },
    get: (type) => handlers.get(type),
    handle: (state, action) => {
      const handler = handlers.get(action.type);
      if (!handler) {
        return { state, followUps: [] };
      }
      return handler(state, action);
    },
    list: () => Array.from(handlers.keys()),
  };
};
