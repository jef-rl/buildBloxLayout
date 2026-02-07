    import { createContext } from '@lit/context';
    import type { CoreContext } from './core-context';

    export const coreContext = createContext<CoreContext<any>>('nxt-core-context');
  