import { LitElement, css, html } from 'lit';
import { ContextProvider } from '@lit/context';
import {
  coreHandlers,
  createHandlerRegistry,
  type HandlerAction,
  type ReducerHandler,
} from '../core/registry/handler-registry';
import type { UIState } from '../types/state';
import { uiState, type UiStateContextState } from '../state/ui-state';
import { uiStateContext } from '../state/context';
import { getFrameworkLogger } from '../utils/logger';
import { validateState } from '../state/state-validator';
import {
  registerWorkspaceHandlers,
  type FrameworkContextState,
} from '../domains/workspace/handlers/registry';
import '../domains/workspace/components/WorkspaceRoot';

const isDev = import.meta.env.DEV;

type UiEventDetail = {
  type: string;
  payload?: Record<string, unknown>;
};

type UiDispatchPayload = {
  type: string;
  [key: string]: unknown;
};

const summarizeUpdate = (previousState: UIState, nextState: UIState) => {
  const previousKeys = Object.keys(previousState);
  const nextKeys = Object.keys(nextState);
  const changedKeys = nextKeys.filter((key) => previousState[key as keyof UIState] !== nextState[key as keyof UIState]);
  return {
    previousKeys,
    nextKeys,
    changedKeys,
  };
};

const wrapCoreHandler = (
  handler: ReducerHandler<UIState>,
): ReducerHandler<FrameworkContextState> => {
  return (context, action) => {
    const result = handler(context.state, action);
    return {
      state: {
        ...context,
        state: result.state,
      },
      followUps: result.followUps,
    };
  };
};

export const frameworkHandlers = createHandlerRegistry<FrameworkContextState>();
Object.entries(coreHandlers).forEach(([type, handler]) => {
  frameworkHandlers.register(type, wrapCoreHandler(handler));
});
registerWorkspaceHandlers(frameworkHandlers);

export class FrameworkRoot extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      display: block;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }

    workspace-root {
      display: block;
      width: 100%;
      height: 100%;
    }
  `;

  private state = uiState.getState();

  private unsubscribe: (() => void) | null = null;

  private dispatchUiAction = (payload: UiDispatchPayload) => {
    if (!payload?.type) {
      return;
    }

    this.dispatchActions([{ type: payload.type, payload }]);
  };

  private provider = new ContextProvider(this, {
    context: uiStateContext,
    initialValue: {
      state: this.getContextState(),
      dispatch: this.dispatchUiAction,
    },
  });

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('ui-event', this.handleUiEvent as EventListener);
    this.unsubscribe = uiState.subscribe((nextState) => {
      if (isDev) {
        try {
          validateState(nextState);
        } catch (error) {
          console.error("State validation failed after subscription update:", error);
          return; 
        }
      }
      this.state = nextState;
      this.refreshContext();
    });
    this.refreshContext();
  }

  disconnectedCallback() {
    this.removeEventListener('ui-event', this.handleUiEvent as EventListener);
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    super.disconnectedCallback();
  }

  private getContextState(): UiStateContextState {
    return this.state ?? uiState.getState();
  }

  private refreshContext() {
    this.provider.setValue({
      state: this.getContextState(),
      dispatch: this.dispatchUiAction,
    });
    this.requestUpdate();
  }

  private handleUiEvent = (event: Event) => {
    const detail = (event as CustomEvent<UiEventDetail>).detail;
    if (!detail?.type) {
      return;
    }

    const action: HandlerAction = {
      type: detail.type,
      payload: detail.payload,
    };

    this.dispatchActions([action]);
  };

  private dispatchActions(actions: HandlerAction[]) {
    const logger = getFrameworkLogger();
    const queue = [...actions];

    logger?.info?.('FrameworkRoot dispatch start.', {
      actionCount: queue.length,
      actionTypes: queue.map((action) => action.type),
    });

    while (queue.length > 0) {
      const action = queue.shift();
      if (!action) {
        continue;
      }

      const previousState = uiState.getState();
      const context: FrameworkContextState = {
        state: previousState,
      };
      const result = frameworkHandlers.handle(context, action);
      const nextContext = result.state;
      const nextState = nextContext.state;
      const actionFollowUps = result.followUps;

      if (nextState !== previousState) {
        if (isDev) {
            try {
                validateState(nextState);
            } catch (error) {
                console.error(`State validation failed after action: ${action.type}`, error);
                continue; // Skip state update if validation fails
            }
        }
        uiState.update(nextState);
        logger?.info?.('FrameworkRoot state update.', {
            actionType: action.type,
            summary: summarizeUpdate(previousState, nextState),
        });
      }

      if (actionFollowUps.length > 0) {
        queue.push(...actionFollowUps);
      }
    }

    logger?.info?.('FrameworkRoot dispatch end.');
  }

  render() {
    return html`<workspace-root></workspace-root>`;
  }
}

customElements.define('framework-root', FrameworkRoot);
