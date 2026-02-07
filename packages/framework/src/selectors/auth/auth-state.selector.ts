import type { SelectorImpl } from '../../runtime/registries/selectors/selector-impl-registry';
import type { UIState } from '../../types/state';

export const authStateSelectorKey = 'selector:auth/state';

export const authStateSelectorImpl: SelectorImpl<UIState, UIState['auth']> = (state) => {
  return (
    state.auth ?? {
      enabled: false,
      configChecked: false,
      currentUser: null,
      isLoggedIn: false,
      isAdmin: false,
      user: null,
    }
  );
};
