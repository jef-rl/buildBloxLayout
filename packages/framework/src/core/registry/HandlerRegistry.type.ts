import { HandlerAction } from './HandlerAction.type';
import { HandlerResult } from './HandlerResult.type';
import { ReducerHandler } from './ReducerHandler.type';


export type HandlerRegistry<TState> = {
  register: (type: string, handler: ReducerHandler<TState>) => void;
  get: (type: string) => ReducerHandler<TState> | undefined;
  handle: (state: TState, action: HandlerAction) => HandlerResult<TState>;
  list: () => string[];
};
