import type { VisualBlockRectDto } from '../dto/visual-block-rect.dto';
import {
  applyRectPatch,
  updateRectsOnDrag,
  updateRectsOnResize,
  updateSelectionOnClick,
} from './grid-editing-reducer';

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
    throw new Error(`Grid editing reducer tests failed:\n${failures.join('\n')}`);
  }
};

const sampleRects: VisualBlockRectDto[] = [
  { _positionID: 'a', _contentID: 'c1', x: 0, y: 0, w: 2, h: 2 },
  { _positionID: 'b', _contentID: 'c2', x: 4, y: 1, w: 2, h: 3 },
];

test('applyRectPatch merges updates', () => {
  const result = applyRectPatch(sampleRects[0], { x: 3 });
  assert.equal(result.x, 3, 'patch applies x');
  assert.equal(result.w, 2, 'keeps other fields');
});

test('selection toggles with multi-select modifiers', () => {
  const selection = updateSelectionOnClick(['a'], 'b', { isMulti: true });
  assert.deepEqual(selection, ['a', 'b'], 'adds to selection');
  const toggled = updateSelectionOnClick(selection, 'a', { isMulti: true });
  assert.deepEqual(toggled, ['b'], 'toggles selection off');
});

test('selection replaces without modifiers', () => {
  const selection = updateSelectionOnClick(['a', 'b'], 'c', { isMulti: false });
  assert.deepEqual(selection, ['c'], 'replaces selection');
});

test('drag moves selection with grid clamp', () => {
  const result = updateRectsOnDrag(sampleRects, ['b'], { dx: 4, dy: 1 }, { columns: 6 });
  const moved = result.find((rect) => rect._positionID === 'b');
  assert.ok(moved, 'rect found');
  assert.equal(moved?.x, 4, 'drag clamped at column boundary');
  assert.equal(moved?.y, 2, 'dragged down');
});

test('drag moves multiple rects together', () => {
  const result = updateRectsOnDrag(sampleRects, ['a', 'b'], { dx: 1, dy: 0 }, { columns: 8 });
  const rectA = result.find((rect) => rect._positionID === 'a');
  const rectB = result.find((rect) => rect._positionID === 'b');
  assert.equal(rectA?.x, 1, 'rect a moved');
  assert.equal(rectB?.x, 5, 'rect b moved');
});

test('resize expands from southeast handle', () => {
  const result = updateRectsOnResize(sampleRects, ['a'], { dx: 1, dy: 2, handle: 'se' }, { columns: 8 });
  const resized = result.find((rect) => rect._positionID === 'a');
  assert.ok(resized, 'rect found');
  assert.equal(resized?.w, 3, 'width expanded');
  assert.equal(resized?.h, 4, 'height expanded');
});

test('resize clamps when shrinking past minimum', () => {
  const result = updateRectsOnResize(sampleRects, ['a'], { dx: 5, dy: 0, handle: 'w' }, { columns: 8 });
  const resized = result.find((rect) => rect._positionID === 'a');
  assert.ok(resized, 'rect found');
  assert.equal(resized?.w, 1, 'width clamped');
});

runAllTests();
