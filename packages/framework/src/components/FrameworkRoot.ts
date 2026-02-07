import { LitElement, css, html } from 'lit';
import { ContextProvider } from '@lit/context';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import { type HandlerAction } from '../core/registry/HandlerAction.type';
import type { UIState } from '../types/state';
import { uiState, type UiStateContextState } from '../state/ui-state';
import { uiStateContext } from '../state/context';
import { coreContext } from '../../nxt/runtime/context/core-context-key';
import type { CoreContext } from '../../nxt/runtime/context/core-context';
import type { Action } from '../../nxt/runtime/actions/action';
import { ActionCatalog } from '../../nxt/runtime/actions/action-catalog';
import { CoreRegistries } from '../../nxt/runtime/registries/core-registries';
import { UiStateStore } from '../../nxt/runtime/state/store/ui-state-store';
import { logError, logInfo, logWarn } from '../../nxt/runtime/engine/logging/framework-logger';
import { validateState } from '../state/state-validator';
import {
  registerWorkspaceHandlers,
  type FrameworkContextState,
} from '../domains/workspace/handlers/registry';
import { hybridPersistence } from '../utils/hybrid-persistence';
import { setFirestoreSyncCallback } from '../utils/persistence';
import { firestorePersistence } from '../utils/firestore-persistence';
import { configureFrameworkAuth, onFrameworkAuthStateChange } from '../utils/firebase-auth';
import { viewRegistry } from '../../nxt/runtime/registries/views/view-registry-legacy-api';
import '../domains/workspace/components/WorkspaceRoot';
import { shouldLogAction } from './shouldLogAction.helper';
import { createLogAction } from './createLogAction.helper';
import { summarizeUpdate } from './summarizeUpdate.helper';

const isDev = import.meta.env.DEV;
type UiDispatchPayload = {
  type: string;
  payload?: Record<string, unknown>;
};
type UiEventDetail = {
  type: string;
  payload?: Record<string, unknown>;
};

const toCoreAction = (action: HandlerAction): Action => ({
  action: action.type,
  payload: action.payload ?? {},
});

const toHandlerAction = (action: Action): HandlerAction => ({
  type: action.action,
  payload: action.payload as Record<string, unknown> | undefined,
});

const isReducerResult = (
  result: UIState | { state: UIState; followUps?: Action[] },
): result is { state: UIState; followUps?: Action[] } =>
  typeof result === 'object' && result !== null && 'state' in result;

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
  private coreStore = new UiStateStore<UIState>(uiState.getState());
  private coreRegistries = new CoreRegistries<UIState>();

  private unsubscribe: (() => void) | null = null;
  private firestoreUnsubscribe: (() => void) | null = null;
  private firestore: Firestore | null = null;
  private viewRegistryUnsubscribe: (() => void) | null = null;

  // Auth configuration from bootstrap
  authConfig: {
    enabled: boolean;
    authViewId?: string;
    autoShowOnStartup?: boolean;
    requireAuthForActions?: string[];
  } | null = null;

  constructor() {
    super();
    registerWorkspaceHandlers(this.coreRegistries);
  }

  private dispatchUiAction = (payload: UiDispatchPayload) => {
    if (!payload?.type) {
      return;
    }

    this.dispatchActions([{ type: payload.type, payload }]);
  };

  private coreAdapter: CoreContext<UIState> = {
    registries: this.coreRegistries,
    store: this.coreStore,
    getState: () => uiState.getState(),
    select: (key: string) => {
      const selector = this.coreRegistries.selectorImpls.getOrThrow(key);
      return selector(uiState.getState());
    },
    dispatch: (action: Action) => {
      if (!action?.action) {
        return;
      }
      this.dispatchActions([
        {
          type: action.action,
          payload: action.payload ?? {},
        },
      ]);
    },
  };

  private provider = new ContextProvider(this, {
    context: uiStateContext,
    initialValue: {
      state: this.getContextState(),
      dispatch: this.dispatchUiAction,
    },
  });

  private coreProvider = new ContextProvider(this, {
    context: coreContext,
    initialValue: this.coreAdapter,
  });

  private syncViewRegistryToCore(): void {
    const views = viewRegistry.getAllViews();
    views.forEach((view) => {
      this.coreRegistries.viewDefs.register({
        id: view.id,
        tagName: view.tag,
        implKey: view.id,
        name: view.name,
        title: view.title,
        icon: view.icon,
        defaultContext: view.defaultContext,
        defaultSettings: view.defaultContext,
      });
      this.coreRegistries.viewImpls.register(view.id, {
        tagName: view.tag,
        preload: view.component,
      });
    });
  }

  private hydrateViewDefinitions(): void {
    const viewDefinitions = viewRegistry.getAllViews().map((view) => ({
      id: view.id,
      name: view.name,
      title: view.title,
      icon: view.icon,
    }));
    this.dispatchActions([
      {
        type: ActionCatalog.StateHydrate,
        payload: { state: { viewDefinitions } },
      },
    ]);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('ui-event', this.handleUiEvent as EventListener);
    this.unsubscribe = uiState.subscribe((nextState) => {
      if (isDev) {
        try {
          validateState(nextState);
        } catch (error) {
          logError(error, { message: 'State validation failed after subscription update.' });
          return;
        }
      }
      this.state = nextState;
      this.coreStore.setState(nextState);
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
    this.dispatchActions([{ type: ActionCatalog.EffectsPresetsHydrate, payload: {} }]);
    this.dispatchActions([{ type: ActionCatalog.EffectsMenuHydrate, payload: {} }]);

    this.viewRegistryUnsubscribe = viewRegistry.onRegistryChange(() => {
      this.syncViewRegistryToCore();
      this.hydrateViewDefinitions();
    });
    this.syncViewRegistryToCore();
    this.hydrateViewDefinitions();

    // Set up Firestore sync callback
    setFirestoreSyncCallback((presets) => {
      if (hybridPersistence.isConfigured()) {
        firestorePersistence.saveAll(presets).catch((error) => {
          logWarn('Firestore sync failed.', { error });
        });
      }
    });
  }

  configureFirestore(firestore: Firestore): void {
    logInfo('[FrameworkRoot] configureFirestore called');
    this.firestore = firestore;
    const userId = this.state.auth?.user?.uid ?? null;
    logInfo('[FrameworkRoot] Configuring hybrid persistence with userId:', { userId });
    hybridPersistence.configure({ firestore, userId });
    logInfo('[FrameworkRoot] Hybrid persistence configured, initializing...');
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
          type: ActionCatalog.AuthSetUser,
          payload: { user }
        },
        // Refresh menu to show/hide auth items based on login state
        {
          type: ActionCatalog.EffectsMenuHydrate,
          payload: {}
        }
      ]);

      // Update Firestore persistence with new userId
      if (this.firestore) {
        const userId = user?.uid ?? null;
        hybridPersistence.setUserId(userId);
      }
      if (!initialAuthCheckDone) {
        initialAuthCheckDone = true;
        logInfo('Initial auth state check', {
          hasUser: !!user,
          authEnabled: this.authConfig?.enabled,
          autoShowOnStartup: this.authConfig?.autoShowOnStartup,
        });
      }
    });
  }

  private async initializeFirestorePersistence(): Promise<void> {
    if (!hybridPersistence.isConfigured()) {
      logInfo('[FrameworkRoot] Hybrid persistence not configured, skipping initialization');
      return;
    }

    try {
      logInfo('[FrameworkRoot] Starting Firestore persistence initialization...');
      // Load presets from Firestore and merge with localStorage
      const firestorePresets = await hybridPersistence.syncFromFirestore();
      const firestorePresetCount = firestorePresets ? Object.keys(firestorePresets).length : 0;
      logInfo('[FrameworkRoot] Firestore presets loaded:', {
        count: firestorePresetCount,
        presets: firestorePresets ? Object.keys(firestorePresets) : [],
      });
      if (!firestorePresets) {
        logInfo('[FrameworkRoot] No presets returned from Firestore (count 0)');
      }

      if (firestorePresets && Object.keys(firestorePresets).length > 0) {
        logInfo('[FrameworkRoot] Dispatching presets/hydrate action with Firestore presets');
        this.dispatchActions([{
          type: ActionCatalog.PresetsHydrate,
          payload: { presets: firestorePresets },
        }]);
      }

      // Set up real-time listener for cross-device sync
      logInfo('[FrameworkRoot] Setting up real-time Firestore listener');
      this.firestoreUnsubscribe = hybridPersistence.onPresetsChanged((presets) => {
        logInfo('[FrameworkRoot] Firestore preset change detected:', { presetCount: Object.keys(presets).length });
        this.dispatchActions([{
          type: ActionCatalog.PresetsHydrate,
          payload: { presets },
        }]);
      });
      logInfo('[FrameworkRoot] Firestore persistence initialization complete');
    } catch (error) {
      logError(error, { message: '[FrameworkRoot] Firestore persistence initialization failed.' });
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
    if (this.viewRegistryUnsubscribe) {
      this.viewRegistryUnsubscribe();
      this.viewRegistryUnsubscribe = null;
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
    const nextCoreContext: CoreContext<UIState> = {
      registries: this.coreRegistries,
      store: this.coreStore,
      getState: this.coreAdapter.getState,
      select: this.coreAdapter.select,
      dispatch: this.coreAdapter.dispatch,
    };
    this.coreProvider.setValue(nextCoreContext);
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
    const queue = [...actions];

    logInfo('FrameworkRoot dispatch start.', {
      actionCount: queue.length,
      actionTypes: queue.map((action) => action.type),
    });

    const hasNonLogAction = queue.some((action) => shouldLogAction(action.type));
    if (hasNonLogAction) {
      queue.unshift(createLogAction('info', 'Dispatch start.', {
        actionCount: queue.length,
        actionTypes: queue.map((action) => action.type),
      }));
    }

    while (queue.length > 0) {
      const action = queue.shift();
      if (!action) {
        continue;
      }

      if (shouldLogAction(action.type)) {
        queue.unshift(createLogAction('debug', 'Handling action.', {
          type: action.type,
        }));
      }

      const previousState = uiState.getState();
      const context: FrameworkContextState = {
        state: previousState,
      };
      let followUps: HandlerAction[] = [];
      let nextState = previousState;
      const coreAction = toCoreAction(action);
      try {
        const handlers = this.coreRegistries.handlers.getForAction(coreAction.action);
        if (handlers.length) {
          for (const entry of handlers) {
            const result = entry.reduce(nextState, coreAction, entry.config);
            if (isReducerResult(result)) {
              nextState = result.state;
              if (Array.isArray(result.followUps)) {
                followUps = followUps.concat(result.followUps.map(toHandlerAction));
              }
            } else {
              nextState = result;
            }
          }
        }
      } catch (error) {
        logError(error, {
          message: 'FrameworkRoot handler error.',
          actionType: action.type,
        });
        if (shouldLogAction(action.type)) {
          queue.unshift(createLogAction('error', 'Handler error.', {
            type: action.type,
            error: error instanceof Error ? error.message : String(error),
          }));
        }
        continue;
      }
      const nextContext: FrameworkContextState = { state: nextState };
      const actionFollowUps = followUps;

      if (nextState !== previousState) {
        if (isDev) {
            try {
                validateState(nextState);
            } catch (error) {
                logError(error, { message: `State validation failed after action: ${action.type}` });
                if (shouldLogAction(action.type)) {
                  queue.unshift(createLogAction('error', 'State validation failed.', {
                    type: action.type,
                    error: error instanceof Error ? error.message : String(error),
                  }));
                }
                continue; // Skip state update if validation fails
            }
        }
        uiState.update(nextState);
        logInfo('FrameworkRoot state update.', {
            actionType: action.type,
            summary: summarizeUpdate(previousState, nextState),
        });
      }

      if (actionFollowUps.length > 0) {
        queue.push(...actionFollowUps);
      }

      void this.coreRegistries.effects.runForAction(
        coreAction,
        (nextAction) => this.dispatchActions([toHandlerAction(nextAction)]),
        () => nextContext.state,
      );
    }

    logInfo('FrameworkRoot dispatch end.');
  }

  render() {
    return html`<workspace-root></workspace-root>`;
  }
}

customElements.define('framework-root', FrameworkRoot);
