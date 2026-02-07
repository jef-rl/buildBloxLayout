import type { EffectImpl } from '../../runtime/registries/effects/effect-impl-registry';
import type { LayoutPreset } from '../../types/state';
import { hybridPersistence } from '../../utils/hybrid-persistence';
import { logWarn } from '../../runtime/engine/logging/framework-logger';

export const presetsSaveImplKey = 'effect:presets/save@1';

export const presetsSaveEffect: EffectImpl<{ name?: string; preset?: LayoutPreset }> = (
  action,
  _dispatch,
) => {
  const payload = (action.payload ?? {}) as { name?: string; preset?: LayoutPreset };
  if (!payload.name || !payload.preset) {
    return;
  }
  try {
    hybridPersistence.savePreset(payload.name, payload.preset);
  } catch (error) {
    logWarn('Preset save failed in effect.', { error });
  }
};
