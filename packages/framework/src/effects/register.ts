import type { EffectRegistry } from '../legacy/registry/effect-registry';
import type { FrameworkContextState } from '../domains/workspace/handlers/registry';

export const registerFrameworkEffects = (
  _registry: EffectRegistry<FrameworkContextState>,
): void => {
  // Legacy shim: the effect registry now wires NXT effects internally.
};
