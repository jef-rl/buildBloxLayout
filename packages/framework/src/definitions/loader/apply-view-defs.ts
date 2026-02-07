    import type { ViewDefDto } from '../dto/view-def.dto';
    import type { ViewDefinitionRegistry } from '../../runtime/registries/views/view-definition-registry';

    export function applyViewDefs(
      registry: ViewDefinitionRegistry,
      defs: ViewDefDto[],
    ): void {
      for (const def of defs) registry.register(def);
    }
  