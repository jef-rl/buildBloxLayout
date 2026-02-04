import type { EffectImpl } from '../../runtime/registries/effects/effect-impl-registry';
import { loginWithGoogle } from '../../../utils/firebase-auth';
import { clearAuthSuccessLater, dispatchActions, dispatchAuthUi, toErrorMessage } from './auth-effect-helpers';

export const authGoogleLoginImplKey = 'effect:auth/google-login@1';

export const authGoogleLoginEffect: EffectImpl = (_action, dispatch) => {
  dispatchAuthUi(dispatch, { loading: true, error: null, success: null });
  loginWithGoogle()
    .then((user) => {
      dispatchActions(dispatch, [
        { action: 'auth/setUser', payload: { user } },
        { action: 'auth/setUi', payload: { loading: false, error: null, success: 'Login successful!' } },
      ]);
      clearAuthSuccessLater(dispatch, 1500);
    })
    .catch((error) => {
      dispatchAuthUi(dispatch, { loading: false, error: toErrorMessage(error), success: null });
    });
};
