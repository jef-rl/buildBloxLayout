import type { EffectRegistry } from '../core/registry/effect-registry';
import type { FrameworkContextState } from '../domains/workspace/handlers/registry';
import { registerAuthEffects } from './auth.effects';
import { registerPresetEffects } from './preset.effects';
import { registerFrameworkMenuEffects } from './framework-menu.effects';

export const registerFrameworkEffects = (
  registry: EffectRegistry<FrameworkContextState>,
): void => {
  registerAuthEffects(registry);
  registerPresetEffects(registry);
  registerFrameworkMenuEffects(registry);
};
