import type { EffectRegistry } from '../legacy/registry/effect-registry';
import type { HandlerAction } from '../core/registry/HandlerAction.type';
import type { FrameworkContextState } from '../domains/workspace/handlers/registry';
import { ActionCatalog } from '../../nxt/runtime/actions/action-catalog';
import {
  loginWithEmail,
  signupWithEmail,
  loginWithGoogle,
  sendPasswordReset,
  logout,
} from '../utils/firebase-auth';

const toErrorMessage = (error: unknown): string => {
  const code = (error as { code?: string })?.code ?? '';

  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'Email is already registered';
    case 'auth/weak-password':
      return 'Password is too weak';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed';
    case 'auth/cancelled-popup-request':
      return 'Only one popup request is allowed at a time';
    default:
      return (error as { message?: string })?.message ?? 'An error occurred';
  }
};

const setAuthUi = (
  dispatch: (actions: HandlerAction[]) => void,
  payload: { loading?: boolean; error?: string | null; success?: string | null },
) => {
  dispatch([{ type: ActionCatalog.AuthSetUi, payload }]);
};

const clearSuccessLater = (dispatch: (actions: HandlerAction[]) => void, delayMs: number) => {
  setTimeout(() => {
    dispatch([{ type: ActionCatalog.AuthSetUi, payload: { success: null } }]);
  }, delayMs);
};

export const registerAuthEffects = (
  registry: EffectRegistry<FrameworkContextState>,
): void => {
  registry.register(ActionCatalog.AuthLoginRequested, (_context, action, dispatch) => {
    const payload = (action.payload ?? {}) as { email?: string; password?: string };
    setAuthUi(dispatch, { loading: true, error: null, success: null });
    loginWithEmail(payload.email ?? '', payload.password ?? '')
      .then((user) => {
        dispatch([
          { type: ActionCatalog.AuthSetUser, payload: { user } },
          { type: ActionCatalog.AuthSetUi, payload: { loading: false, error: null, success: 'Login successful!' } },
        ]);
        clearSuccessLater(dispatch, 1500);
      })
      .catch((error) => {
        setAuthUi(dispatch, { loading: false, error: toErrorMessage(error), success: null });
      });
  });

  registry.register(ActionCatalog.AuthSignupRequested, (_context, action, dispatch) => {
    const payload = (action.payload ?? {}) as { email?: string; password?: string };
    setAuthUi(dispatch, { loading: true, error: null, success: null });
    signupWithEmail(payload.email ?? '', payload.password ?? '')
      .then((user) => {
        dispatch([
          { type: ActionCatalog.AuthSetUser, payload: { user } },
          { type: ActionCatalog.AuthSetUi, payload: { loading: false, error: null, success: 'Account created successfully!' } },
        ]);
        clearSuccessLater(dispatch, 1500);
      })
      .catch((error) => {
        setAuthUi(dispatch, { loading: false, error: toErrorMessage(error), success: null });
      });
  });

  registry.register(ActionCatalog.AuthGoogleLoginRequested, (_context, _action, dispatch) => {
    setAuthUi(dispatch, { loading: true, error: null, success: null });
    loginWithGoogle()
      .then((user) => {
        dispatch([
          { type: ActionCatalog.AuthSetUser, payload: { user } },
          { type: ActionCatalog.AuthSetUi, payload: { loading: false, error: null, success: 'Login successful!' } },
        ]);
        clearSuccessLater(dispatch, 1500);
      })
      .catch((error) => {
        setAuthUi(dispatch, { loading: false, error: toErrorMessage(error), success: null });
      });
  });

  registry.register(ActionCatalog.AuthPasswordResetRequested, (_context, action, dispatch) => {
    const payload = (action.payload ?? {}) as { email?: string };
    setAuthUi(dispatch, { loading: true, error: null, success: null });
    sendPasswordReset(payload.email ?? '')
      .then(() => {
        dispatch([
          { type: ActionCatalog.AuthSetUi, payload: { loading: false, error: null, success: 'Password reset email sent! Check your inbox.' } },
        ]);
        clearSuccessLater(dispatch, 3000);
      })
      .catch((error) => {
        setAuthUi(dispatch, { loading: false, error: toErrorMessage(error), success: null });
      });
  });

  registry.register(ActionCatalog.AuthLogoutRequested, (context, _action, dispatch) => {
    setAuthUi(dispatch, { loading: true, error: null, success: null });
    const authConfig = context.state.authConfig;
    const authViewId = authConfig?.authViewId ?? 'firebase-auth';
    const shouldAutoShow = Boolean(authConfig?.enabled && authConfig?.autoShowOnStartup);
    const shouldOpenOverlay =
      shouldAutoShow && context.state.layout?.overlayView !== authViewId;

    logout()
      .then(() => {
        const followUps: HandlerAction[] = [
          { type: ActionCatalog.AuthSetUser, payload: { user: null } },
          { type: ActionCatalog.AuthSetUi, payload: { loading: false, error: null, success: 'Logged out successfully' } },
        ];
        if (shouldOpenOverlay) {
          followUps.push({
            type: ActionCatalog.LayoutSetOverlayView,
            payload: { viewId: authViewId },
          });
        }
        dispatch(followUps);
        clearSuccessLater(dispatch, 1500);
      })
      .catch((error) => {
        setAuthUi(dispatch, { loading: false, error: toErrorMessage(error), success: null });
      });
  });

};
