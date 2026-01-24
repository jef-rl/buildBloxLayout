import { LitElement, css, html } from 'lit';
import { ContextProvider } from '@lit/context';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
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
import { hybridPersistence } from '../utils/hybrid-persistence';
import { setFirestoreSyncCallback } from '../utils/persistence';
import { firestorePersistence } from '../utils/firestore-persistence';
import { configureFrameworkAuth, onFrameworkAuthStateChange } from '../utils/firebase-auth';
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
  private firestoreUnsubscribe: (() => void) | null = null;
  private firestore: Firestore | null = null;

  // Auth configuration from bootstrap
  authConfig: {
    enabled: boolean;
    authViewId?: string;
    autoShowOnStartup?: boolean;
    requireAuthForActions?: string[];
  } | null = null;

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

    // Set auth configuration in state if provided
    if (this.authConfig) {
      uiState.hydrate({
        authConfig: this.authConfig,
      });
    }

    // Hydrate presets from localStorage on startup
    this.dispatchActions([{ type: 'presets/hydrate', payload: {} }]);

    // Set up Firestore sync callback
    setFirestoreSyncCallback((presets) => {
      if (hybridPersistence.isConfigured()) {
        firestorePersistence.saveAll(presets).catch((error) => {
          console.warn('Firestore sync failed:', error);
        });
      }
    });
  }

  configureFirestore(firestore: Firestore): void {
    console.log('[FrameworkRoot] configureFirestore called');
    this.firestore = firestore;
    const userId = this.state.auth?.user?.uid ?? null;
    console.log('[FrameworkRoot] Configuring hybrid persistence with userId:', userId);
    hybridPersistence.configure({ firestore, userId });
    console.log('[FrameworkRoot] Hybrid persistence configured, initializing...');
    this.initializeFirestorePersistence();
  }

  configureFirebaseAuth(auth: Auth): void {
    // Configure auth utilities
    configureFrameworkAuth(auth);

    let initialAuthCheckDone = false;

    // Listen for auth state changes from Firebase
    onFrameworkAuthStateChange((user) => {
      this.dispatchActions([
        {
          type: 'auth/setUser',
          payload: { user }
        },
        // Refresh menu to show/hide auth items based on login state
        {
          type: 'frameworkMenu/hydrate',
          payload: {}
        }
      ]);

      // Update Firestore persistence with new userId
      if (this.firestore) {
        const userId = user?.uid ?? null;
        hybridPersistence.setUserId(userId);
      }

      // Check auto-show on initial auth state (only once)
      if (!initialAuthCheckDone) {
        initialAuthCheckDone = true;

        const logger = getFrameworkLogger();
        logger?.info?.('Initial auth state check', {
          hasUser: !!user,
          authEnabled: this.authConfig?.enabled,
          autoShowOnStartup: this.authConfig?.autoShowOnStartup,
        });

        if (!user && this.authConfig?.enabled && this.authConfig?.autoShowOnStartup) {
          const authViewId = this.authConfig.authViewId ?? 'firebase-auth';
          logger?.info?.('Auto-showing auth overlay', { authViewId });

          // Small delay to ensure views are registered and state is ready
          setTimeout(() => {
            this.dispatchActions([{
              type: 'layout/setOverlayView',
              payload: { viewId: authViewId }
            }]);
          }, 200);
        }
      }
    });
  }

  private async initializeFirestorePersistence(): Promise<void> {
    if (!hybridPersistence.isConfigured()) {
      console.log('[FrameworkRoot] Hybrid persistence not configured, skipping initialization');
      return;
    }

    try {
      console.log('[FrameworkRoot] Starting Firestore persistence initialization...');
      // Load presets from Firestore and merge with localStorage
      const firestorePresets = await hybridPersistence.syncFromFirestore();
      const firestorePresetCount = firestorePresets ? Object.keys(firestorePresets).length : 0;
      console.log('[FrameworkRoot] Firestore presets loaded:', {
        count: firestorePresetCount,
        presets: firestorePresets ? Object.keys(firestorePresets) : [],
      });
      if (!firestorePresets) {
        console.log('[FrameworkRoot] No presets returned from Firestore (count 0)');
      }

      if (firestorePresets && Object.keys(firestorePresets).length > 0) {
        console.log('[FrameworkRoot] Dispatching presets/hydrate action with Firestore presets');
        this.dispatchActions([{
          type: 'presets/hydrate',
          payload: { presets: firestorePresets },
        }]);
      }

      // Set up real-time listener for cross-device sync
      console.log('[FrameworkRoot] Setting up real-time Firestore listener');
      this.firestoreUnsubscribe = hybridPersistence.onPresetsChanged((presets) => {
        console.log('[FrameworkRoot] Firestore preset change detected:', Object.keys(presets));
        this.dispatchActions([{
          type: 'presets/hydrate',
          payload: { presets },
        }]);
      });
      console.log('[FrameworkRoot] Firestore persistence initialization complete');
    } catch (error) {
      console.error('[FrameworkRoot] Firestore persistence initialization failed:', error);
    }
  }

  setAuthUser(userId: string | null): void {
    hybridPersistence.setUserId(userId);
    if (hybridPersistence.isConfigured()) {
      this.initializeFirestorePersistence();
    }
  }

  disconnectedCallback() {
    this.removeEventListener('ui-event', this.handleUiEvent as EventListener);
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.firestoreUnsubscribe) {
      this.firestoreUnsubscribe();
      this.firestoreUnsubscribe = null;
    }
    setFirestoreSyncCallback(null);
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
