    import type { ActionName } from './action-catalog';

    export type { ActionName } from './action-catalog';

    export interface Action<P = any> {
      action: ActionName;
      payload?: P;
      meta?: Record<string, unknown>;
    }
  
