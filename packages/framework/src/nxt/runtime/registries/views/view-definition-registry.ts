    import type { ViewDefDto } from '../../../definitions/dto/view-def.dto';

    export interface ViewRuntimeDef extends ViewDefDto {}

    export class ViewDefinitionRegistry {
      private readonly defs = new Map<string, ViewRuntimeDef>();

      register(def: ViewDefDto): void {
        this.defs.set(def.id, { ...def });
      }

      get(id: string): ViewRuntimeDef | undefined {
        return this.defs.get(id);
      }

      getOrThrow(id: string): ViewRuntimeDef {
        const def = this.defs.get(id);
        if (!def) {
          throw new Error(`View not registered: ${id}`);
        }
        return def;
      }

      entries(): ViewRuntimeDef[] {
        return [...this.defs.values()];
      }
    }
  