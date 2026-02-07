    import type { Action } from '../../actions/action';

    export type ReducerResult<S = any> = S | { state: S; followUps?: Action<any>[] };

    export type ReducerImpl<S = any, P = any> =
      (state: S, action: Action<P>, config?: Record<string, unknown>) => ReducerResult<S>;

    export class HandlerImplRegistry<S = any> {
      private readonly impls = new Map<string, ReducerImpl<S, any>>();

      register(key: string, impl: ReducerImpl<S, any>): void {
        this.impls.set(key, impl);
      }

      get(key: string): ReducerImpl<S, any> | undefined {
        return this.impls.get(key);
      }

      getOrThrow(key: string): ReducerImpl<S, any> {
        const impl = this.impls.get(key);
        if (!impl) {
          throw new Error(`Missing handler impl: ${key}`);
        }
        return impl;
      }
    }
  
