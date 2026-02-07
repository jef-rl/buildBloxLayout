import type { DefinitionPackDto } from '../../../framework/src/nxt/definitions/dto/definition-pack.dto';
import { VisualBlockActionCatalog } from './visual-block-action-catalog';
import {
  VISUAL_BLOCK_DATA_LOAD_FAILED,
  VISUAL_BLOCK_DATA_LOADED,
  VISUAL_BLOCK_DATA_REQUESTED,
} from './data-loading/visual-block-data-actions';
import { visualBlockInspectorModelSelectorKey } from './inspector-view/visual-block-inspector.selectors';
import { visualBlockProjectionModelSelectorKey } from './projection-view/visual-block-projection.selectors';
import { visualBlockDataSelectorKey } from './selectors/visual-block-data.selector';
import { visualBlockRenderModelSelectorKey } from './selectors/visual-block-render-model.selector';
import { visualBlockUiSelectorKey } from './selectors/visual-block-ui.selector';

export const visualBlockDataReducerKey = 'reducer:visual-block/data@1';
export const visualBlockUiReducerKey = 'reducer:visual-block/ui@1';
export const visualBlockDataRequestedEffectImplKey = 'effect:visual-block/dataRequested@1';

export const visualBlockDataSelectorImplKey = visualBlockDataSelectorKey;
export const visualBlockUiSelectorImplKey = visualBlockUiSelectorKey;
export const visualBlockProjectionModelSelectorImplKey = visualBlockProjectionModelSelectorKey;
export const visualBlockInspectorModelSelectorImplKey = visualBlockInspectorModelSelectorKey;

export const visualBlockDefinitionPack: DefinitionPackDto = {
  id: 'visual-blocks/phase-0',
  version: '1.0.0',
  actions: [
    {
      id: VisualBlockActionCatalog.VisualBlockDataSet,
      description: 'Replace visual block data state.',
    },
    {
      id: VisualBlockActionCatalog.VisualBlockDataPatch,
      description: 'Patch visual block data state.',
    },
    {
      id: VisualBlockActionCatalog.VisualBlockUiSet,
      description: 'Replace visual block UI state.',
    },
    {
      id: VisualBlockActionCatalog.VisualBlockUiPatch,
      description: 'Patch visual block UI state.',
    },
    {
      id: VisualBlockActionCatalog.VisualBlockZoomChanged,
      description: 'Patch visual block UI zoom.',
    },
    {
      id: VisualBlockActionCatalog.VisualBlockModeChanged,
      description: 'Patch visual block UI mode.',
    },
    {
      id: VisualBlockActionCatalog.VisualBlockRotationChanged,
      description: 'Patch visual block UI rotation.',
    },
    {
      id: VISUAL_BLOCK_DATA_REQUESTED,
      description: 'Request visual block data by source.',
    },
    {
      id: VISUAL_BLOCK_DATA_LOADED,
      description: 'Load visual block data for a source.',
    },
    {
      id: VISUAL_BLOCK_DATA_LOAD_FAILED,
      description: 'Handle visual block data load failure.',
    },
  ],
  handlers: [
    {
      id: `handler:${VisualBlockActionCatalog.VisualBlockDataSet}`,
      action: VisualBlockActionCatalog.VisualBlockDataSet,
      implKey: visualBlockDataReducerKey,
      config: { mode: 'replace' },
    },
    {
      id: `handler:${VisualBlockActionCatalog.VisualBlockDataPatch}`,
      action: VisualBlockActionCatalog.VisualBlockDataPatch,
      implKey: visualBlockDataReducerKey,
      config: { mode: 'patch' },
    },
    {
      id: `handler:${VisualBlockActionCatalog.VisualBlockUiSet}`,
      action: VisualBlockActionCatalog.VisualBlockUiSet,
      implKey: visualBlockUiReducerKey,
      config: { mode: 'replace' },
    },
    {
      id: `handler:${VisualBlockActionCatalog.VisualBlockUiPatch}`,
      action: VisualBlockActionCatalog.VisualBlockUiPatch,
      implKey: visualBlockUiReducerKey,
      config: { mode: 'patch' },
    },
    {
      id: `handler:${VisualBlockActionCatalog.VisualBlockZoomChanged}`,
      action: VisualBlockActionCatalog.VisualBlockZoomChanged,
      implKey: visualBlockUiReducerKey,
      config: { mode: 'patch' },
    },
    {
      id: `handler:${VisualBlockActionCatalog.VisualBlockModeChanged}`,
      action: VisualBlockActionCatalog.VisualBlockModeChanged,
      implKey: visualBlockUiReducerKey,
      config: { mode: 'patch' },
    },
    {
      id: `handler:${VisualBlockActionCatalog.VisualBlockRotationChanged}`,
      action: VisualBlockActionCatalog.VisualBlockRotationChanged,
      implKey: visualBlockUiReducerKey,
      config: { mode: 'patch' },
    },
  ],
  effects: [
    {
      id: `effect:${VISUAL_BLOCK_DATA_REQUESTED}`,
      forAction: VISUAL_BLOCK_DATA_REQUESTED,
      implKey: visualBlockDataRequestedEffectImplKey,
      description: 'Fetch visual block data by source for the playground demo.',
      config: {
        sources: [
          {
            sourceId: 'demo-default',
            url: '/data/visual-blocks/demo-definition.json',
            label: 'Demo visual block data',
          },
        ],
      },
    },
  ],
  selectors: [
    {
      id: visualBlockDataSelectorKey,
      implKey: visualBlockDataSelectorImplKey,
      description: 'Select visual block data state.',
    },
    {
      id: visualBlockRenderModelSelectorKey,
      implKey: visualBlockRenderModelSelectorKey,
      description: 'Select derived visual block render model.',
    },
    {
      id: visualBlockUiSelectorKey,
      implKey: visualBlockUiSelectorImplKey,
      description: 'Select visual block UI state.',
    },
    {
      id: visualBlockProjectionModelSelectorKey,
      implKey: visualBlockProjectionModelSelectorImplKey,
      description: 'Select derived visual block projection view model.',
    },
    {
      id: visualBlockInspectorModelSelectorKey,
      implKey: visualBlockInspectorModelSelectorImplKey,
      description: 'Select derived visual block inspector view model.',
    },
  ],
};
