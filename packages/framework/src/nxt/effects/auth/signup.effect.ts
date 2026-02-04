import type { EffectImpl } from '../../runtime/registries/effects/effect-impl-registry';
import { ActionCatalog } from '../../runtime/actions/action-catalog';
import { signupWithEmail } from '../../../utils/firebase-auth';
import { clearAuthSuccessLater, dispatchActions, dispatchAuthUi, toErrorMessage } from './auth-effect-helpers';

export const authSignupImplKey = 'effect:auth/signup@1';

export const authSignupEffect: EffectImpl<{ email?: string; password?: string }> = (
  action,
  dispatch,
) => {
  const payload = (action.payload ?? {}) as { email?: string; password?: string };
  dispatchAuthUi(dispatch, { loading: true, error: null, success: null });
  signupWithEmail(payload.email ?? '', payload.password ?? '')
    .then((user) => {
      dispatchActions(dispatch, [
        { action: ActionCatalog.AuthSetUser, payload: { user } },
        { action: ActionCatalog.AuthSetUi, payload: { loading: false, error: null, success: 'Account created successfully!' } },
      ]);
      clearAuthSuccessLater(dispatch, 1500);
    })
    .catch((error) => {
      dispatchAuthUi(dispatch, { loading: false, error: toErrorMessage(error), success: null });
    });
};
