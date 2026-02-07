import type { MainAreaPanelCount, Panel, UIState, View } from '@project/framework';

/**
 * Improved Demo Layout for BuildBlox Framework
 * 
 * This demo showcases:
 * 1. Proper view definitions with clear responsibilities
 * 2. Correct context consumer patterns
 * 3. Handler dispatch patterns for state updates
 * 4. Panel-view relationships
 * 5. Realistic data flow patterns
 */

// ====================
// VIEW DEFINITIONS
// ====================

const PLACEHOLDER_COLOR = '#0b0b0b';

/**
 * Interactive Demo Views
 * Showcasing multiple instances and local context
 */
const INTERACTIVE_VIEWS: View[] = [
  {
    id: 'counter-demo',
    name: 'Counter Demo',
    component: 'counter-demo', // Fixed: matches ID
    data: { count: 10 }
  },
  {
    id: 'stock-ticker',
    name: 'Stock Ticker',
    component: 'stock-ticker', // Fixed: matches ID
    data: { topic: 'Stocks', speed: 800 }
  },
  {
    id: 'system-logs',
    name: 'System Logs',
    component: 'system-logs', // Fixed: matches ID
    data: { topic: 'System', speed: 2000 }
  },
  {
    id: 'config-panel',
    name: 'Configurator',
    component: 'config-panel', // Fixed: matches ID
    data: { customTitle: 'My Settings', bgColor: '#fffbeb' }
  }
];

const VISUAL_BLOCK_RENDER_VIEW: View = {
  id: 'visual-block-render',
  name: 'Visual Block Canvas',
  component: 'visual-block-render',
  data: {}
};

/**
 * Main area views - Primary workspace views
 */
const MAIN_VIEWS: View[] = [
  ...INTERACTIVE_VIEWS,
  {
    id: 'canvas-editor',
    name: 'Canvas Editor',
    component: 'canvas-editor',
    data: { 
      label: 'Canvas Editor',
      color: PLACEHOLDER_COLOR,
      description: 'Interactive design canvas with tools'
    }
  },
  {
    id: 'code-editor',
    name: 'Code Editor',
    component: 'code-editor',
    data: { 
      label: 'Code Editor',
      color: PLACEHOLDER_COLOR,
      description: 'Code editing with syntax highlighting'
    }
  },
  {
    id: 'layouts-list',
    name: 'Layouts List',
    component: 'layouts-list',
    data: {}
  },
  VISUAL_BLOCK_RENDER_VIEW
];

/**
 * Expansion panel views - Secondary context views
 */
const LEFT_PANEL_VIEWS: View[] = [
  {
    id: 'project-explorer',
    name: 'Project Explorer',
    component: 'project-explorer',
    data: {
      label: 'Project Explorer',
      color: PLACEHOLDER_COLOR,
      description: 'File tree and project structure'
    }
  },
  {
    id: 'asset-library',
    name: 'Asset Library',
    component: 'asset-library',
    data: {
      label: 'Asset Library',
      color: PLACEHOLDER_COLOR,
      description: 'Reusable assets and components'
    }
  }
];

const RIGHT_PANEL_VIEWS: View[] = [
  {
    id: 'properties-panel',
    name: 'Properties',
    component: 'properties-panel',
    data: {
      label: 'Properties',
      color: PLACEHOLDER_COLOR,
      description: 'Selected element properties'
    }
  },
  {
    id: 'style-editor',
    name: 'Style Editor',
    component: 'style-editor',
    data: {
      label: 'Style Editor',
      color: PLACEHOLDER_COLOR,
      description: 'CSS and styling controls'
    }
  },
  {
    id: 'visual-block-projection-view',
    name: 'Visual Block Projection',
    component: 'visual-block-projection-view',
    data: {}
  },
  {
    id: 'visual-block-inspector-view',
    name: 'Visual Block Inspector',
    component: 'visual-block-inspector-view',
    data: {}
  }
];

const BOTTOM_PANEL_VIEWS: View[] = [
  {
    id: 'console-output',
    name: 'Console',
    component: 'console-output',
    data: {
      label: 'Console',
      color: PLACEHOLDER_COLOR,
      description: 'Logs and debugging output'
    }
  },
  {
    id: 'framework-logs',
    name: 'Framework Logs',
    component: 'framework-logs', // Fixed: matches ID (was framework-logs)
    data: {
      label: 'Framework Logs',
      color: PLACEHOLDER_COLOR,
      description: 'Framework log stream'
    }
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    component: 'ai-assistant',
    data: {
      label: 'AI Assistant',
      color: PLACEHOLDER_COLOR,
      description: 'AI-powered help and generation'
    }
  },
  {
    id: 'visual-block-toolbar',
    name: 'Visual Block Toolbar',
    component: 'visual-block-toolbar',
    data: {}
  },
  {
    id: 'visual-block-preview',
    name: 'Visual Block Preview',
    component: 'visual-block-preview',
    data: {}
  }
];

/**
 * Overlay views - Modal/overlay contexts
 */
const OVERLAY_VIEWS: View[] = [
  {
    id: 'firebase-auth',
    name: 'Authentication',
    component: 'firebase-auth', // Fixed: matches ID (was auth-view)
    data: {
      label: 'Authentication',
      color: PLACEHOLDER_COLOR,
      description: 'Firebase authentication view'
    }
  },
  {
    id: 'project-settings',
    name: 'Project Settings',
    component: 'project-settings',
    data: {
      label: 'Project Settings',
      color: PLACEHOLDER_COLOR,
      description: 'Configure project options'
    }
  },
  {
    id: 'export-dialog',
    name: 'Export',
    component: 'export-dialog',
    data: {
      label: 'Export',
      color: PLACEHOLDER_COLOR,
      description: 'Export and publish options'
    }
  }
];

/**
 * Toolbar views - composable toolbar instances
 */
const TOOLBAR_VIEWS: View[] = [
  {
    id: 'generic-toolbar',
    name: 'Toolbar Container',
    component: 'generic-toolbar',
    data: { viewIds: [] }
  },
  {
    id: 'custom-toolbar',
    name: 'Custom Toolbar',
    component: 'custom-toolbar',
    data: {}
  }
];

// ====================
// PANEL DEFINITIONS
// ====================

/**
 * Main area panels - equal-width horizontal layout
 */
const MAIN_PANELS: Panel[] = [
  {
    id: 'panel-main-1',
    name: 'Counter',
    region: 'main',
    viewId: 'counter-demo-1', // Points to Instance
    view: INTERACTIVE_VIEWS[0] // Note: this view object will be replaced by hydration but serves as placeholder
  },
  {
    id: 'panel-main-2',
    name: 'Ticker',
    region: 'main',
    viewId: 'stock-ticker-1', // Points to Instance
    view: INTERACTIVE_VIEWS[1]
  },
  {
    id: 'panel-main-3',
    name: 'Visual Block',
    region: 'main',
    viewId: VISUAL_BLOCK_RENDER_VIEW.id,
    view: VISUAL_BLOCK_RENDER_VIEW
  }
];

/**
 * Expansion panels - docked secondary areas
 */
const LEFT_PANELS: Panel[] = [
  {
    id: 'panel-left',
    name: 'Left Panel',
    region: 'left',
    viewId: LEFT_PANEL_VIEWS[0].id,
    view: LEFT_PANEL_VIEWS[0]
  }
];

const RIGHT_PANELS: Panel[] = [
  {
    id: 'panel-right',
    name: 'Right Panel',
    region: 'right',
    viewId: RIGHT_PANEL_VIEWS[0].id,
    view: RIGHT_PANEL_VIEWS[0]
  },
  {
    id: 'panel-right-projection',
    name: 'Projection',
    region: 'right',
    viewId: RIGHT_PANEL_VIEWS[2].id,
    view: RIGHT_PANEL_VIEWS[2]
  },
  {
    id: 'panel-right-inspector',
    name: 'Inspector',
    region: 'right',
    viewId: RIGHT_PANEL_VIEWS[3].id,
    view: RIGHT_PANEL_VIEWS[3]
  }
];

const BOTTOM_PANELS: Panel[] = [
  {
    id: 'panel-bottom',
    name: 'Bottom Panel',
    region: 'bottom',
    viewId: 'system-logs-1', // Points to Instance
    view: INTERACTIVE_VIEWS[2]
  },
  {
    id: 'panel-bottom-toolbar',
    name: 'Toolbar',
    region: 'bottom',
    viewId: BOTTOM_PANEL_VIEWS[3].id,
    view: BOTTOM_PANEL_VIEWS[3]
  },
  {
    id: 'panel-bottom-preview',
    name: 'Preview',
    region: 'bottom',
    viewId: BOTTOM_PANEL_VIEWS[4].id,
    view: BOTTOM_PANEL_VIEWS[4]
  }
];

/**
 * Collect all views for registration
 */
const ALL_VIEWS = [
  ...MAIN_VIEWS,
  ...LEFT_PANEL_VIEWS,
  ...RIGHT_PANEL_VIEWS,
  ...BOTTOM_PANEL_VIEWS,
  ...OVERLAY_VIEWS,
  ...TOOLBAR_VIEWS
];

// ====================
// COMPLETE UI STATE
// ====================

export const IMPROVED_DEMO_LAYOUT: UIState = {
  // Panel containers define layout structure
  containers: [
    {
      id: 'container-main',
      name: 'Main Area',
      direction: 'row',
      panels: MAIN_PANELS
    },
    {
      id: 'container-left',
      name: 'Left Sidebar',
      direction: 'column',
      panels: LEFT_PANELS
    },
    {
      id: 'container-right',
      name: 'Right Sidebar',
      direction: 'column',
      panels: RIGHT_PANELS
    },
    {
      id: 'container-bottom',
      name: 'Bottom Panel',
      direction: 'row',
      panels: BOTTOM_PANELS
    }
  ],

  // All panels (main + expansion)
  panels: [...MAIN_PANELS, ...LEFT_PANELS, ...RIGHT_PANELS, ...BOTTOM_PANELS],

  // All available views
  views: ALL_VIEWS,

  // Map to new viewInstances format for our interactive views
  // NOTE: Keys are INSTANCE IDs (e.g. counter-demo-1)
  // definitionId is the View Definition (e.g. counter-demo)
  viewInstances: {
    'counter-demo-1': {
      instanceId: 'counter-demo-1',
      definitionId: 'counter-demo',
      title: 'Counter Demo',
      localContext: { count: 10 }
    },
    'stock-ticker-1': {
      instanceId: 'stock-ticker-1',
      definitionId: 'stock-ticker',
      title: 'Stock Ticker',
      localContext: { topic: 'Stocks', speed: 800 }
    },
    'system-logs-1': {
      instanceId: 'system-logs-1',
      definitionId: 'system-logs',
      title: 'System Logs',
      localContext: { topic: 'System', speed: 2000 }
    },
    'config-panel-1': {
      instanceId: 'config-panel-1',
      definitionId: 'config-panel',
      title: 'Configurator',
      localContext: { customTitle: 'My Settings', bgColor: '#fffbeb' }
    },
    'main-toolbar-1': {
      instanceId: 'main-toolbar-1',
      definitionId: 'generic-toolbar',
      title: 'Main Toolbar',
      localContext: { viewIds: ['custom-toolbar-1'], stretchViewIds: [] }
    },
    'custom-toolbar-1': {
      instanceId: 'custom-toolbar-1',
      definitionId: 'custom-toolbar',
      title: 'Custom Toolbar',
      localContext: {}
    }
  },

  // View definitions for context-driven UI
  viewDefinitions: ALL_VIEWS.map((view) => ({
    id: view.id,
    name: view.name,
    title: view.name,
    icon: getIconForView(view.id)
  })),

  viewInstanceCounter: 0,

  // View token state for the view controls toolbar
  viewTokens: {
    registered: ALL_VIEWS.map((view) => ({
      id: view.id,
      label: view.name
    })),
    activeSlots: MAIN_VIEWS.slice(0, 5).map((view) => view.id),
    tokenOrder: ALL_VIEWS.map((view) => view.id)
  },

  // Layout configuration
  layout: {
    expansion: {
      expanderLeft: 'Closed',   // Start closed
      expanderRight: 'Opened',  // Start opened
      expanderBottom: 'Opened'  // Start Opened to show logs
    },
    overlayView: null,  // No overlay initially
    inDesign: false,    // Start in regular (non-design) mode
    viewportWidthMode: '3x',  // Show 3 main panels by default
    mainAreaCount: 3 as MainAreaPanelCount,
    // Use INSTANCE IDs for the initial state order
    mainViewOrder: ['counter-demo-1', 'stock-ticker-1', VISUAL_BLOCK_RENDER_VIEW.id],
    leftViewOrder: [],
    rightViewOrder: [
      RIGHT_PANEL_VIEWS[0].id,
      RIGHT_PANEL_VIEWS[2].id,
      RIGHT_PANEL_VIEWS[3].id
    ],
    bottomViewOrder: ['system-logs-1', BOTTOM_PANEL_VIEWS[3].id, BOTTOM_PANEL_VIEWS[4].id],
  },

  // Toolbar positioning
  toolbars: {
    positions: {
      'views': 'bottom-center',
      'viewport': 'bottom-right',
      'expander': 'bottom-left',
      'control': 'top-center'
    },
    activePicker: null
  },

  // Active view state
  activeView: MAIN_VIEWS[0].id,

  // Dock configuration (extensible)
  dock: {
    theme: 'dark',
    snapToGrid: true,
    gridSize: 8
  },

  // Theme configuration (extensible)
  theme: {
    mode: 'dark',
    primaryColor: '#3b82f6',
    accentColor: '#8b5cf6'
  },

  // Log storage for the built-in log view
  logs: {
    entries: [],
    maxEntries: 200
  },

  // Authentication state (isAdmin will be determined by handlers)
  auth: {
    isLoggedIn: false,
    isAdmin: false,
    user: null
  },

  authUi: {
    loading: false,
    error: null,
    success: null
  },

  // Panel state tracking
  panelState: {
    open: {},
    data: {},
    errors: {}
  }
};

/**
 * View registration configurations
 * Maps view IDs to their component loaders and metadata
 */
export const VIEW_REGISTRATIONS = ALL_VIEWS.map((view) => ({
  id: view.id,
  name: view.name,
  title: view.name,
  tag: getTagForView(view.id),
  icon: getIconForView(view.id),
  component: getComponentLoader(view.id)
}));

/**
 * Map view IDs to appropriate icons
 */
function getIconForView(viewId: string): string {
  const iconMap: Record<string, string> = {
    'counter-demo': 'calculate',
    'stock-ticker': 'trending_up',
    'system-logs': 'dvr',
    'config-panel': 'tune',
    'firebase-auth': 'person',
    'canvas-editor': 'edit',
    'code-editor': 'code',
    'preview-panel': 'device_hub',
    'data-inspector': 'storage',
    'timeline-view': 'schedule',
    'project-explorer': 'folder',
    'asset-library': 'collections',
    'properties-panel': 'tune',
    'style-editor': 'palette',
    'console-output': 'terminal',
    'framework-logs': 'terminal',
    'ai-assistant': 'psychology',
    'project-settings': 'settings',
    'export-dialog': 'file_download',
    'generic-toolbar': 'view_compact',
    'custom-toolbar': 'apps',
    'layouts-list': 'view_list',
    'visual-block-render': 'view_compact',
    'visual-block-preview': 'view_in_ar',
    'visual-block-projection-view': '3d_rotation',
    'visual-block-inspector-view': 'fact_check',
    'visual-block-toolbar': 'build'
  };
  return iconMap[viewId] || 'apps';
}

/**
 * Map view IDs to their component loaders
 */
function getComponentLoader(viewId: string): () => Promise<any> {
  // New Interactive Views
  if (viewId === 'counter-demo') return () => import('../components/counter-view');
  if (viewId === 'stock-ticker' || viewId === 'system-logs') return () => import('../components/data-feed-view');
  if (viewId === 'config-panel') return () => import('../components/configurator-view');

  // Firebase auth view loads from framework
  if (viewId === 'firebase-auth') {
    return () => {
      console.log('[DemoLayout] Loading AuthView...');
      return import('@project/framework').then(m => {
        console.log('[DemoLayout] AuthView Loaded:', m.AuthView);
        return m.AuthView;
      });
    };
  }
  if (viewId === 'framework-logs') {
    return () => import('@project/framework').then(m => m.LogView);
  }
  if (viewId === 'generic-toolbar') {
    return () => import('@project/framework').then(m => m.ToolbarContainer);
  }
  // if (viewId === 'expander-controls') {
  //   return () => import('@project/framework').then(m => m.ExpanderControls);
  // }
  // if (viewId === 'viewport-controls') {
  //   return () => import('@project/framework').then(m => m.ViewportControls);
  // }
  // if (viewId === 'view-token-strip') {
  //   return () => import('@project/framework').then(m => m.ViewControls);
  // }
  if (viewId === 'custom-toolbar') {
    return () => import('@project/framework').then(m => m.CustomToolbar);
  }

  if (viewId === 'visual-block-render') {
    return () => import('../visual-block/visual-block-render-view');
  }
  if (viewId === 'visual-block-preview') {
    return () => import('../visual-block/visual-block-preview-view');
  }
  if (viewId === 'visual-block-projection-view') {
    return () => import('../visual-block/projection-view/visual-block-projection.view');
  }
  if (viewId === 'visual-block-inspector-view') {
    return () => import('../visual-block/inspector-view/visual-block-inspector.view');
  }
  if (viewId === 'visual-block-toolbar') {
    return () => import('../visual-block/visual-block-toolbar/visual-block-toolbar.view');
  }

  // if (viewId === 'layouts-list') {
  //   return () => import('@project/framework').then(m => m.LayoutsList);
  // }

  // In a real app, these would load actual component modules
  // For the demo, we'll use a unified component that adapts based on data
  return () => import('../components/demo-view');
}

function getTagForView(viewId: string): string {
  if (viewId === 'counter-demo') return 'counter-view';
  if (viewId === 'stock-ticker' || viewId === 'system-logs') return 'data-feed-view';
  if (viewId === 'config-panel') return 'configurator-view';
  
  if (viewId === 'firebase-auth') {
    return 'auth-view';
  }
  if (viewId === 'framework-logs') {
    return 'log-view';
  }
  if (viewId === 'generic-toolbar') {
    return 'toolbar-container';
  }
  if (viewId === 'custom-toolbar') {
    return 'custom-toolbar';
  }

  if (viewId === 'visual-block-render') {
    return 'visual-block-render';
  }
  if (viewId === 'visual-block-preview') {
    return 'visual-block-preview';
  }
  if (viewId === 'visual-block-projection-view') {
    return 'visual-block-projection-view';
  }
  if (viewId === 'visual-block-inspector-view') {
    return 'visual-block-inspector-view';
  }
  if (viewId === 'visual-block-toolbar') {
    return 'visual-block-toolbar';
  }

  if (viewId === 'layouts-list') {
    return 'layouts-list';
  }

  return 'demo-view';
}
