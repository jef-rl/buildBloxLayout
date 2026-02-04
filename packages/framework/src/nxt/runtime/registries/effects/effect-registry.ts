import type { Action } from '../../actions/action';
import type { EffectDefDto } from '../../../definitions/dto/effect-def.dto';
import { EffectImplRegistry, type EffectImpl } from './effect-impl-registry';

export interface EffectRuntimeEntry {
  id: string;
  forAction: string;
  run: EffectImpl<any>;
  config?: Record<string, unknown>;
  description?: string;
}

export class EffectRegistry {
  private readonly byAction = new Map<string, EffectRuntimeEntry[]>();

  constructor(private readonly impls: EffectImplRegistry) {}

  applyDefinition(def: EffectDefDto): void {
    const run = this.impls.getOrThrow(def.implKey);
    const entry: EffectRuntimeEntry = {
      id: def.id,
      forAction: def.forAction,
      run,
      config: def.config,
      description: def.description,
    };
    const list = this.byAction.get(def.forAction) ?? [];
    list.push(entry);
    this.byAction.set(def.forAction, list);
  }

  getForAction(action: string): EffectRuntimeEntry[] {
    return this.byAction.get(action) ?? [];
  }

  async runForAction(
    action: Action<any>,
    dispatch: (a: Action<any>) => void,
    getState?: () => any,
  ): Promise<void> {
    const list = this.getForAction(action.action);
    for (const entry of list) {
      await entry.run(action, dispatch, { config: entry.config, getState });
    }
  }
}
  
