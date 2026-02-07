import type { Action, ActionName } from '../actions/action';
import { dispatchAction } from '../engine/dispatch/dispatch-action';
import { CoreRegistries } from '../registries/core-registries';
import type { FrameworkState } from '../state/framework-state';
import { UiStateStore } from '../state/store/ui-state-store';
import { validateState } from '../state/validation/validate-state';

export class CoreContext<S extends FrameworkState> {
      readonly registries: CoreRegistries<S>;
      readonly store: UiStateStore<S>;

      constructor(initialState: S) {
        this.registries = new CoreRegistries<S>();
        this.store = new UiStateStore<S>(initialState);
      }

      get state(): S {
        return this.getState();
      }

      getState(): S {
        return this.store.getState();
      }

      select<R>(key: string): R {
        const selector = this.registries.selectorImpls.getOrThrow(key);
        return selector(this.getState()) as R;
      }

      dispatch(action: Action<any> | { type: ActionName; payload?: Record<string, unknown> }): void {
        const resolvedAction: Action =
          'action' in action
            ? action
            : {
                action: action.type,
                payload: action.payload ?? {},
              };
        const env = {
          registries: this.registries,
          getState: () => this.store.getState(),
          setState: (next: S) => {
            validateState(next);
            this.store.setState(next);
          },
        };
        dispatchAction(env, resolvedAction);
      }
    }
  
