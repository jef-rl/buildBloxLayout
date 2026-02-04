import { logInfo } from '../../nxt/runtime/engine/logging/framework-logger';
import type { LogEntry, LogLevel, LogState, UIState } from '../../types/state';
import type { Action } from '../../nxt/runtime/actions/action';
import type { ActionName } from '../../nxt/runtime/actions/action-catalog';
import { HandlerImplRegistry } from '../../nxt/runtime/registries/handlers/handler-impl-registry';
import { HandlerRegistry as NxtHandlerRegistry } from '../../nxt/runtime/registries/handlers/handler-registry';
import { ReducerHandler } from '../../core/registry/ReducerHandler.type';
import { HandlerRegistry } from '../../core/registry/HandlerRegistry.type';
import { HandlerAction } from '../../core/registry/HandlerAction.type';

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

const logHandledAction = (actionType: string, namespace: string | null, changes: unknown) => {
  logInfo('Handled action.', {
    actionType,
    namespace,
    changes: summarizeChanges(changes),
  });
};

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
      logHandledAction(action.type, 'state', patch);
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
    logHandledAction(action.type, 'state', patch);
    return { state: nextState, followUps: toFollowUps(payload.followUps) };
  },
  'logs/append': (state, action) => {
    const payload = (action.payload ?? {}) as Record<string, unknown>;
    const currentLogs = normalizeLogState(state);
    const entry = buildLogEntry(payload, state);
    if (!entry) {
      logHandledAction(action.type, 'logs', { reason: 'invalid-payload' });
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
    logHandledAction(action.type, 'logs', { count: trimmedEntries.length });
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
    logHandledAction(action.type, 'logs', { cleared: currentLogs.entries.length });
    return { state: nextState, followUps: toFollowUps(payload.followUps) };
  },
};

export const createHandlerRegistry = <TState>(
  initialHandlers: Record<string, ReducerHandler<TState>> = {},
): HandlerRegistry<TState> => {
  const handlers = new Map<string, ReducerHandler<TState>>();
  const followUpsByAction = new Map<string, HandlerAction[]>();
  const impls = new HandlerImplRegistry<TState>();
  const registry = new NxtHandlerRegistry<TState>(impls);

  const toNxtAction = (action: HandlerAction): Action<any> => ({
    action: action.type as ActionName,
    payload: action.payload,
  });

  const registerHandler = (type: string, handler: ReducerHandler<TState>) => {
    handlers.set(type, handler);
    const implKey = `legacy:${type}`;
    impls.register(implKey, (state, action) => {
      const result = handler(state, { type: action.action, payload: action.payload });
      followUpsByAction.set(type, result.followUps);
      return result.state;
    });
    registry.applyDefinition({
      id: `handler:${type}`,
      action: type,
      implKey,
    });
  };

  Object.entries(initialHandlers).forEach(([type, handler]) => {
    registerHandler(type, handler);
  });

  return {
    register: (type, handler) => {
      registerHandler(type, handler);
    },
    get: (type) => handlers.get(type),
    handle: (state, action) => {
      const entries = registry.getForAction(action.type);
      if (!entries.length) {
        return { state, followUps: [] };
      }
      const entry = entries[entries.length - 1];
      const nextState = entry.reduce(state, toNxtAction(action), entry.config);
      const followUps = followUpsByAction.get(action.type) ?? [];
      return { state: nextState, followUps };
    },
    list: () => Array.from(handlers.keys()),
  };
};
