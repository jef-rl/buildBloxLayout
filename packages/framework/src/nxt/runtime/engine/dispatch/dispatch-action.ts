import type { Action } from '../../actions/action';
import type { CoreRegistries } from '../../registries/core-registries';
import { logAction, summarizeState } from '../logging/framework-logger';

export interface DispatchEnv<S> {
  registries: CoreRegistries<S>;
  getState(): S;
  setState(next: S): void;
}

export function dispatchAction<S>(env: DispatchEnv<S>, action: Action<any>): void {
  const { registries, getState, setState } = env;
  const handlers = registries.handlers.getForAction(action.action);
  if (!handlers.length) return;

  const prevState = getState();
  const prevStateSummary = summarizeState(prevState);
  let state = prevState;
  for (const entry of handlers) {
    state = entry.reduce(state, action, entry.config);
  }
  setState(state);

  void registries.effects.runForAction(action, (a) => dispatchAction(env, a), getState);
  logAction(action, prevStateSummary, summarizeState(state));
}
  
