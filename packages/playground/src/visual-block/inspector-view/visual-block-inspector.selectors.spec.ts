import type { VisualBlockDataState } from '../state/visual-block-data-state';
import type { VisualBlockUiStateDto } from '../dto/visual-block-ui-state.dto';
import { visualBlockInspectorModelSelectorImpl } from './visual-block-inspector.selectors';

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
};

const sampleData: VisualBlockDataState = {
  layouts: {
    layout1: {
      columns: 12,
      maxWidth: 640,
      positions: [
        { _positionID: 'a', _contentID: 'c1', x: 1, y: 2, w: 2, h: 2, z: 3 },
        { _positionID: 'b', _contentID: 'c2', x: 4, y: 1, w: 1, h: 1 },
      ],
    },
  },
  rects: {},
  contents: {
    c1: {
      _contentID: 'c1',
      type: 'image',
    },
    c2: {
      _contentID: 'c2',
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
  rotationY: 10,
  modalState: {
    open: false,
    mode: 'architect',
  },
};

test('inspector selector maps selection metadata', () => {
  const model = visualBlockInspectorModelSelectorImpl({
    visualBlockData: sampleData,
    visualBlockUi: sampleUi,
  });

  assert.equal(model.items.length, 1, 'selection maps to single item');
  assert.equal(model.items[0]?.id, 'a', 'id mapped');
  assert.equal(model.items[0]?.rotationY, 10, 'rotation mapped');
  assert.equal(model.items[0]?.type, 'image', 'content type mapped');
  assert.equal(model.activeId, 'a', 'active id mapped');
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
    throw new Error(`Inspector selector tests failed:\n${failures.join('\n')}`);
  }
};

runAllTests();
