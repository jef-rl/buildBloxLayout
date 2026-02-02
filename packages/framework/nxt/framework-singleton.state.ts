/**
 * Framework Singleton
 *
 * Provides a simplified API for framework initialization.
 * Auto-registers built-in views and handles bootstrapping automatically.
 *
 * Usage:
 * ```typescript
 * import { Framework } from '@project/framework';
 *
 * Framework
 *   .configure({ auth: { enabled: true } })
 *   .registerViews([
 *     { id: 'my-view', component: MyViewComponent },
 *   ]);
 * // Framework auto-initializes on DOMContentLoaded
 * ```
 */

import type { UIState, FrameworkAuthConfig } from '../types/index';
import type { ViewDefinition } from '../domains/panels/types';
import type { FrameworkLogger } from './logger.utils'
import type { FrameworkRoot } from '../components/FrameworkRoot';
import { viewRegistry } from './registry/view-registry';
import { dispatchUiEvent } from '../utils/dispatcher';
import { setFrameworkLogger, getFrameworkLogger } from './logger.utils'
import {
  type SimpleViewConfig,
  normalizeViewConfig,
} from './simple-view-config';
import { registerBuiltInViews, BUILT_IN_VIEWS } from './built-in-views';
import { DEFAULT_DEV_LOGGER, NOOP_LOGGER } from './defaults';

// Import FrameworkRoot component to ensure it's registered
import '../components/FrameworkRoot';

/**
 * Configuration options for the Framework.
 */
export interface FrameworkConfig {
  /** Mount point for the framework (defaults to document.body) */
  mount?: ParentNode;

  /** Authentication configuration */
  auth?: FrameworkAuthConfig;

  /** Initial UI state to hydrate */
  initialState?: Partial<UIState>;

  /** Logging configuration: 'console' | 'none' | custom logger */
  logging?: FrameworkLogger | 'console' | 'none';

  /** Auto-initialize on DOMContentLoaded (default: true) */
  autoInit?: boolean;
}

/**
 * Default empty state for when no initial state is provided.
 */
function getDefaultState(): Partial<UIState> {
  return {
    containers: [],
    panels: [],
    views: [],
    viewInstances: {},
    viewDefinitions: [],
    viewInstanceCounter: 0,
    layout: {
      expansion: {
        expanderLeft: 'Closed',
        expanderRight: 'Closed',
        expanderBottom: 'Closed',
      },
      overlayView: null,
      inDesign: false,
      viewportWidthMode: '1x',
      mainAreaCount: 1,
      mainViewOrder: [],
      leftViewOrder: [],
      rightViewOrder: [],
      bottomViewOrder: [],
    },
    auth: {
      isLoggedIn: false,
      isAdmin: false,
      user: null,
    },
    authUi: {
      loading: false,
      error: null,
      success: null,
    },
    panelState: {
      open: {},
      data: {},
      errors: {},
    },
    logs: {
      entries: [],
      maxEntries: 100,
    },
  };
}

/**
 * Framework Singleton class.
 * Manages configuration, view registration, and initialization.
 */
class FrameworkSingleton {
  private static instance: FrameworkSingleton | null = null;

  private config: FrameworkConfig = {};
  private initialized = false;
  private pendingViews: SimpleViewConfig[] = [];
  private root: FrameworkRoot | null = null;
  private initScheduled = false;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the singleton instance.
   */
  static getInstance(): FrameworkSingleton {
    if (!FrameworkSingleton.instance) {
      FrameworkSingleton.instance = new FrameworkSingleton();
    }
    return FrameworkSingleton.instance;
  }

  /**
   * Reset the singleton (useful for testing).
   */
  static reset(): void {
    FrameworkSingleton.instance = null;
  }

  /**
   * Configure the framework before initialization.
   * Can be called multiple times - configs are merged.
   *
   * @param config - Configuration options
   * @returns this (for chaining)
   */
  configure(config: Partial<FrameworkConfig>): this {
    this.config = { ...this.config, ...config };
    this.setupLogging();
    return this;
  }

  /**
   * Set up logging based on configuration.
   */
  private setupLogging(): void {
    const { logging } = this.config;

    if (logging === 'console') {
      setFrameworkLogger(DEFAULT_DEV_LOGGER);
    } else if (logging === 'none') {
      setFrameworkLogger(NOOP_LOGGER);
    } else if (logging && typeof logging === 'object') {
      setFrameworkLogger(logging);
    } else if (logging === undefined) {
      // Default: console logging in dev mode
      try {
        // @ts-ignore - import.meta.env may not exist
        if (import.meta.env?.DEV) {
          setFrameworkLogger(DEFAULT_DEV_LOGGER);
        }
      } catch {
        // If import.meta is not available, default to no logging
      }
    }
  }

  /**
   * Register a single view.
   *
   * @param config - Simplified view configuration
   * @returns this (for chaining)
   */
  registerView(config: SimpleViewConfig): this {
    if (this.initialized) {
      // Register immediately if already initialized
      const normalizedDef = normalizeViewConfig(config);
      viewRegistry.register(normalizedDef);
    } else {
      // Queue for registration on init
      this.pendingViews.push(config);
      // Schedule auto-init
      this.scheduleAutoInit();
    }
    return this;
  }

  /**
   * Register multiple views at once.
   *
   * @param configs - Array of simplified view configurations
   * @returns this (for chaining)
   */
  registerViews(configs: SimpleViewConfig[]): this {
    configs.forEach((config) => this.registerView(config));
    return this;
  }

  /**
   * Register a full ViewDefinition (for advanced use cases).
   *
   * @param definition - Full view definition
   * @returns this (for chaining)
   */
  registerViewDefinition(definition: ViewDefinition): this {
    if (this.initialized) {
      viewRegistry.register(definition);
    } else {
      // Queue as a special "already normalized" entry
      // We'll detect this in init() and register directly
      (definition as any).__isFullDefinition = true;
      this.pendingViews.push(definition as unknown as SimpleViewConfig);
      this.scheduleAutoInit();
    }
    return this;
  }

  /**
   * Schedule auto-initialization if enabled.
   */
  private scheduleAutoInit(): void {
    if (this.config.autoInit === false || this.initScheduled) {
      return;
    }

    this.initScheduled = true;

    // Schedule init on next microtask to batch registrations
    Promise.resolve().then(() => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init(), {
          once: true,
        });
      } else {
        this.init();
      }
    });
  }

  /**
   * Initialize the framework.
   * Creates the framework root and registers all views.
   *
   * @returns The framework root element
   */
  init(): FrameworkRoot {
    if (this.initialized && this.root) {
      return this.root;
    }

    const logger = getFrameworkLogger();

    // Register built-in framework views first
    registerBuiltInViews(viewRegistry);
    logger?.info?.('Framework built-in views registered', {
      count: BUILT_IN_VIEWS.length,
      viewIds: BUILT_IN_VIEWS.map((v) => v.id),
    });

    // Register pending user views
    this.pendingViews.forEach((config) => {
      if ((config as any).__isFullDefinition) {
        // Already a full definition
        delete (config as any).__isFullDefinition;
        viewRegistry.register(config as unknown as ViewDefinition);
      } else {
        const normalizedDef = normalizeViewConfig(config);
        viewRegistry.register(normalizedDef);
      }
    });

    logger?.info?.('Framework user views registered', {
      count: this.pendingViews.length,
      viewIds: this.pendingViews.map((v) => v.id),
    });

    this.pendingViews = [];

    // Create and mount framework root
    const root = document.createElement('framework-root') as FrameworkRoot;
    const mountTarget = this.config.mount ?? document.body;

    // Configure auth BEFORE mounting
    if (this.config.auth) {
      (root as any).authConfig = this.config.auth;
      logger?.info?.('Framework auth configured', {
        enabled: this.config.auth.enabled,
        authViewId: this.config.auth.authViewId ?? 'firebase-auth',
        autoShowOnStartup: this.config.auth.autoShowOnStartup ?? false,
      });
    }

    mountTarget.appendChild(root);

    // Prepare initial state
    const initialState = this.config.initialState ?? getDefaultState();
    const allViews = viewRegistry.getAllViews();
    const viewDefinitions = allViews.map((view) => ({
      id: view.id,
      name: view.name,
      title: view.title,
      icon: view.icon,
    }));

    const mergedState = {
      ...initialState,
      viewDefinitions:
        (initialState as any).viewDefinitions ?? viewDefinitions,
    };

    // Hydrate state
    dispatchUiEvent(root, 'state/hydrate', { state: mergedState });

    logger?.info?.('Framework initialized', {
      mountTarget:
        mountTarget instanceof Element
          ? mountTarget.tagName.toLowerCase()
          : 'document.body',
      viewCount: allViews.length,
    });

    this.initialized = true;
    this.root = root;

    return root;
  }

  /**
   * Get the framework root element.
   * Returns null if not yet initialized.
   */
  getRoot(): FrameworkRoot | null {
    return this.root;
  }

  /**
   * Check if the framework has been initialized.
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get the current configuration.
   */
  getConfig(): Readonly<FrameworkConfig> {
    return { ...this.config };
  }
}

/**
 * The Framework singleton instance.
 * Use this to configure and initialize the framework.
 */
export const Framework = FrameworkSingleton.getInstance();
