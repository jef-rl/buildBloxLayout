    export interface ViewImpl {
      tagName: string;
      preload?: () => Promise<void>;
    }

    export class ViewImplRegistry {
      private readonly impls = new Map<string, ViewImpl>();

      register(key: string, impl: ViewImpl): void {
        this.impls.set(key, impl);
      }

      getOrThrow(key: string): ViewImpl {
        const impl = this.impls.get(key);
        if (!impl) {
          throw new Error(`Missing view impl: ${key}`);
        }
        return impl;
      }
    }
  