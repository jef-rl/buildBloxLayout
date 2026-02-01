/**
 * Built-in framework views that are auto-registered during initialization.
 * Users don't need to register these - they're available automatically.
 */

import type { ViewDefinition } from '../types/index';
import type { ViewRegistryApi } from './registry/view-registry';

// Lazy imports for built-in components to avoid circular dependencies
const loadAuthView = () =>
  import('../domains/auth/components/AuthView').then((m) => m.AuthView);

const loadLogView = () =>
  import('../domains/logging/components/LogView').then((m) => m.LogView);

const loadLayoutsList = () =>
  import('../domains/layout/components/LayoutsList').then((m) => m.LayoutsList);

const loadCustomToolbar = () =>
  import('../domains/layout/components/CustomToolbar').then(
    (m) => m.CustomToolbar
  );

const loadToolbarContainer = () =>
  import('../domains/layout/components/ToolbarContainer').then(
    (m) => m.ToolbarContainer
  );

const loadSavePresetContent = () =>
  import('../domains/layout/components/SavePresetContent').then(
    (m) => m.SavePresetContent
  );

const loadLoadPresetContent = () =>
  import('../domains/layout/components/LoadPresetContent').then(
    (m) => m.LoadPresetContent
  );

/**
 * Framework-provided view definitions.
 * These are registered automatically when the framework initializes.
 */
export const BUILT_IN_VIEWS: ViewDefinition[] = [
  {
    id: 'firebase-auth',
    name: 'Authentication',
    title: 'Authentication',
    tag: 'auth-view',
    icon: 'person',
    component: loadAuthView,
  },
  {
    id: 'framework-logs',
    name: 'Framework Logs',
    title: 'Framework Logs',
    tag: 'log-view',
    icon: 'terminal',
    component: loadLogView,
  },
  {
    id: 'layouts-list',
    name: 'Layouts',
    title: 'Layouts',
    tag: 'layouts-list',
    icon: 'view_list',
    component: loadLayoutsList,
  },
  {
    id: 'custom-toolbar',
    name: 'Toolbar',
    title: 'Toolbar',
    tag: 'custom-toolbar',
    icon: 'apps',
    component: loadCustomToolbar,
  },
  {
    id: 'generic-toolbar',
    name: 'Toolbar Container',
    title: 'Toolbar Container',
    tag: 'toolbar-container',
    icon: 'view_compact',
    component: loadToolbarContainer,
  },
  {
    id: 'save-preset',
    name: 'Save Preset',
    title: 'Save Preset',
    tag: 'save-preset-content',
    icon: 'save',
    component: loadSavePresetContent,
  },
  {
    id: 'load-preset',
    name: 'Load Preset',
    title: 'Load Preset',
    tag: 'load-preset-content',
    icon: 'folder_open',
    component: loadLoadPresetContent,
  },
];

/**
 * Get the list of built-in view IDs.
 * Useful for checking if a view is framework-provided.
 */
export function getBuiltInViewIds(): string[] {
  return BUILT_IN_VIEWS.map((v) => v.id);
}

/**
 * Check if a view ID is a built-in framework view.
 */
export function isBuiltInView(viewId: string): boolean {
  return BUILT_IN_VIEWS.some((v) => v.id === viewId);
}

/**
 * Register all built-in framework views with the view registry.
 * Called automatically by the Framework singleton during initialization.
 *
 * @param registry - The view registry to register views with
 */
export function registerBuiltInViews(registry: ViewRegistryApi): void {
  BUILT_IN_VIEWS.forEach((view) => {
    // Only register if not already registered (allows user override)
    if (!registry.get(view.id)) {
      registry.register(view);
    }
  });
}
