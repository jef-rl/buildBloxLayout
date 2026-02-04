    import type { HandlerDefDto } from '../dto/handler-def.dto';
    import type { HandlerRegistry } from '../../runtime/registries/handlers/handler-registry';

    export function applyHandlerDefs<S>(
      registry: HandlerRegistry<S>,
      defs: HandlerDefDto[],
    ): void {
      for (const def of defs) registry.applyDefinition(def);
    }
  