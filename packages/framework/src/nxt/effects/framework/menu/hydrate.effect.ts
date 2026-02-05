import type { EffectImpl } from '../../../runtime/registries/effects/effect-impl-registry';
import { ActionCatalog } from '../../../runtime/actions/action-catalog';
import { menuPersistence } from '../../../../utils/menu-persistence';
import { dispatchActions, dispatchLog } from './menu-effect-helpers';

export const menuHydrateImplKey = 'effect:menu/hydrate@1';

export const menuHydrateEffect: EffectImpl = (_action, dispatch) => {
  const loadedConfig = menuPersistence.load();
  if (!loadedConfig) {
    dispatchLog(dispatch, 'warn', 'No framework menu config loaded from localStorage.');
  }
  dispatchActions(dispatch, [
    {
      action: ActionCatalog.MenuHydrate,
      payload: { config: loadedConfig ?? menuPersistence.getDefaultConfig() },
    },
  ]);
};
