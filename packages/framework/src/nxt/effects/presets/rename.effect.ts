import type { EffectImpl } from '../../runtime/registries/effects/effect-impl-registry';
import { hybridPersistence } from '../../../utils/hybrid-persistence';
import { logWarn } from '../../runtime/engine/logging/framework-logger';

export const presetsRenameImplKey = 'effect:presets/rename@1';

export const presetsRenameEffect: EffectImpl<{ oldName?: string; newName?: string }> = (action) => {
  const payload = (action.payload ?? {}) as { oldName?: string; newName?: string };
  if (!payload.oldName || !payload.newName) {
    return;
  }
  try {
    hybridPersistence.renamePreset(payload.oldName, payload.newName);
  } catch (error) {
    logWarn('Preset rename failed in effect.', { error });
  }
};
