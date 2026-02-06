import type { DefinitionPackDto } from '../../../framework/src/nxt/definitions/dto/definition-pack.dto';
import { VisualBlockActionCatalog } from './visual-block-action-catalog';
import { visualBlockDataSelectorKey } from './selectors/visual-block-data.selector';
import { visualBlockUiSelectorKey } from './selectors/visual-block-ui.selector';

export const visualBlockDataReducerKey = 'reducer:visual-block/data@1';
export const visualBlockUiReducerKey = 'reducer:visual-block/ui@1';

export const visualBlockDataSelectorImplKey = visualBlockDataSelectorKey;
export const visualBlockUiSelectorImplKey = visualBlockUiSelectorKey;

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
  ],
  selectors: [
    {
      id: visualBlockDataSelectorKey,
      implKey: visualBlockDataSelectorImplKey,
      description: 'Select visual block data state.',
    },
    {
      id: visualBlockUiSelectorKey,
      implKey: visualBlockUiSelectorImplKey,
      description: 'Select visual block UI state.',
    },
  ],
};
