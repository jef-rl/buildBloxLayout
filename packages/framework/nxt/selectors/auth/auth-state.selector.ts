import type { SelectorImpl } from '../../runtime/registries/selectors/selector-impl-registry';
import type { UIState } from '../../../src/types/state';

export const authStateSelectorKey = 'selector:auth/state';

export const authStateSelectorImpl: SelectorImpl<UIState, UIState['auth']> = (state) => {
  return (
    state.auth ?? {
      isLoggedIn: false,
      isAdmin: false,
      user: null,
    }
  );
};
