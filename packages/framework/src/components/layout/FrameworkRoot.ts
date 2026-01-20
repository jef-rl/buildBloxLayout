import { LitElement, css, html } from 'lit';
import { ContextProvider } from '@lit/context';
import { coreHandlers, createHandlerRegistry, type HandlerAction } from '../../handlers/handler-registry';
import type { UIState } from '../../types/ui-state';
import { uiState, type UiStateContextState } from '../../state/ui-state';
import { uiStateContext } from '../../state/context';
import { getFrameworkLogger } from '../../utils/logger';
import { applyLayoutAction } from '../../handlers/workspace/layout';
import { viewRegistry } from '../../registry/ViewRegistry';
import { applyMainViewOrder, deriveMainViewOrderFromPanels } from '../../handlers/workspace/panels';
import { validateState } from '../../utils/state-validator';
import './WorkspaceRoot';

const isDev = import.meta.env.DEV;

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

type UiDispatchPayload = {
  type: string;
  [key: string]: unknown;
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

  private state = uiState.getState();

  private panelState = {
    open: {} as Record<string, boolean>,
    data: {} as Record<string, unknown>,
    errors: {} as Record<string, unknown>,
  };

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
    const snapshot = this.state ?? uiState.getState();
    const panels = (Array.isArray(snapshot.panels) ? [...snapshot.panels] : []) as UiStateContextState['panels'];

    panels.open = this.panelState.open;
    panels.data = this.panelState.data;
    panels.errors = this.panelState.errors;

    return {
      ...snapshot,
      panels,
    };
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

  private normalizeLayoutState(state: UIState) {
    const layout = typeof state.layout === 'object' && state.layout ? state.layout : ({} as UIState['layout']);
    return {
      ...state,
      layout: {
        ...layout,
        expansion: layout.expansion ?? { left: false, right: false, bottom: false },
        overlayView: layout.overlayView ?? null,
        viewportWidthMode: layout.viewportWidthMode ?? 'auto',
        mainAreaCount: layout.mainAreaCount ?? 1,
        mainViewOrder: Array.isArray(layout.mainViewOrder) ? layout.mainViewOrder : [],
      },
    };
  }

  private normalizeAuthState(state: UIState) {
    const auth = typeof state.auth === 'object' && state.auth ? state.auth : ({} as UIState['auth']);
    return {
      ...state,
      auth: {
        ...auth,
        isLoggedIn: auth.isLoggedIn ?? false,
        user: auth.user ?? null,
      },
    };
  }

  private handleWorkspaceAction(action: HandlerAction, previousState: UIState) {
    const payload = (action.payload ?? {}) as UiDispatchPayload;
    const followUps = toFollowUps(payload as StateActionPayload);
    let nextState = previousState;
    let handled = true;
    let panelStateChanged = false;

    switch (action.type) {
      case 'layout/setExpansion':
      case 'layout/setOverlayView': {
        const normalizedState = this.normalizeLayoutState(previousState);
        const draftState = {
          ...normalizedState,
          layout: { ...normalizedState.layout },
        };
        handled = applyLayoutAction(draftState, { ...payload, type: action.type });
        if(handled) nextState = draftState;
        break;
      }
      case 'layout/setViewportWidthMode': {
        const normalizedState = this.normalizeLayoutState(previousState);
        const draftState = { ...normalizedState };
        handled = applyLayoutAction(draftState, { ...payload, type: action.type });
        if(handled) nextState = draftState;
        break;
      }
      case 'layout/setMainAreaCount': {
        const normalizedState = this.normalizeLayoutState(previousState);
        const draftState = { ...normalizedState };
        handled = applyLayoutAction(draftState, { ...payload, type: action.type });
        if (handled) {
          const fallbackOrder = draftState.layout.mainViewOrder?.length
            ? draftState.layout.mainViewOrder
            : deriveMainViewOrderFromPanels(draftState.panels);
          nextState = applyMainViewOrder(draftState, fallbackOrder);
        }
        break;
      }
      case 'panels/selectPanel':
        if (payload.panelId) {
          this.panelState.data = {
            ...this.panelState.data,
            targetPanelId: payload.panelId,
          };
          panelStateChanged = true;
        }
        break;
      case 'panels/assignView': {
        const viewId = payload.viewId as string | undefined;
        const targetPanelId = payload.panelId ?? (this.panelState.data?.targetPanelId as string | undefined);
        const panels = previousState.panels ?? [];
        const fallbackPanel = panels.find((panel) => panel.region === 'main') ?? panels[0];
        const panelId = targetPanelId ?? fallbackPanel?.id;
        const panel = panels.find((item) => item.id === panelId);
        if (panel && viewId) {
          const view = viewRegistry.createView(viewId);
          if (view) {
            const nextPanels = panels.map((item) =>
              item.id === panel.id
                ? {
                    ...item,
                    view,
                    viewId,
                    activeViewId: viewId,
                  }
                : item,
            );
            const nextViews = previousState.views
              .filter((existing) => existing.id !== view.id)
              .concat(view);
            nextState = {
              ...previousState,
              panels: nextPanels,
              views: nextViews,
              activeView: view.id,
              layout: {
                ...previousState.layout,
                mainViewOrder: deriveMainViewOrderFromPanels(nextPanels),
              },
            };
          }
        }
        break;
      }
      case 'panels/setMainViewOrder': {
        const viewOrder = Array.isArray(payload.viewOrder) ? payload.viewOrder : [];
        nextState = applyMainViewOrder(previousState, viewOrder);
        break;
      }
      case 'panels/togglePanel':
        if (payload.panelId || payload.viewId) {
          const panelId = (payload.panelId ?? payload.viewId) as string;
          const nextOpen = !this.panelState.open[panelId];
          this.panelState.open = {
            ...this.panelState.open,
            [panelId]: nextOpen,
          };
          panelStateChanged = true;
        }
        break;
      case 'panels/setScopeMode':
        this.panelState.data = {
          ...this.panelState.data,
          scope: { ...(this.panelState.data?.scope ?? {}), mode: payload.mode },
        };
        panelStateChanged = true;
        break;
      case 'session/reset':
        this.panelState.errors = {};
        this.panelState.data = {};
        panelStateChanged = true;
        break;
      case 'auth/setUser': {
        const normalizedState = this.normalizeAuthState(previousState);
        const nextUser = payload.user as { uid: string; email?: string } | null | undefined;
        nextState = {
          ...normalizedState,
          auth: {
            ...normalizedState.auth,
            user: nextUser ?? null,
            isLoggedIn: Boolean(nextUser),
          },
        };
        break;
      }
      default:
        handled = false;
        break;
    }

    return { handled, nextState, followUps, panelStateChanged };
  }

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
      let nextState = previousState;
      let actionFollowUps: HandlerAction[] = [];
      
      const workspaceResult = this.handleWorkspaceAction(action, previousState);
      if (workspaceResult.handled) {
          nextState = workspaceResult.nextState;
          actionFollowUps = workspaceResult.followUps;

          if (workspaceResult.panelStateChanged) {
              this.refreshContext();
          }
      } else {
          const handler = frameworkHandlers.get(action.type);
          if (handler) {
              const result = frameworkHandlers.handle(previousState, action);
              nextState = result.state;
              actionFollowUps = result.followUps;
          }
      }

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
