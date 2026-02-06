import type { VisualBlockDataState } from '../state/visual-block-data-state';
import type { VisualBlockUiStateDto } from '../dto/visual-block-ui-state.dto';
import { visualBlockProjectionModelSelectorImpl } from './visual-block-projection.selectors';

type TestCase = {
  name: string;
  run: () => void;
};

const tests: TestCase[] = [];

const test = (name: string, run: TestCase['run']) => {
  tests.push({ name, run });
};

const assert = {
  equal: (actual: unknown, expected: unknown, message: string) => {
    if (actual !== expected) {
      throw new Error(`${message} (expected ${String(expected)}, received ${String(actual)})`);
    }
  },
  ok: (value: unknown, message: string) => {
    if (!value) {
      throw new Error(message);
    }
  },
};

const sampleData: VisualBlockDataState = {
  layouts: {
    layout1: {
      columns: 12,
      maxWidth: 640,
      positions: [{ _positionID: 'a', _contentID: 'c1', x: 0, y: 0, w: 2, h: 2 }],
    },
  },
  rects: {},
  contents: {
    c1: {
      _contentID: 'c1',
      type: 'text',
    },
  },
  activeLayoutId: 'layout1',
};

const sampleUi: VisualBlockUiStateDto = {
  zoom: 1,
  mode: 'design',
  selectedIds: ['a'],
  blockId: 'a',
  rotationY: 35,
  modalState: {
    open: false,
    mode: 'architect',
  },
};

test('projection selector maps rotation and blocks', () => {
  const model = visualBlockProjectionModelSelectorImpl({
    visualBlockData: sampleData,
    visualBlockUi: sampleUi,
  });

  assert.equal(model.rotationY, 35, 'rotation is mapped');
  assert.equal(model.blocks.length, 1, 'block count mapped');
  assert.equal(model.blocks[0]?.type, 'text', 'content type mapped');
  assert.ok(model.selectedIds.includes('a'), 'selection mapped');
});

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
    throw new Error(`Projection selector tests failed:\n${failures.join('\n')}`);
  }
};

runAllTests();
