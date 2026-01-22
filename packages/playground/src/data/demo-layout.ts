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
      color: '#1e40af',
      description: 'Interactive design canvas with tools'
    }
  },
  {
    id: 'code-editor',
    name: 'Code Editor',
    component: 'code-editor',
    data: { 
      label: 'Code Editor',
      color: '#7c3aed',
      description: 'Code editing with syntax highlighting'
    }
  },
  {
    id: 'preview-panel',
    name: 'Live Preview',
    component: 'preview-panel',
    data: { 
      label: 'Live Preview',
      color: '#0891b2',
      description: 'Real-time preview of changes'
    }
  },
  {
    id: 'data-inspector',
    name: 'Data Inspector',
    component: 'data-inspector',
    data: { 
      label: 'Data Inspector',
      color: '#059669',
      description: 'Inspect and modify data structures'
    }
  },
  {
    id: 'timeline-view',
    name: 'Timeline',
    component: 'timeline-view',
    data: { 
      label: 'Timeline',
      color: '#dc2626',
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
      color: '#475569',
      description: 'File tree and project structure'
    }
  },
  {
    id: 'asset-library',
    name: 'Asset Library',
    component: 'asset-library',
    data: {
      label: 'Asset Library',
      color: '#64748b',
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
      color: '#334155',
      description: 'Selected element properties'
    }
  },
  {
    id: 'style-editor',
    name: 'Style Editor',
    component: 'style-editor',
    data: {
      label: 'Style Editor',
      color: '#1e293b',
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
      color: '#0f172a',
      description: 'Logs and debugging output'
    }
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    component: 'ai-assistant',
    data: {
      label: 'AI Assistant',
      color: '#18181b',
      description: 'AI-powered help and generation'
    }
  }
];

/**
 * Overlay views - Modal/overlay contexts
 */
const OVERLAY_VIEWS: View[] = [
  {
    id: 'project-settings',
    name: 'Project Settings',
    component: 'project-settings',
    data: {
      label: 'Project Settings',
      color: '#1f2937',
      description: 'Configure project options'
    }
  },
  {
    id: 'export-dialog',
    name: 'Export',
    component: 'export-dialog',
    data: {
      label: 'Export',
      color: '#111827',
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
    viewId: BOTTOM_PANEL_VIEWS[0].id,
    view: BOTTOM_PANEL_VIEWS[0]
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

  // Authentication state
  auth: {
    isLoggedIn: false,
    user: null
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
  tag: view.component,
  icon: getIconForView(view.id),
  component: getComponentLoader(view.id)
}));

/**
 * Map view IDs to appropriate icons
 */
function getIconForView(viewId: string): string {
  const iconMap: Record<string, string> = {
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
  // In a real app, these would load actual component modules
  // For the demo, we'll use a unified component that adapts based on data
  return () => import('../components/demo-view');
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
