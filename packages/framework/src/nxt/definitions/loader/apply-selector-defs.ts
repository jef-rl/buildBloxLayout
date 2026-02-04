    import type { SelectorDefDto } from '../dto/selector-def.dto';
    import type { SelectorImplRegistry } from '../../runtime/registries/selectors/selector-impl-registry';

    export function applySelectorDefs<S>(
      _registry: SelectorImplRegistry<S>,
      _defs: SelectorDefDto[],
    ): void {
      // Intentionally minimal for now.
      // In a fuller implementation, this could validate that implKeys exist.
    }
  