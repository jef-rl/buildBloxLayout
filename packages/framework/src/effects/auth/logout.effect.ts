import type { Action } from '../../runtime/actions/action';
import type { EffectImpl } from '../../runtime/registries/effects/effect-impl-registry';
import { ActionCatalog } from '../../runtime/actions/action-catalog';
import { logout } from '../../utils/firebase-auth';
import { clearAuthSuccessLater, dispatchActions, dispatchAuthUi, toErrorMessage } from './auth-effect-helpers';

export const authLogoutImplKey = 'effect:auth/logout@1';

const getAuthContext = (state: unknown) => {
  if (state && typeof state === 'object' && 'state' in state) {
    return (state as { state: any }).state as any;
  }
  return state as any;
};

export const authLogoutEffect: EffectImpl = (_action, dispatch, runtime) => {
  dispatchAuthUi(dispatch, { loading: true, error: null, success: null });
  const contextState = getAuthContext(runtime?.getState?.());
  const authConfig = contextState?.authConfig;
  const authViewId = authConfig?.authViewId ?? 'firebase-auth';
  const shouldAutoShow = Boolean(authConfig?.enabled && authConfig?.autoShowOnStartup);
  const shouldOpenOverlay = shouldAutoShow && contextState?.layout?.overlayView !== authViewId;
  logout()
    .then(() => {
      const followUps: Action<any>[] = [
        { action: ActionCatalog.AuthSetUser, payload: { user: null } },
        { action: ActionCatalog.AuthSetUi, payload: { loading: false, error: null, success: 'Logged out successfully' } },
      ];
      if (shouldOpenOverlay) {
        followUps.push({ action: ActionCatalog.LayoutSetOverlayView, payload: { viewId: authViewId } });
      }
      dispatchActions(dispatch, followUps);
      clearAuthSuccessLater(dispatch, 1500);
    })
    .catch((error) => {
      dispatchAuthUi(dispatch, { loading: false, error: toErrorMessage(error), success: null });
    });
};
