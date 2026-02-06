import type { CoreRegistries } from '../../../framework/src/nxt/runtime/registries/core-registries';
import type { ReducerImpl } from '../../../framework/src/nxt/runtime/registries/handlers/handler-impl-registry';
import { loadDefinitionPack } from '../../../framework/src/nxt/definitions/loader/load-definition-pack';
import { visualBlockDataReducer } from './reducers/visual-block-data.reducer';
import { visualBlockUiReducer } from './reducers/visual-block-ui.reducer';
import {
  visualBlockDefinitionPack,
  visualBlockDataReducerKey,
  visualBlockUiReducerKey,
  visualBlockDataSelectorImplKey,
  visualBlockUiSelectorImplKey,
  visualBlockProjectionModelSelectorImplKey,
  visualBlockInspectorModelSelectorImplKey,
} from './visual-block-definition-pack';
import { visualBlockInspectorModelSelectorImpl } from './inspector-view/visual-block-inspector.selectors';
import { visualBlockProjectionModelSelectorImpl } from './projection-view/visual-block-projection.selectors';
import { visualBlockDataSelectorImpl } from './selectors/visual-block-data.selector';
import {
  visualBlockRenderModelSelectorImpl,
  visualBlockRenderModelSelectorKey,
} from './selectors/visual-block-render-model.selector';
import { visualBlockUiSelectorImpl } from './selectors/visual-block-ui.selector';

import './inspector-view/visual-block-inspector.view';
import './projection-view/visual-block-projection.view';
import './visual-block-render-view';
import './visual-block-preview-view';

type CoreRegistriesContainer = {
  coreRegistries?: CoreRegistries<any>;
};

export const registerVisualBlockDefinitions = (root: CoreRegistriesContainer): void => {
  const registries = root.coreRegistries;
  if (!registries) {
    return;
  }

  registries.handlerImpls.register(
    visualBlockDataReducerKey,
    visualBlockDataReducer as ReducerImpl<any, any>,
  );
  registries.handlerImpls.register(
    visualBlockUiReducerKey,
    visualBlockUiReducer as ReducerImpl<any, any>,
  );

  registries.selectorImpls.register(
    visualBlockDataSelectorImplKey,
    visualBlockDataSelectorImpl as any,
  );
  registries.selectorImpls.register(
    visualBlockRenderModelSelectorKey,
    visualBlockRenderModelSelectorImpl as any,
  );
  registries.selectorImpls.register(
    visualBlockUiSelectorImplKey,
    visualBlockUiSelectorImpl as any,
  );
  registries.selectorImpls.register(
    visualBlockProjectionModelSelectorImplKey,
    visualBlockProjectionModelSelectorImpl as any,
  );
  registries.selectorImpls.register(
    visualBlockInspectorModelSelectorImplKey,
    visualBlockInspectorModelSelectorImpl as any,
  );

  loadDefinitionPack(visualBlockDefinitionPack, registries);
};
