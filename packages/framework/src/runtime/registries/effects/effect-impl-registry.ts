import type { Action } from '../../actions/action';

export type EffectRuntime<S = any> = {
  config?: Record<string, unknown>;
  getState?: () => S;
};

export type EffectImpl<P = any, S = any> =
  (action: Action<P>, dispatch: (a: Action<any>) => void, runtime?: EffectRuntime<S>) =>
    void | Promise<void>;

export class EffectImplRegistry {
  private readonly impls = new Map<string, EffectImpl<any>>();

  register(key: string, impl: EffectImpl<any>): void {
    this.impls.set(key, impl);
  }

  getOrThrow(key: string): EffectImpl<any> {
    const impl = this.impls.get(key);
    if (!impl) {
      throw new Error(`Missing effect impl: ${key}`);
    }
    return impl;
  }
}
  
