    import type { ActionDefDto } from '../dto/action-def.dto';
    import type { ActionRegistry } from '../../runtime/registries/actions/action-registry';

    export function applyActionDefs(registry: ActionRegistry, defs: ActionDefDto[]): void {
      for (const def of defs) registry.register(def);
    }
  