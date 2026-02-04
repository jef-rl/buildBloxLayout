import type { EffectImpl } from '../../runtime/registries/effects/effect-impl-registry';
import { loginWithEmail } from '../../../utils/firebase-auth';
import { clearAuthSuccessLater, dispatchActions, dispatchAuthUi, toErrorMessage } from './auth-effect-helpers';

export const authLoginImplKey = 'effect:auth/login@1';

export const authLoginEffect: EffectImpl<{ email?: string; password?: string }> = (
  action,
  dispatch,
) => {
  const payload = (action.payload ?? {}) as { email?: string; password?: string };
  dispatchAuthUi(dispatch, { loading: true, error: null, success: null });
  loginWithEmail(payload.email ?? '', payload.password ?? '')
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
