import type { EffectImpl } from '../../runtime/registries/effects/effect-impl-registry';

export const authLogoutTriggerImplKey = 'effect:auth/logout-trigger@1';

export const authLogoutTriggerEffect: EffectImpl = (_action, dispatch) => {
  dispatch({ action: 'auth/logoutRequested', payload: {} });
};
