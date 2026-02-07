import type { SelectorImpl } from '../../runtime/registries/selectors/selector-impl-registry';
import type { UIState } from '../../types/state';

export const authUiSelectorKey = 'selector:auth/ui';

export const authUiSelectorImpl: SelectorImpl<UIState, UIState['authUi']> = (state) => {
  return (
    state.authUi ?? {
      loading: false,
      error: null,
      success: null,
      allowSignup: true,
      allowGoogleSignIn: true,
      allowPasswordReset: true,
      oauthProviders: [],
    }
  );
};
