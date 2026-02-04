    export type ActionName = string;

    export interface Action<P = any> {
      action: ActionName;
      payload?: P;
      meta?: Record<string, unknown>;
    }
  