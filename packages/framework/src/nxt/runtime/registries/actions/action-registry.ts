    import type { ActionDefDto } from '../../../definitions/dto/action-def.dto';

    export interface ActionRuntimeDef extends ActionDefDto {}

    export class ActionRegistry {
      private readonly defs = new Map<string, ActionRuntimeDef>();

      register(def: ActionDefDto): void {
        this.defs.set(def.id, { ...def });
      }

      get(id: string): ActionRuntimeDef | undefined {
        return this.defs.get(id);
      }

      getOrThrow(id: string): ActionRuntimeDef {
        const def = this.defs.get(id);
        if (!def) throw new Error(`Action not registered: ${id}`);
        return def;
      }

      entries(): ActionRuntimeDef[] {
        return [...this.defs.values()];
      }
    }
  