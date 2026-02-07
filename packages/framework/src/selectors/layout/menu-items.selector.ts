import type { SelectorImpl } from '../../runtime/registries/selectors/selector-impl-registry';
import type { MenuItem, UIState } from '../../types/state';

export const menuItemsSelectorKey = 'selector:layout/menuItems';

export const menuItemsSelectorImpl: SelectorImpl<UIState, MenuItem[]> = (state) => {
  return state.layout?.menu?.items ?? [];
};
