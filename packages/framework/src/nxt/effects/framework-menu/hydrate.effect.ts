import type { EffectImpl } from '../../runtime/registries/effects/effect-impl-registry';
import { frameworkMenuPersistence } from '../../../utils/framework-menu-persistence';
import { dispatchActions, dispatchLog } from './framework-menu-effect-helpers';

export const frameworkMenuHydrateImplKey = 'effect:framework-menu/hydrate@1';

export const frameworkMenuHydrateEffect: EffectImpl = (_action, dispatch) => {
  const loadedConfig = frameworkMenuPersistence.load();
  if (!loadedConfig) {
    dispatchLog(dispatch, 'warn', 'No framework menu config loaded from localStorage.');
  }
  dispatchActions(dispatch, [
    {
      action: 'frameworkMenu/hydrate',
      payload: { config: loadedConfig ?? frameworkMenuPersistence.getDefaultConfig() },
    },
  ]);
};
