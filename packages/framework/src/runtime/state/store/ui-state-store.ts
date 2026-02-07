    export type Subscriber<S> = (state: S) => void;

    export class UiStateStore<S> {
      private state: S;
      private readonly subscribers = new Set<Subscriber<S>>();

      constructor(initial: S) {
        this.state = initial;
      }

      getState(): S {
        return this.state;
      }

      setState(next: S): void {
        this.state = next;
        for (const sub of this.subscribers) sub(this.state);
      }

      subscribe(fn: Subscriber<S>): () => void {
        this.subscribers.add(fn);
        fn(this.state);
        return () => this.subscribers.delete(fn);
      }
    }
  