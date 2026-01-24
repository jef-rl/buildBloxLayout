import { bootstrapFramework, setFrameworkLogger } from '@project/framework';
import { IMPROVED_DEMO_LAYOUT, VIEW_REGISTRATIONS } from './data/demo-layout';
import { firebaseApp, firebaseAuth } from './firebase';

/**
 * Improved Demo Bootstrap
 * 
 * This demonstrates:
 * 1. Proper framework initialization
 * 2. View registration with metadata
 * 3. State hydration
 * 4. Optional logging configuration
 */

// ====================
// LOGGING SETUP
// ====================

/**
 * Configure framework logging for development
 * This helps understand the event flow and state changes
 */
setFrameworkLogger({
  info: (message: string, context?: unknown) => {
    console.log(`[Framework Info] ${message}`, context);
  },
  warn: (message: string, context?: unknown) => {
    console.warn(`[Framework Warn] ${message}`, context);
  },
  error: (message: string, context?: unknown) => {
    console.error(`[Framework Error] ${message}`, context);
  },
  debug: (message: string, context?: unknown) => {
    if (import.meta.env.DEV) {
      console.debug(`[Framework Debug] ${message}`, context);
    }
  }
});

// ====================
// VIEW COMPONENT LOADER
// ====================

/**
 * Unified component loader for demo views
 * In a real app, each view type would have its own component
 */
const loadDemoView = () => import('./components/demo-view');

// ====================
// FRAMEWORK BOOTSTRAP
// ====================

/**
 * Initialize the framework with:
 * - View definitions (registry)
 * - Initial UI state
 * - Optional mount point
 */
const root = bootstrapFramework({
  // Register all views with their metadata
  views: VIEW_REGISTRATIONS.map(reg => ({
    ...reg,
    component: loadDemoView  // Use unified demo component
  })),

  // Hydrate initial state
  state: IMPROVED_DEMO_LAYOUT,

  // Optional: specify mount point (defaults to document.body)
  // mount: document.getElementById('app')
});

// Configure authentication behavior on the framework root after bootstrap
setTimeout(() => {
  const frameworkRoot = root as any;
  if (frameworkRoot) {
    frameworkRoot.authConfig = {
      enabled: true,                     // Enable auth features
      authViewId: 'firebase-auth',       // ID of the auth overlay view
      autoShowOnStartup: true,           // Show login on startup if not logged in
      requireAuthForActions: [],         // Actions that require authentication
      adminEmails: (import.meta.env.VITE_ADMIN_EMAILS ?? '')
        .split(',')
        .map((e: string) => e.trim())
        .filter(Boolean),                // System administrator emails from .env
    };
  }
}, 0);

// ====================
// FIREBASE INITIALIZATION
// ====================

/**
 * Initialize Firebase services (Firestore & Authentication)
 * Uses custom element lifecycle to ensure framework-root is ready
 */
const initializeFirebaseServices = () => {
  const frameworkRoot = root as any;

  if (!frameworkRoot) {
    console.error('Framework root not found');
    return;
  }

  // Wait for framework-root to be connected to the DOM
  if (frameworkRoot.isConnected) {
    setupFirebase(frameworkRoot).catch((error) => {
      console.error('Firebase initialization failed:', error);
    });
  } else {
    // If not yet connected, wait for it
    const observer = new MutationObserver(() => {
      if (frameworkRoot.isConnected) {
        setupFirebase(frameworkRoot).catch((error) => {
          console.error('Firebase initialization failed:', error);
        });
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
};

/**
 * Configure Firestore and Firebase Authentication
 */
const setupFirebase = async (frameworkRoot: any) => {
  console.log('[Firebase Setup] setupFirebase called', {
    frameworkRootReady: !!frameworkRoot,
    firestoreHook: typeof frameworkRoot.configureFirestore === 'function',
    authHook: typeof frameworkRoot.configureFirebaseAuth === 'function',
    firebaseAppReady: !!firebaseApp,
    authConfig: frameworkRoot.authConfig,
  });

  // Check if Firebase is initialized
  if (!firebaseApp) {
    console.warn('%c Firebase Not Initialized ', 'background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px;');
    console.warn('Skipping Firestore and Authentication setup. To enable Firebase features, add your Firebase configuration to packages/playground/.env');
    return;
  }

  // Initialize Firestore for preset persistence
  if (frameworkRoot.configureFirestore && firebaseApp) {
    try {
      console.log('[Firebase Setup] Initializing Firestore...');
      // Import Firestore modules
      const { getFirestore: initGetFirestore } = await import('firebase/firestore');
      console.log('[Firebase Setup] Firestore modules imported');

      // Get the Firestore instance
      const db = initGetFirestore(firebaseApp);
      console.log('[Firebase Setup] Firestore instance created:', !!db);

      frameworkRoot.configureFirestore(db);
      console.log('%c Firestore Persistence Enabled ', 'background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px;');
      console.log('[Firebase Setup] Framework root configured with Firestore');
    } catch (error) {
      console.error('%c Firestore Initialization Failed ', 'background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px;');
      console.error('Error details:', error);
      console.warn('Firestore is not available. This might mean:');
      console.warn('1. Firestore is not enabled in your Firebase project');
      console.warn('2. There is a network issue connecting to Firebase');
      console.warn('3. Your Firebase credentials are invalid');
      console.warn('Presets will be stored locally only (no Firestore sync)');
    }
  } else {
    console.warn('%c Firestore Configuration Skipped ', 'background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px;');
    if (!frameworkRoot.configureFirestore) {
      console.warn('Framework root does not have configureFirestore method');
    }
    if (!firebaseApp) {
      console.warn('Firebase app is not initialized');
    }
  }

  // Initialize Firebase Authentication
  if (frameworkRoot.configureFirebaseAuth) {
    try {
      frameworkRoot.configureFirebaseAuth(firebaseAuth);
      console.log('%c Firebase Auth Initialized ', 'background: #8b5cf6; color: white; padding: 4px 8px; border-radius: 4px;');
    } catch (error) {
      console.warn('%c Firebase Auth Setup Failed ', 'background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px;');
      console.warn('Error details:', error);
    }
  }

  // Log authentication configuration
  console.log('%c Auth Configuration ', 'background: #8b5cf6; color: white; padding: 4px 8px; border-radius: 4px;');
  console.log('  • Email/Password authentication: ✓');
  console.log('  • Google OAuth: ✓');
  console.log('  • Password reset: ✓');
  console.log('  • User signup: ✓');
  console.log('  • Auto-show on startup:', frameworkRoot.authConfig?.autoShowOnStartup ? '✓' : '✗');
};

// Initialize Firebase services
initializeFirebaseServices();

// ====================
// DEVELOPMENT HELPERS
// ====================

if (import.meta.env.DEV) {
  // Expose framework root for debugging
  (window as any).__frameworkRoot = root;
  
  // Log initialization complete
  console.log('%c Framework Initialized ', 'background: #10b981; color: white; padding: 4px 8px; border-radius: 4px;');
  console.log('Framework root:', root);
  console.log('Initial state:', IMPROVED_DEMO_LAYOUT);
  console.log('Registered views:', VIEW_REGISTRATIONS.length);
  
  // Provide helpful debugging commands
  console.log(`
%c🎯 Debugging Commands %c

// Access framework root
__frameworkRoot

// Dispatch custom action
import { dispatchUiEvent } from '@project/framework';
dispatchUiEvent(window, 'your/action', { payload: 'data' });

// Check current state
__frameworkRoot.querySelector('framework-root').state

  `,
    'background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px;',
    'color: #9ca3af; font-size: 0.9em;'
  );

  console.log(`
%c🔐 Authentication Shortcuts %c

// Open authentication overlay
Cmd/Ctrl + L

// The auth view supports:
- Email/password login
- User signup
- Password reset
- Google OAuth
- User profile and logout

  `,
    'background: #8b5cf6; color: white; padding: 4px 8px; border-radius: 4px;',
    'color: #9ca3af; font-size: 0.9em;'
  );
}

// ====================
// EXAMPLE EVENT LISTENERS
// ====================

/**
 * Example: Listen to custom events
 * (Optional - for advanced use cases)
 */
window.addEventListener('ui-event', ((event: CustomEvent) => {
  if (import.meta.env.DEV) {
    console.log('UI Event:', event.detail);
  }
}) as EventListener);

/**
 * Example: Handle specific actions
 */
window.addEventListener('ui-event', ((event: CustomEvent) => {
  const { type, payload } = event.detail;
  
  // Example: Track analytics on certain actions
  if (type === 'panels/assignView') {
    console.log('View assigned:', payload);
    // trackEvent('view_assigned', payload);
  }
  
  // Example: Persist state changes
  if (type.startsWith('layout/')) {
    console.log('Layout changed:', { type, payload });
    // saveToLocalStorage('layout', currentState);
  }
}) as EventListener);

/**
 * Example: Auto-save functionality
 */
let saveTimeout: number;
window.addEventListener('ui-event', ((event: CustomEvent) => {
  clearTimeout(saveTimeout);
  saveTimeout = window.setTimeout(() => {
    // Auto-save logic here
    console.log('Auto-save triggered');
  }, 1000);
}) as EventListener);

// ====================
// KEYBOARD SHORTCUTS
// ====================

/**
 * Example: Global keyboard shortcuts
 */
document.addEventListener('keydown', (event) => {
  // Cmd/Ctrl + B: Toggle left panel
  if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
    event.preventDefault();
    const frameworkRoot = document.querySelector('framework-root');
    if (frameworkRoot) {
      import('@project/framework').then(({ dispatchUiEvent }) => {
        const state = (frameworkRoot as any).state;
        const currentLeft = state?.layout?.expansion?.left ?? false;
        dispatchUiEvent(frameworkRoot, 'layout/setExpansion', {
          side: 'left',
          expanded: !currentLeft
        });
      });
    }
  }
  
  // Cmd/Ctrl + Shift + P: Open settings overlay
  if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'p') {
    event.preventDefault();
    const frameworkRoot = document.querySelector('framework-root');
    if (frameworkRoot) {
      import('@project/framework').then(({ dispatchUiEvent }) => {
        dispatchUiEvent(frameworkRoot, 'layout/setOverlayView', {
          viewId: 'project-settings'
        });
      });
    }
  }

  // Cmd/Ctrl + L: Open authentication overlay
  if ((event.metaKey || event.ctrlKey) && event.key === 'l') {
    event.preventDefault();
    const frameworkRoot = document.querySelector('framework-root');
    if (frameworkRoot) {
      import('@project/framework').then(({ dispatchUiEvent }) => {
        dispatchUiEvent(frameworkRoot, 'layout/setOverlayView', {
          viewId: 'firebase-auth'
        });
      });
    }
  }

  // Escape: Close overlay
  if (event.key === 'Escape') {
    const frameworkRoot = document.querySelector('framework-root');
    if (frameworkRoot) {
      import('@project/framework').then(({ dispatchUiEvent }) => {
        const state = (frameworkRoot as any).state;
        if (state?.layout?.overlayView) {
          dispatchUiEvent(frameworkRoot, 'layout/setOverlayView', {
            viewId: null
          });
        }
      });
    }
  }
});

// ====================
// RESPONSIVE HANDLING
// ====================

/**
 * Example: Responsive layout adjustments
 */
const handleResize = () => {
  const width = window.innerWidth;
  const frameworkRoot = document.querySelector('framework-root');
  
  if (!frameworkRoot) return;
  
  import('@project/framework').then(({ dispatchUiEvent }) => {
    // Auto-collapse panels on small screens
    if (width < 768) {
      dispatchUiEvent(frameworkRoot, 'layout/setExpansion', {
        side: 'left',
        expanded: false
      });
      dispatchUiEvent(frameworkRoot, 'layout/setExpansion', {
        side: 'right',
        expanded: false
      });
      dispatchUiEvent(frameworkRoot, 'layout/setViewportWidthMode', {
        mode: '1x'
      });
    }
  });
};

window.addEventListener('resize', handleResize);
handleResize(); // Run on init

/**
 * Framework initialized successfully
 * 
 * Key takeaways:
 * 
 * 1. CONTEXT PATTERN:
 *    - Views consume context via ContextConsumer
 *    - Context is read-only in views
 *    - No direct mutations allowed
 * 
 * 2. STATE UPDATES:
 *    - All changes via dispatchUiEvent
 *    - Actions flow through handler registry
 *    - Centralized state management
 * 
 * 3. VIEW LIFECYCLE:
 *    - Views register with ViewRegistry
 *    - Lazy loading via component functions
 *    - Automatic cleanup and disposal
 * 
 * 4. PANEL MANAGEMENT:
 *    - Panels are structural containers
 *    - Views attach to panels via assignments
 *    - Layout adapts to expansion states
 * 
 * 5. EXTENSIBILITY:
 *    - Custom handlers via handler registry
 *    - Custom context properties
 *    - Event-driven architecture
 */
