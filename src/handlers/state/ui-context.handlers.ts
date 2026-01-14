import type { LitElement } from 'lit';
import { ContextConsumer } from '@lit/context';
import type { UiAction, UiDispatch, UiState, UiStateContextValue } from '../../core/state/ui-state.js';
import type { HandlerMessage } from '../../core/types/index.js';
import { UiProvider } from '../../core/state/ui-state.js';
import { uiStateContext } from '../../core/state/contexts.ts';

export interface UiContextHandlerOptions {
  onStateChange?: (next: UiState) => void;
}

export interface UiContextHandlers {
  getState: () => UiState;
  dispatch: UiDispatch;
  applyAction: UiDispatch;
  dispatchMessage: (message: HandlerMessage) => void;
  registerInterceptor: (handler: (action: UiAction) => boolean) => void;
  attachConsumer: (target: LitElement, onChange?: (value: UiStateContextValue) => void) => ContextConsumer<UiStateContextValue>;
  provider: UiProvider;
}

export function createUiContextHandlers(host: LitElement, initialState: UiState, options: UiContextHandlerOptions = {}): UiContextHandlers {
  const provider = new UiProvider(host, initialState);
  let currentState = provider.state;
  const interceptors: Array<(action: UiAction) => boolean> = [];

  const notifyChange = () => {
    options.onStateChange?.(currentState);
  };

  const applyAction: UiDispatch = (action) => {
    provider.reduce(action);
    currentState = provider.state;
    notifyChange();
  };

  const dispatch: UiDispatch = (action) => {
    for (const handler of interceptors) {
      if (handler(action)) return;
    }
    applyAction(action);
  };

  const dispatchMessage = (message: HandlerMessage) => {
    const payload = message?.payload;
    if (payload && typeof payload === 'object') {
      dispatch({ type: message.type, ...(payload as Record<string, unknown>) } as UiAction);
      return;
    }
    dispatch({ type: message.type } as UiAction);
  };

  provider.setDispatch(dispatch);

  const getState = () => currentState;

  const registerInterceptor = (handler: (action: UiAction) => boolean) => {
    interceptors.push(handler);
  };

  const attachConsumer = (target: LitElement, onChange?: (value: UiStateContextValue) => void) => new ContextConsumer(target, {
    context: uiStateContext,
    subscribe: true,
    callback: (value: UiStateContextValue | undefined) => {
      if (value?.state) currentState = value.state;
      if (value?.dispatch) provider.setDispatch(value.dispatch);
      onChange?.(value ?? { state: currentState, dispatch });
      target.requestUpdate();
    },
  });

  return {
    getState,
    dispatch,
    applyAction,
    dispatchMessage,
    registerInterceptor,
    attachConsumer,
    provider,
  };
}
