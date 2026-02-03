import type { UIState } from '../types';

type StateChangeBase = {
  path: string;
};

type AddedChange = StateChangeBase & {
  type: 'added';
  nextValue: unknown;
};

type RemovedChange = StateChangeBase & {
  type: 'removed';
  previousValue: unknown;
};

type UpdatedChange = StateChangeBase & {
  type: 'updated';
  previousValue: unknown;
  nextValue: unknown;
};

type StateChange = AddedChange | RemovedChange | UpdatedChange;

export const summarizeUpdate = (previousState: UIState, nextState: UIState) => {
  const added: AddedChange[] = [];
  const removed: RemovedChange[] = [];
  const updated: UpdatedChange[] = [];

  const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

  const diffArray = (prev: unknown[], next: unknown[], basePath: string) => {
    const maxLen = Math.max(prev.length, next.length);

    for (let i = 0; i < maxLen; i++) {
      const prevVal = prev[i];
      const nextVal = next[i];
      const path = basePath ? `${basePath}[${i}]` : `[${i}]`;

      if (i >= prev.length) {
        // added item
        added.push({
          type: 'added',
          path,
          nextValue: nextVal,
        });
      } else if (i >= next.length) {
        // removed item
        removed.push({
          type: 'removed',
          path,
          previousValue: prevVal,
        });
      } else {
        diffValue(prevVal, nextVal, path);
      }
    }
  };

  const diffObject = (
    prev: Record<string, unknown>,
    next: Record<string, unknown>,
    basePath: string
  ) => {
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);
    const keySet = new Set([...prevKeys, ...nextKeys]);

    for (const key of keySet) {
      const prevHas = Object.prototype.hasOwnProperty.call(prev, key);
      const nextHas = Object.prototype.hasOwnProperty.call(next, key);
      const path = basePath ? `${basePath}.${key}` : key;

      if (!prevHas && nextHas) {
        added.push({
          type: 'added',
          path,
          nextValue: next[key],
        });
      } else if (prevHas && !nextHas) {
        removed.push({
          type: 'removed',
          path,
          previousValue: prev[key],
        });
      } else if (prevHas && nextHas) {
        diffValue(prev[key], next[key], path);
      }
    }
  };

  const diffValue = (prev: unknown, next: unknown, path: string) => {
    if (prev === next) return;

    const prevIsArray = Array.isArray(prev);
    const nextIsArray = Array.isArray(next);

    if (prevIsArray && nextIsArray) {
      diffArray(prev as unknown[], next as unknown[], path);
      return;
    }

    if (isObject(prev) && isObject(next)) {
      diffObject(prev, next, path);
      return;
    }

    // type changed or primitive changed
    updated.push({
      type: 'updated',
      path,
      previousValue: prev,
      nextValue: next,
    });
  };

  // start from root as an object comparison
  if (isObject(previousState) && isObject(nextState)) {
    diffObject(previousState as Record<string, unknown>, nextState as Record<string, unknown>, '');
  } else {
    // degenerate case: state is not object-shaped
    if (previousState !== nextState) {
      updated.push({
        type: 'updated',
        path: '',
        previousValue: previousState,
        nextValue: nextState,
      });
    }
  }

  const previousKeys = Object.keys(previousState as Record<string, unknown>);
  const nextKeys = Object.keys(nextState as Record<string, unknown>);

  return {
    previousKeys,
    nextKeys,
    added,
    removed,
    updated,
    hasChanges: added.length > 0 || removed.length > 0 || updated.length > 0,
    allChanges: ([] as StateChange[]).concat(added, removed, updated),
  };
};
