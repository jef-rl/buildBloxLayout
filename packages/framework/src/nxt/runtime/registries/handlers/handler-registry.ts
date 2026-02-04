    import type { Action } from '../../actions/action';
    import type { HandlerDefDto } from '../../../definitions/dto/handler-def.dto';
    import type { ReducerImpl } from './handler-impl-registry';
    import { HandlerImplRegistry } from './handler-impl-registry';

    export interface HandlerRuntimeEntry<S = any> {
      id: string;
      action: string;
      reduce: ReducerImpl<S, any>;
      config?: Record<string, unknown>;
      description?: string;
    }

    export class HandlerRegistry<S = any> {
      private readonly byAction = new Map<string, HandlerRuntimeEntry<S>[]>();

      constructor(private readonly impls: HandlerImplRegistry<S>) {}

      applyDefinition(def: HandlerDefDto): void {
        const reduce = this.impls.getOrThrow(def.implKey);
        const entry: HandlerRuntimeEntry<S> = {
          id: def.id,
          action: def.action,
          reduce,
          config: def.config,
          description: def.description,
        };
        const list = this.byAction.get(def.action) ?? [];
        list.push(entry);
        this.byAction.set(def.action, list);
      }

      getForAction(action: string): HandlerRuntimeEntry<S>[] {
        return this.byAction.get(action) ?? [];
      }
    }
  