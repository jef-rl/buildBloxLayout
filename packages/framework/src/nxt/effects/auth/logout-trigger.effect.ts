import type { EffectImpl } from '../../runtime/registries/effects/effect-impl-registry';
import { ActionCatalog } from '../../runtime/actions/action-catalog';

export const authLogoutTriggerImplKey = 'effect:auth/logout-trigger@1';

export const authLogoutTriggerEffect: EffectImpl = (_action, dispatch) => {
  dispatch({ action: ActionCatalog.AuthLogoutRequested, payload: {} });
};
