/**
 * BuildBlox Framework - Simplified Demo
 *
 * This demonstrates the new simplified API where:
 * 1. Users only register their custom views (framework views are auto-registered)
 * 2. No need for manual bootstrapping - just configure and register
 * 3. Icons and tags are auto-derived from view IDs
 */

import { Framework, type SimpleViewConfig } from '@project/framework';
import { IMPROVED_DEMO_LAYOUT } from './data/demo-layout';
import { firebaseApp, firebaseAuth } from './firebase';
import { registerVisualBlockDefinitions } from './visual-block/register-visual-block';

// Import custom view components
import { CounterView } from './components/counter-view';
import { DataFeedView } from './components/data-feed-view';
import { ConfiguratorView } from './components/configurator-view';
import { ImprovedDemoView } from './components/demo-view';

// ====================
// VIEW REGISTRATIONS (Simplified!)
// ====================

/**
 * Only register custom application views.
 * Framework views (firebase-auth, framework-logs, layouts-list, custom-toolbar)
 * are automatically registered by the framework!
 *
 * Compare to the old approach which required:
 * - getTagForView() function to map IDs to tags
 * - getIconForView() function to map IDs to icons
 * - getComponentLoader() function for async component loading
 * - Manual registration of firebase-auth, framework-logs, etc.
 */
const CUSTOM_VIEWS: SimpleViewConfig[] = [
  // Interactive demo views
  // Note: Components already have @customElement decorators, so we provide the tag explicitly
  { id: 'counter-demo', component: CounterView, tag: 'counter-view', icon: 'calculate' },
  { id: 'stock-ticker', component: DataFeedView, tag: 'data-feed-view', icon: 'trending_up' },
  { id: 'system-logs', component: DataFeedView, tag: 'data-feed-view', icon: 'dvr' },
  { id: 'config-panel', component: ConfiguratorView, tag: 'configurator-view', icon: 'tune' },

  // Main area views (using demo-view for placeholders)
  { id: 'canvas-editor', component: ImprovedDemoView, tag: 'demo-view', icon: 'edit' },
  { id: 'code-editor', component: ImprovedDemoView, tag: 'demo-view', icon: 'code' },

  // Left panel views
  { id: 'project-explorer', component: ImprovedDemoView, tag: 'demo-view', icon: 'folder' },
  { id: 'asset-library', component: ImprovedDemoView, tag: 'demo-view', icon: 'collections' },

  // Right panel views
  { id: 'properties-panel', component: ImprovedDemoView, tag: 'demo-view', icon: 'tune' },
  { id: 'style-editor', component: ImprovedDemoView, tag: 'demo-view', icon: 'palette' },
  { id: 'data-inspector', component: ImprovedDemoView, tag: 'demo-view', icon: 'storage' },

  // Bottom panel views
  { id: 'console-output', component: ImprovedDemoView, tag: 'demo-view', icon: 'terminal' },
  { id: 'timeline-view', component: ImprovedDemoView, tag: 'demo-view', icon: 'schedule' },
  { id: 'preview-panel', component: ImprovedDemoView, tag: 'demo-view', icon: 'device_hub' },

  // Overlay views
  { id: 'ai-assistant', component: ImprovedDemoView, tag: 'demo-view', icon: 'psychology' },
  { id: 'project-settings', component: ImprovedDemoView, tag: 'demo-view', icon: 'settings' },
  { id: 'export-dialog', component: ImprovedDemoView, tag: 'demo-view', icon: 'file_download' },
];

// ====================
// AUTH CONFIGURATION
// ====================

const authConfig = {
  enabled: true,
  authViewId: 'firebase-auth', // This view is auto-registered by framework!
  autoShowOnStartup: false,
  requireAuthForActions: [],
  adminEmails: (import.meta.env.VITE_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e: string) => e.trim())
    .filter(Boolean),
};

// ====================
// FRAMEWORK INITIALIZATION (Simplified!)
// ====================

/**
 * Configure and initialize the framework.
 *
 * OLD APPROACH (~60 lines):
 *   setFrameworkLogger({...});
 *   const VIEW_REGISTRATIONS = ALL_VIEWS.map(v => ({...}));
 *   bootstrapFramework({ views, state, auth });
 *
 * NEW APPROACH (~10 lines):
 *   Framework.configure({...}).registerViews([...]).init();
 */
const root = Framework.configure({
  auth: authConfig,
  initialState: IMPROVED_DEMO_LAYOUT,
  logging: 'console',
})
  .registerViews(CUSTOM_VIEWS)
  .init();

registerVisualBlockDefinitions(root as any);

// ====================
// FIREBASE INITIALIZATION
// ====================

const initializeFirebaseServices = () => {
  const frameworkRoot = root as any;

  if (!frameworkRoot) {
    console.error('Framework root not found');
    return;
  }

  if (frameworkRoot.isConnected) {
    setupFirebase(frameworkRoot).catch((error) => {
      console.error('Firebase initialization failed:', error);
    });
  } else {
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

const setupFirebase = async (frameworkRoot: any) => {
  console.log('[Firebase Setup] Initializing...');

  if (!firebaseApp) {
    console.warn(
      '%c Firebase Not Initialized ',
      'background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px;'
    );
    console.warn(
      'To enable Firebase, add your configuration to packages/playground/.env'
    );
    return;
  }

  // Initialize Firestore
  if (frameworkRoot.configureFirestore && firebaseApp) {
    try {
      const { getFirestore } = await import('firebase/firestore');
      const db = getFirestore(firebaseApp);
      frameworkRoot.configureFirestore(db);
      console.log(
        '%c Firestore Enabled ',
        'background: #10b981; color: white; padding: 4px 8px; border-radius: 4px;'
      );
    } catch (error) {
      console.error('Firestore initialization failed:', error);
    }
  }

  // Initialize Firebase Auth
  if (frameworkRoot.configureFirebaseAuth) {
    try {
      frameworkRoot.configureFirebaseAuth(firebaseAuth);
      console.log(
        '%c Firebase Auth Enabled ',
        'background: #8b5cf6; color: white; padding: 4px 8px; border-radius: 4px;'
      );
    } catch (error) {
      console.error('Firebase Auth setup failed:', error);
    }
  }
};

initializeFirebaseServices();

// ====================
// DEVELOPMENT HELPERS
// ====================

if (import.meta.env.DEV) {
  (window as any).__frameworkRoot = root;
  (window as any).__Framework = Framework;

  console.log(
    '%c Framework Initialized (Simplified API) ',
    'background: #10b981; color: white; padding: 4px 8px; border-radius: 4px;'
  );
  console.log('Custom views registered:', CUSTOM_VIEWS.length);
  console.log(
    'Framework views auto-registered: firebase-auth, framework-logs, layouts-list, custom-toolbar'
  );

  console.log(`
%c New Simplified API %c

// Register views with minimal config (only id and component required!)
Framework.registerView({
  id: 'my-view',
  component: MyViewComponent,
  // icon auto-inferred from id keywords
  // tag auto-derived from id
});

// Framework auto-registers built-in views:
// - firebase-auth (AuthView)
// - framework-logs (LogView)
// - layouts-list (LayoutsList)
// - custom-toolbar (CustomToolbar)

// Full API:
Framework
  .configure({ auth, initialState, logging })
  .registerViews([...])
  .init();
  `,
    'background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px;',
    'color: #9ca3af; font-size: 0.9em;'
  );

  console.log(`
%c Authentication %c

// Open auth overlay: Cmd/Ctrl + L
// Auth view is auto-registered by framework!
  `,
    'background: #8b5cf6; color: white; padding: 4px 8px; border-radius: 4px;',
    'color: #9ca3af; font-size: 0.9em;'
  );
}
