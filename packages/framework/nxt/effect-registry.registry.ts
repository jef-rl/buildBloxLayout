import { HandlerAction } from "./handler-registry.registry";

export type EffectHandler<TState> = (
  context: TState,
  action: HandlerAction,
  dispatch: (actions: HandlerAction[]) => void,
) => void;

export type EffectRegistry<TState> = {
  register: (type: string, handler: EffectHandler<TState>) => void;
  get: (type: string) => EffectHandler<TState> | undefined;
  list: () => string[];
};

export const createEffectRegistry = <TState>(): EffectRegistry<TState> => {
  const handlers = new Map<string, EffectHandler<TState>>();

  return {
    register: (type, handler) => {
      handlers.set(type, handler);
    },
    get: (type) => handlers.get(type),
    list: () => Array.from(handlers.keys()),
  };
};
