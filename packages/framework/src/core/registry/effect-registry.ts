import type { HandlerAction } from './HandlerAction.type';
import type { EffectImpl } from '../../nxt/runtime/registries/effects/effect-impl-registry';
import { EffectImplRegistry } from '../../nxt/runtime/registries/effects/effect-impl-registry';
import { EffectRegistry as NxtEffectRegistry } from '../../nxt/runtime/registries/effects/effect-registry';
import {
  applyFrameworkEffectDefs,
  frameworkEffectDefs,
  registerFrameworkEffectImpls,
} from '../../nxt/effects/register-framework-effects';

/** @deprecated Use CoreContext + NXT registries instead. */
export type EffectHandler<TState> = (
  context: TState,
  action: HandlerAction,
  dispatch: (actions: HandlerAction[]) => void,
) => void;

/** @deprecated Use CoreContext + NXT registries instead. */
export type EffectRegistry<TState> = {
  register: (type: string, handler: EffectHandler<TState>) => void;
  get: (type: string) => EffectHandler<TState> | undefined;
  list: () => string[];
};

/** @deprecated Use CoreContext + NXT registries instead. */
export const createEffectRegistry = <TState>(): EffectRegistry<TState> => {
  const impls = new EffectImplRegistry();
  const registry = new NxtEffectRegistry(impls);
  const actionKeys = new Set<string>();

  registerFrameworkEffectImpls(impls);
  applyFrameworkEffectDefs(registry);
  frameworkEffectDefs.forEach((def) => actionKeys.add(def.forAction));

  return {
    register: (type, handler) => {
      const implKey = `legacy:${type}`;
      const legacyImpl: EffectImpl<any, TState> = (action, dispatch, runtime) => {
        const context = runtime?.getState?.() as TState;
        const legacyAction = { type: action.action, payload: action.payload } as HandlerAction;
        handler(context, legacyAction, (actions) => {
          actions.forEach((followUp) => {
            dispatch({ action: followUp.type, payload: followUp.payload });
          });
        });
      };
      impls.register(implKey, legacyImpl);
      registry.applyDefinition({ id: implKey, forAction: type, implKey });
      actionKeys.add(type);
    },
    get: (type) => {
      if (!registry.getForAction(type).length) {
        return undefined;
      }
      return (context, action, dispatch) => {
        void registry.runForAction(
          { action: action.type, payload: action.payload },
          (nextAction) => dispatch([{ type: nextAction.action, payload: nextAction.payload }]),
          () => context,
        );
      };
    },
    list: () => Array.from(actionKeys),
  };
};
