import type { SelectorImpl } from '../../runtime/registries/selectors/selector-impl-registry';
import type { ViewInstanceDto } from '../../definitions/dto/view-instance.dto';
import type { UIState } from '../../../src/types/state';
import { resolveViewInstance } from '../view-instances/resolve-view-instance.selector';

export const overlayViewSelectorKey = 'selector:overlay/view';

export type OverlayViewState = {
  overlayViewId: string | null;
  isOpen: boolean;
  instance: ViewInstanceDto | null;
};

export const overlayViewSelectorImpl: SelectorImpl<UIState, OverlayViewState> = (state) => {
  const overlayViewId = state.layout?.overlayView ?? null;
  const instance = resolveViewInstance(state, overlayViewId);
  return {
    overlayViewId,
    isOpen: Boolean(overlayViewId),
    instance,
  };
};
