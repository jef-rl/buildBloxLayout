import type { CoreRegistries } from '@project/framework/nxt/runtime/registries/core-registries';
import type { EffectImpl } from '@project/framework/nxt/runtime/registries/effects/effect-impl-registry';
import type { ReducerImpl } from '@project/framework/nxt/runtime/registries/handlers/handler-impl-registry';
import { loadDefinitionPack } from '@project/framework/nxt/definitions/loader/load-definition-pack';
import { visualBlockDataReducer } from './reducers/visual-block-data.reducer';
import { visualBlockUiReducer } from './reducers/visual-block-ui.reducer';
import { createVisualBlockDataRequestedEffect } from './data-loading/visual-block-data-effects';
import {
  createVisualBlockDataEffectDepsForPlayground,
  type VisualBlockDataSourceConfig,
} from './data-loading/visual-block-data-playground-helpers';
import {
  visualBlockDefinitionPack,
  visualBlockDataReducerKey,
  visualBlockDataRequestedEffectImplKey,
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

const resolveVisualBlockDataSources = (
  runtime?: { config?: Record<string, unknown> },
): VisualBlockDataSourceConfig[] => {
  const sources = runtime?.config?.sources;
  return Array.isArray(sources) ? (sources as VisualBlockDataSourceConfig[]) : [];
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

  registries.effectImpls.register(
    visualBlockDataRequestedEffectImplKey,
    ((action, dispatch, runtime) => {
      const deps = createVisualBlockDataEffectDepsForPlayground(
        resolveVisualBlockDataSources(runtime),
        {
          dispatch: (action) => {
            dispatch(action as any);
          },
          logError: (message, error) => {
            console.error(message, error);
          },
        },
      );
      const effect = createVisualBlockDataRequestedEffect(deps);
      return effect(action as any);
    }) as EffectImpl<any, any>,
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
