import type { EffectImpl } from '../../runtime/registries/effects/effect-impl-registry';
import { sendPasswordReset } from '../../../utils/firebase-auth';
import { clearAuthSuccessLater, dispatchActions, dispatchAuthUi, toErrorMessage } from './auth-effect-helpers';

export const authPasswordResetImplKey = 'effect:auth/password-reset@1';

export const authPasswordResetEffect: EffectImpl<{ email?: string }> = (action, dispatch) => {
  const payload = (action.payload ?? {}) as { email?: string };
  dispatchAuthUi(dispatch, { loading: true, error: null, success: null });
  sendPasswordReset(payload.email ?? '')
    .then(() => {
      dispatchActions(dispatch, [
        {
          action: 'auth/setUi',
          payload: { loading: false, error: null, success: 'Password reset email sent! Check your inbox.' },
        },
      ]);
      clearAuthSuccessLater(dispatch, 3000);
    })
    .catch((error) => {
      dispatchAuthUi(dispatch, { loading: false, error: toErrorMessage(error), success: null });
    });
};
