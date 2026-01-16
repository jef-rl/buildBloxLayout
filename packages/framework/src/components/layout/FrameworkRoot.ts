import { LitElement, css, html } from 'lit';
import { coreHandlers, createHandlerRegistry, type HandlerAction } from '../../handlers/handler-registry';
import type { UIState } from '../../types/ui-state';
import { uiState } from '../../state/ui-state';
import { getFrameworkLogger } from '../../utils/logger';
import './WorkspaceRoot';

type StateActionPayload = {
  state?: UIState;
  patch?: Partial<UIState>;
  value?: UIState | Partial<UIState>;
  changes?: Partial<UIState>;
  followUps?: HandlerAction[];
};

type UiEventDetail = {
  type: string;
  payload?: StateActionPayload & Record<string, unknown>;
};

const toFollowUps = (payload?: StateActionPayload) => {
  if (!Array.isArray(payload?.followUps)) {
    return [] as HandlerAction[];
  }
  return payload.followUps.filter((action): action is HandlerAction => Boolean(action?.type));
};

const summarizeState = (state: UIState | Partial<UIState> | null) => {
  if (!state || typeof state !== 'object') {
    return { valueType: typeof state };
  }
  return { keys: Object.keys(state) };
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

export const frameworkHandlers = createHandlerRegistry<UIState>(coreHandlers);

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

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('ui-event', this.handleUiEvent as EventListener);
  }

  disconnectedCallback() {
    this.removeEventListener('ui-event', this.handleUiEvent as EventListener);
    super.disconnectedCallback();
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

      if (action.type === 'state/replace' || action.type === 'state/patch') {
        const payload = action.payload as StateActionPayload | undefined;
        const previousState = uiState.getState();
        const followUps = toFollowUps(payload);
        let nextState = previousState;

        if (action.type === 'state/replace') {
          const nextValue = (payload?.state ?? payload?.value ?? payload?.changes) as UIState | undefined;
          if (nextValue) {
            uiState.update(nextValue);
            nextState = nextValue;
          }
        } else {
          const patch = (payload?.patch ?? payload?.changes ?? payload?.value ?? {}) as Partial<UIState>;
          nextState = uiState.hydrate(patch);
        }

        logger?.info?.('FrameworkRoot state action.', {
          actionType: action.type,
          summary: summarizeState(
            action.type === 'state/replace' ? nextState : payload?.patch ?? payload?.changes ?? payload?.value ?? null,
          ),
          update: summarizeUpdate(previousState, nextState),
        });

        if (followUps.length > 0) {
          queue.push(...followUps);
        }

        continue;
      }

      const handler = frameworkHandlers.get(action.type);
      const previousState = uiState.getState();
      const { state: nextState, followUps } = frameworkHandlers.handle(previousState, action);

      logger?.info?.('FrameworkRoot handler output.', {
        actionType: action.type,
        handled: Boolean(handler),
        followUps: followUps.map((item) => item.type),
      });

      if (handler && nextState !== previousState) {
        uiState.update(nextState);
        logger?.info?.('FrameworkRoot state update.', {
          actionType: action.type,
          summary: summarizeUpdate(previousState, nextState),
        });
      }

      if (followUps.length > 0) {
        queue.push(...followUps);
      }
    }

    logger?.info?.('FrameworkRoot dispatch end.');
  }

  render() {
    return html`<workspace-root></workspace-root>`;
  }
}

customElements.define('framework-root', FrameworkRoot);
