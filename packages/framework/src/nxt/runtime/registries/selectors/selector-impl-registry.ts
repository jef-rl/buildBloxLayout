    export type SelectorImpl<S = any, R = any> = (state: S) => R;

    export class SelectorImplRegistry<S = any> {
      private readonly impls = new Map<string, SelectorImpl<S, any>>();

      register(key: string, impl: SelectorImpl<S, any>): void {
        this.impls.set(key, impl);
      }

      getOrThrow(key: string): SelectorImpl<S, any> {
        const impl = this.impls.get(key);
        if (!impl) {
          throw new Error(`Missing selector impl: ${key}`);
        }
        return impl;
      }
    }
  