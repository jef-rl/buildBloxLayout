import { getFrameworkLogger } from '../utils/logger';

const NAMESPACE_ALLOWLIST = new Set([
  'framework',
  'app',
  'system',
  'admin',
  'feature',
  'data',
  'ui',
  'user',
]);

type ContextUpdate = {
  path: string | string[];
  value: unknown;
};

const normalizePath = (path: string | string[]) => {
  if (Array.isArray(path)) {
    return path.filter((segment) => typeof segment === 'string' && segment.trim().length > 0);
  }
  return path.split('.').map((segment) => segment.trim()).filter(Boolean);
};

const cloneContainer = (value: unknown) => {
  if (Array.isArray(value)) {
    return [...value];
  }
  if (value && typeof value === 'object') {
    return { ...(value as Record<string, unknown>) };
  }
  return {};
};

export const applyContextUpdate = <T extends Record<string, unknown>>(
  state: T,
  { path, value }: ContextUpdate,
): T => {
  const segments = normalizePath(path);
  const [namespace] = segments;

  if (!namespace || !NAMESPACE_ALLOWLIST.has(namespace)) {
    const logger = getFrameworkLogger();
    logger?.warn?.('Rejected context update due to invalid namespace.', {
      path,
      value,
      allowedNamespaces: Array.from(NAMESPACE_ALLOWLIST),
    });
    return state;
  }

  if (segments.length === 0) {
    return state;
  }

  const nextState = cloneContainer(state) as T;
  let target = nextState as Record<string, unknown>;
  let source = state as Record<string, unknown>;

  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      target[segment] = value;
      return;
    }

    const sourceValue = source?.[segment];
    const nextValue = cloneContainer(sourceValue);
    target[segment] = nextValue;
    target = nextValue as Record<string, unknown>;
    source = (sourceValue ?? {}) as Record<string, unknown>;
  });

  return nextState;
};
