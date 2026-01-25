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
 * Main area views - Primary workspace views
 * Each view demonstrates a different aspect of the framework
 */
const MAIN_VIEWS: View[] = [
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
    id: 'preview-panel',
    name: 'Live Preview',
    component: 'preview-panel',
    data: { 
      label: 'Live Preview',
      color: PLACEHOLDER_COLOR,
      description: 'Real-time preview of changes'
    }
  },
  {
    id: 'data-inspector',
    name: 'Data Inspector',
    component: 'data-inspector',
    data: { 
      label: 'Data Inspector',
      color: PLACEHOLDER_COLOR,
      description: 'Inspect and modify data structures'
    }
  },
  {
    id: 'timeline-view',
    name: 'Timeline',
    component: 'timeline-view',
    data: { 
      label: 'Timeline',
      color: PLACEHOLDER_COLOR,
      description: 'History and version control'
    }
  }
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
    component: 'framework-logs',
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
  }
];

/**
 * Overlay views - Modal/overlay contexts
 */
const OVERLAY_VIEWS: View[] = [
  {
    id: 'firebase-auth',
    name: 'Authentication',
    component: 'auth-view',
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

// ====================
// PANEL DEFINITIONS
// ====================

/**
 * Main area panels - equal-width horizontal layout
 */
const MAIN_PANELS: Panel[] = MAIN_VIEWS.slice(0, 3).map((view, index) => ({
  id: `panel-main-${index + 1}`,
  name: `Main Panel ${index + 1}`,
  region: 'main',
  viewId: view.id,
  view
}));

/**
 * Expansion panels - docked secondary areas
 */
const EXPANSION_PANELS: Panel[] = [
  {
    id: 'panel-left',
    name: 'Left Panel',
    region: 'left',
    viewId: LEFT_PANEL_VIEWS[0].id,
    view: LEFT_PANEL_VIEWS[0]
  },
  {
    id: 'panel-right',
    name: 'Right Panel',
    region: 'right',
    viewId: RIGHT_PANEL_VIEWS[0].id,
    view: RIGHT_PANEL_VIEWS[0]
  },
  {
    id: 'panel-bottom',
    name: 'Bottom Panel',
    region: 'bottom',
    viewId: BOTTOM_PANEL_VIEWS[1].id,
    view: BOTTOM_PANEL_VIEWS[1]
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
  ...OVERLAY_VIEWS
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
      panels: [EXPANSION_PANELS[0]]
    },
    {
      id: 'container-right',
      name: 'Right Sidebar',
      direction: 'column',
      panels: [EXPANSION_PANELS[1]]
    },
    {
      id: 'container-bottom',
      name: 'Bottom Panel',
      direction: 'row',
      panels: [EXPANSION_PANELS[2]]
    }
  ],

  // All panels (main + expansion)
  panels: [...MAIN_PANELS, ...EXPANSION_PANELS],

  // All available views
  views: ALL_VIEWS,

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
      expanderRight: 'Closed',  // Start closed
      expanderBottom: 'Closed'  // Start closed
    },
    overlayView: null,  // No overlay initially
    inDesign: false,    // Start in regular (non-design) mode
    viewportWidthMode: '3x',  // Show 3 main panels by default
    mainAreaCount: 3 as MainAreaPanelCount,
    mainViewOrder: MAIN_VIEWS.slice(0, 3).map(v => v.id)
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
    'export-dialog': 'file_download'
  };
  return iconMap[viewId] || 'apps';
}

/**
 * Map view IDs to their component loaders
 */
function getComponentLoader(viewId: string): () => Promise<any> {
  // Firebase auth view loads from framework
  if (viewId === 'firebase-auth') {
    return () => import('@project/framework').then(m => m.AuthView);
  }
  if (viewId === 'framework-logs') {
    return () => import('@project/framework').then(m => m.LogView);
  }

  // In a real app, these would load actual component modules
  // For the demo, we'll use a unified component that adapts based on data
  return () => import('../components/demo-view');
}

function getTagForView(viewId: string): string {
  if (viewId === 'firebase-auth') {
    return 'auth-view';
  }
  if (viewId === 'framework-logs') {
    return 'log-view';
  }
  return 'demo-view';
}

/**
 * Example use cases for the improved demo:
 * 
 * 1. CONTEXT CONSUMPTION:
 *    - Views read layout state via ContextConsumer
 *    - Views never mutate context directly
 *    - All state is derived from UIState
 * 
 * 2. HANDLER DISPATCH:
 *    - Use dispatchUiEvent to trigger state changes
 *    - Actions flow through handler registry
 *    - State updates are centralized
 * 
 * 3. VIEW COMMUNICATION:
 *    - Views communicate via shared context state
 *    - Selection state flows through panels
 *    - No direct view-to-view coupling
 * 
 * 4. PANEL MANAGEMENT:
 *    - Panels are structural containers
 *    - Views can be swapped within panels
 *    - Layout adapts to expansion states
 * 
 * 5. EXTENSIBILITY:
 *    - New views register with ViewRegistry
 *    - Custom handlers extend behavior
 *    - Theme and dock properties are open
 */
