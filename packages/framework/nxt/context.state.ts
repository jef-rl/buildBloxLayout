import { createContext } from '@lit/context';
import { type UiStateContextValue } from './ui-state';

export const uiStateContext = createContext<UiStateContextValue>(
    Symbol('ui-state-context')
);
