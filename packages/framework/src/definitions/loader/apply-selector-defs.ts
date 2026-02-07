    import type { SelectorDefDto } from '../dto/selector-def.dto';
    import type { SelectorImplRegistry } from '../../runtime/registries/selectors/selector-impl-registry';

    export function applySelectorDefs<S>(
      registry: SelectorImplRegistry<S>,
      defs: SelectorDefDto[],
    ): void {
      for (const def of defs) registry.getOrThrow(def.implKey);
    }
  
