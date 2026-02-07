import {
  createVisualBlockDataEffectDepsForPlayground,
  createVisualBlockDataRequestedEffect,
  type VisualBlockDataDispatchAction,
  visualBlockDataLoaded,
  visualBlockDataLoadFailed,
  visualBlockDataRequested,
} from './index';

const assert = {
  ok: (value: unknown, message: string) => {
    if (!value) {
      throw new Error(message);
    }
  },
  equal: (actual: unknown, expected: unknown, message: string) => {
    if (actual !== expected) {
      throw new Error(`${message} (expected ${String(expected)}, received ${String(actual)})`);
    }
  },
  includes: (value: string, expected: string, message: string) => {
    if (!value.includes(expected)) {
      throw new Error(`${message} (expected to include \"${expected}\")`);
    }
  },
  deepEqual: (actual: unknown, expected: unknown, message: string) => {
    const actualJson = JSON.stringify(actual);
    const expectedJson = JSON.stringify(expected);
    if (actualJson !== expectedJson) {
      throw new Error(`${message} (expected ${expectedJson}, received ${actualJson})`);
    }
  },
};

type TestCase = {
  name: string;
  run: () => Promise<void> | void;
};

const tests: TestCase[] = [];

const test = (name: string, run: TestCase['run']) => {
  tests.push({ name, run });
};

const runAllTests = async () => {
  const failures: string[] = [];
  for (const entry of tests) {
    try {
      await entry.run();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`${entry.name}: ${message}`);
    }
  }
  if (failures.length > 0) {
    throw new Error(`Visual block data effect tests failed:\n${failures.join('\n')}`);
  }
};

const assertLoadFailedPayload = (
  value: VisualBlockDataDispatchAction,
): { error: string } => {
  assert.equal(
    value.action,
    'VisualBlockDataLoadFailed',
    'dispatches failed action',
  );
  const payload = value.payload;
  if (!payload || typeof payload !== 'object' || !('error' in payload)) {
    throw new Error('Expected failed action payload with error.');
  }
  const error = (payload as { error?: unknown }).error;
  if (typeof error !== 'string') {
    throw new Error('Expected failed action payload error to be a string.');
  }
  return { error };
};

test('successful fetch and mapping dispatches loaded action', async () => {
  const raw = {
    layout_lg: {
      columns: 12,
      positions: [
        {
          _positionID: 'pos-1',
          _contentID: 'content-1',
          x: 0,
          y: 0,
          w: 4,
          h: 2,
        },
      ],
    },
    'content-1': {
      _contentID: 'content-1',
      type: 'text',
      ui: { content: 'Hello' },
    },
  };
  const definition = {
    layouts: {
      layout_lg: raw.layout_lg,
    },
    rects: {
      'pos-1': raw.layout_lg.positions[0],
    },
    contents: {
      'content-1': raw['content-1'],
    },
    activeLayoutId: 'layout_lg',
  };

  const dispatchCalls: VisualBlockDataDispatchAction[] = [];
  const deps = {
    fetchJson: async (url: string) => {
      assert.equal(url, 'https://example.com/blocks', 'fetchJson receives expected url');
      return raw;
    },
    dispatch: (action: VisualBlockDataDispatchAction) => {
      dispatchCalls.push(action);
    },
    buildUrlForSource: (sourceId: string) => {
      assert.equal(sourceId, 'source-a', 'buildUrlForSource receives sourceId');
      return 'https://example.com/blocks';
    },
    mapRawToDefinition: (value: unknown) => {
      assert.deepEqual(value, raw, 'mapRawToDefinition receives raw payload');
      return definition;
    },
  };

  const effect = createVisualBlockDataRequestedEffect(deps);
  await effect(visualBlockDataRequested('source-a'));

  assert.equal(dispatchCalls.length, 1, 'dispatch called once');
  assert.deepEqual(
    dispatchCalls[0],
    visualBlockDataLoaded('source-a', definition),
    'dispatches loaded action',
  );
});

test('fetch failure dispatches failed action and logs error', async () => {
  const dispatchCalls: VisualBlockDataDispatchAction[] = [];
  const logCalls: Array<{ message: string; error: unknown }> = [];
  const deps = {
    fetchJson: async () => {
      throw new Error('Network failure');
    },
    dispatch: (action: VisualBlockDataDispatchAction) => {
      dispatchCalls.push(action);
    },
    buildUrlForSource: () => 'https://example.com/blocks',
    mapRawToDefinition: () => {
      throw new Error('Should not map');
    },
    logError: (message: string, error?: unknown) => {
      logCalls.push({ message, error });
    },
  };

  const effect = createVisualBlockDataRequestedEffect(deps);
  await effect(visualBlockDataRequested('source-b'));

  assert.equal(dispatchCalls.length, 1, 'dispatch called once');
  assert.deepEqual(
    dispatchCalls[0],
    visualBlockDataLoadFailed('source-b', 'Network failure'),
    'dispatches failed action',
  );
  assert.equal(logCalls.length, 1, 'logError called once');
  assert.includes(logCalls[0].message, 'source \"source-b\"', 'logError message references source');
});

test('mapping failure dispatches failed action and logs error', async () => {
  const dispatchCalls: VisualBlockDataDispatchAction[] = [];
  const logCalls: Array<{ message: string; error: unknown }> = [];
  const deps = {
    fetchJson: async () => ({ layout_lg: { positions: [] } }),
    dispatch: (action: VisualBlockDataDispatchAction) => {
      dispatchCalls.push(action);
    },
    buildUrlForSource: () => 'https://example.com/blocks',
    mapRawToDefinition: () => {
      throw new Error('Mapping failed');
    },
    logError: (message: string, error?: unknown) => {
      logCalls.push({ message, error });
    },
  };

  const effect = createVisualBlockDataRequestedEffect(deps);
  await effect(visualBlockDataRequested('source-c'));

  assert.equal(dispatchCalls.length, 1, 'dispatch called once');
  assert.deepEqual(
    dispatchCalls[0],
    visualBlockDataLoadFailed('source-c', 'Mapping failed'),
    'dispatches failed action',
  );
  assert.equal(logCalls.length, 1, 'logError called once');
  assert.includes(logCalls[0].message, 'source \"source-c\"', 'logError message references source');
});

test('unknown sourceId dispatches failed action from playground deps', async () => {
  const dispatchCalls: VisualBlockDataDispatchAction[] = [];
  const logCalls: Array<{ message: string; error: unknown }> = [];
  const deps = createVisualBlockDataEffectDepsForPlayground([], {
    dispatch: (action: VisualBlockDataDispatchAction) => {
      dispatchCalls.push(action);
    },
    fetchImpl: async () => {
      throw new Error('Fetch should not be called');
    },
    logError: (message: string, error?: unknown) => {
      logCalls.push({ message, error });
    },
  });

  const effect = createVisualBlockDataRequestedEffect(deps);
  await effect(visualBlockDataRequested('missing-source'));

  assert.equal(dispatchCalls.length, 1, 'dispatch called once');
  const { error } = assertLoadFailedPayload(dispatchCalls[0]);
  assert.includes(
    error,
    'Unknown visual block data source',
    'error mentions unknown source',
  );
  assert.equal(logCalls.length, 1, 'logError called once');
});

const runtime = globalThis as {
  process?: {
    env?: Record<string, string | undefined>;
  };
};

if (runtime.process?.env?.RUN_VISUAL_BLOCK_DATA_EFFECTS_TESTS === 'true') {
  void runAllTests();
}
