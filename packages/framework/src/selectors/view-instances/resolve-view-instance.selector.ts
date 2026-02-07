import type { SelectorImpl } from '../../runtime/registries/selectors/selector-impl-registry';
import type { ViewInstanceDto } from '../../definitions/dto/view-instance.dto';
import type { UIState } from '../../types/state';

export const viewInstanceResolverSelectorKey = 'selector:view/instanceResolver';

export type ViewInstanceResolver = (viewId: string | null | undefined) => ViewInstanceDto | null;

export const resolveViewInstance = (state: UIState, viewId: string | null | undefined): ViewInstanceDto | null => {
  if (!viewId) {
    return null;
  }

  const instance = state.viewInstances?.[viewId];
  if (instance) {
    return {
      instanceId: instance.instanceId,
      viewId: instance.definitionId,
      settings: instance.localContext,
    };
  }

  const legacyView = state.views?.find((view) => view.id === viewId);
  if (legacyView) {
    return {
      instanceId: legacyView.id,
      viewId: legacyView.component,
      settings: (legacyView.data as Record<string, unknown>) ?? {},
    };
  }

  return { instanceId: viewId, viewId };
};

export const viewInstanceResolverSelectorImpl: SelectorImpl<UIState, ViewInstanceResolver> = (state) => {
  return (viewId) => resolveViewInstance(state, viewId);
};
