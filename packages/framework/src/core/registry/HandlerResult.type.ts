import { HandlerAction } from './HandlerAction.type';


export type HandlerResult<TState> = {
  state: TState;
  followUps: HandlerAction[];
};
