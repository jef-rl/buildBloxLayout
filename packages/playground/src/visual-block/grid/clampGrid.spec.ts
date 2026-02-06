import { clampGrid } from './clampGrid';

const assert = {
  equal: (actual: unknown, expected: unknown, message: string) => {
    if (actual !== expected) {
      throw new Error(`${message} (expected ${String(expected)}, received ${String(actual)})`);
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
  run: () => void;
};

const tests: TestCase[] = [];

const test = (name: string, run: TestCase['run']) => {
  tests.push({ name, run });
};

const runAllTests = () => {
  const failures: string[] = [];
  for (const entry of tests) {
    try {
      entry.run();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`${entry.name}: ${message}`);
    }
  }
  if (failures.length > 0) {
    throw new Error(`ClampGrid tests failed:\n${failures.join('\n')}`);
  }
};

test('clamps width and x position to columns', () => {
  const result = clampGrid({ x: 10, y: 0, w: 12, h: 2 }, 8);
  assert.deepEqual(result, { x: 0, y: 0, w: 8, h: 2 }, 'clamps to max columns');
});

test('clamps negative coordinates and sizes', () => {
  const result = clampGrid({ x: -2, y: -4, w: 0, h: 0 }, 12);
  assert.deepEqual(result, { x: 0, y: 0, w: 1, h: 1 }, 'clamps to minimums');
});

test('keeps rect within bounds when width shrinks', () => {
  const result = clampGrid({ x: 7, y: 3, w: 3, h: 2 }, 8);
  assert.equal(result.x, 5, 'x clamped to columns minus width');
});

runAllTests();
