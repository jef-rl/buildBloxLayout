import type { EffectImpl } from '../../../runtime/registries/effects/effect-impl-registry';
import type { FrameworkMenuConfig } from '../../../../types/state';
import { frameworkMenuPersistence } from '../../../../utils/framework-menu-persistence';
import { logWarn } from '../../../runtime/engine/logging/framework-logger';

export const frameworkMenuSaveImplKey = 'effect:framework-menu/save@1';

export const frameworkMenuSaveEffect: EffectImpl<{ config?: FrameworkMenuConfig }> = (action) => {
  const payload = (action.payload ?? {}) as { config?: FrameworkMenuConfig };
  if (!payload.config) {
    return;
  }
  try {
    frameworkMenuPersistence.save(payload.config);
  } catch (error) {
    logWarn('Framework menu save failed in effect.', { error });
  }
};
