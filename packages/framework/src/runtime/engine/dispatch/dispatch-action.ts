import type { Action } from '../../actions/action';
import type { CoreRegistries } from '../../registries/core-registries';
import type { ReducerResult } from '../../registries/handlers/handler-impl-registry';
import type { UIState } from '../../../types/state';
import { logAction, summarizeState } from '../logging/framework-logger';

export interface DispatchEnv<S extends UIState> {
  registries: CoreRegistries<S>;
  getState(): S;
  setState(next: S): void;
}

export function dispatchAction<S extends UIState>(env: DispatchEnv<S>, action: Action<any>): void {
  const { registries, getState, setState } = env;
  const handlers = registries.handlers.getForAction(action.action);
  const prevState = getState();
  let state = prevState;
  let followUps: Action<any>[] = [];
  if (handlers.length) {
    const prevStateSummary = summarizeState(prevState);
    for (const entry of handlers) {
      const result = entry.reduce(state, action, entry.config);
      if (typeof result === 'object' && result !== null && 'state' in result) {
        const reduced = result as Exclude<ReducerResult<S>, S>;
        state = reduced.state;
        if (Array.isArray(reduced.followUps)) {
          followUps = followUps.concat(reduced.followUps);
        }
      } else {
        state = result as S;
      }
    }
    setState(state);
    // Logging reflects reducer execution; effect-only actions skip logging.
    logAction(action, prevStateSummary, summarizeState(state));
  }

  void registries.effects.runForAction(action, (a) => dispatchAction(env, a), getState);
  if (followUps.length) {
    followUps.forEach((followUp) => dispatchAction(env, followUp));
  }
}
