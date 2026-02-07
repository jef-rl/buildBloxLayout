import type { EffectImpl } from '../../../runtime/registries/effects/effect-impl-registry';
import type { MenuConfig } from '../../../types/state';
import { menuPersistence } from '../../../../src/utils/menu-persistence';
import { logWarn } from '../../../runtime/engine/logging/framework-logger';

export const menuSaveImplKey = 'effect:menu/save@1';

export const menuSaveEffect: EffectImpl<{ config?: MenuConfig }> = (action) => {
  const payload = (action.payload ?? {}) as { config?: MenuConfig };
  if (!payload.config) {
    return;
  }
  try {
    menuPersistence.save(payload.config);
  } catch (error) {
    logWarn('Framework menu save failed in effect.', { error });
  }
};
