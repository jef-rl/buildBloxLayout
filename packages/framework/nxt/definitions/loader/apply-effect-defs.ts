    import type { EffectDefDto } from '../dto/effect-def.dto';
    import type { EffectRegistry } from '../../runtime/registries/effects/effect-registry';

    export function applyEffectDefs(
      registry: EffectRegistry,
      defs: EffectDefDto[],
    ): void {
      for (const def of defs) registry.applyDefinition(def);
    }
  