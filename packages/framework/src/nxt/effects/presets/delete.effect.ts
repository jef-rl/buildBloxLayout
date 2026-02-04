import type { EffectImpl } from '../../runtime/registries/effects/effect-impl-registry';
import { hybridPersistence } from '../../../utils/hybrid-persistence';
import { getFrameworkLogger } from '../../../utils/logger';

export const presetsDeleteImplKey = 'effect:presets/delete@1';

export const presetsDeleteEffect: EffectImpl<{ name?: string }> = (action) => {
  const payload = (action.payload ?? {}) as { name?: string };
  if (!payload.name) {
    return;
  }
  try {
    hybridPersistence.deletePreset(payload.name);
  } catch (error) {
    const logger = getFrameworkLogger();
    logger?.warn?.('Preset delete failed in effect.', { error });
  }
};
