import { HandlerAction } from './HandlerAction.type';
import { HandlerResult } from './HandlerResult.type';


export type ReducerHandler<TState> = (
  state: TState,
  action: HandlerAction
) => HandlerResult<TState>;
