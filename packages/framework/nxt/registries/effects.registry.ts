
import { registerAuthEffects } from '../auth/auth.effects';
import { registerPresetEffects } from '../framework/preset.effects';
import { registerFrameworkMenuEffects } from '../framework/framework-menu.effects';
import { EffectRegistry } from './effect.registry';
import { FrameworkContextState } from '../workspace/workspace-registry.handlers';

export const registerFrameworkEffects = (
  registry: EffectRegistry<FrameworkContextState>,
): void => {
  registerAuthEffects(registry);
  registerPresetEffects(registry);
  registerFrameworkMenuEffects(registry);
};
