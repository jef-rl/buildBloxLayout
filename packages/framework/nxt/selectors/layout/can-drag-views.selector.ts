import type { SelectorImpl } from '../../runtime/registries/selectors/selector-impl-registry';
import type { UIState } from '../../../src/types/state';

export const canDragViewsSelectorKey = 'selector:layout/canDragViews';

export const canDragViewsSelectorImpl: SelectorImpl<UIState, boolean> = (state) => {
  return Boolean(state.auth?.isAdmin && state.layout?.inDesign);
};
