import type { EffectImpl } from '../../runtime/registries/effects/effect-impl-registry';
import type { FrameworkMenuConfig } from '../../../types/state';
import { frameworkMenuPersistence } from '../../../utils/framework-menu-persistence';
import { getFrameworkLogger } from '../../../utils/logger';

export const frameworkMenuSaveImplKey = 'effect:framework-menu/save@1';

export const frameworkMenuSaveEffect: EffectImpl<{ config?: FrameworkMenuConfig }> = (action) => {
  const payload = (action.payload ?? {}) as { config?: FrameworkMenuConfig };
  if (!payload.config) {
    return;
  }
  try {
    frameworkMenuPersistence.save(payload.config);
  } catch (error) {
    const logger = getFrameworkLogger();
    logger?.warn?.('Framework menu save failed in effect.', { error });
  }
};
