import type { Action } from '../actions/action';
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

      getState(): S {
        return this.store.getState();
      }

      dispatch(action: Action<any>): void {
        const env = {
          registries: this.registries,
          getState: () => this.store.getState(),
          setState: (next: S) => {
            validateState(next);
            this.store.setState(next);
          },
        };
        dispatchAction(env, action);
      }
    }
  
