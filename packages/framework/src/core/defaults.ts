/**
 * Default values and inference utilities for the framework.
 * Used by SimpleViewConfig to auto-derive missing properties.
 */

import type { FrameworkLogger } from '../utils/logger';

/**
 * Icon keywords mapped to Material Icons names.
 * Used to infer icons from view IDs.
 */
const ICON_KEYWORDS: Record<string, string> = {
  counter: 'calculate',
  ticker: 'trending_up',
  stock: 'trending_up',
  log: 'dvr',
  config: 'tune',
  settings: 'settings',
  auth: 'person',
  user: 'person',
  login: 'login',
  editor: 'edit',
  code: 'code',
  preview: 'device_hub',
  inspector: 'storage',
  data: 'storage',
  timeline: 'schedule',
  schedule: 'schedule',
  explorer: 'folder',
  folder: 'folder',
  project: 'folder',
  library: 'collections',
  asset: 'collections',
  properties: 'tune',
  style: 'palette',
  theme: 'palette',
  console: 'terminal',
  terminal: 'terminal',
  assistant: 'psychology',
  ai: 'psychology',
  export: 'file_download',
  import: 'file_upload',
  toolbar: 'view_compact',
  layout: 'view_list',
  list: 'view_list',
  canvas: 'edit',
  design: 'design_services',
  search: 'search',
  filter: 'filter_list',
  chart: 'bar_chart',
  graph: 'show_chart',
  dashboard: 'dashboard',
  home: 'home',
  info: 'info',
  help: 'help',
  notification: 'notifications',
  alert: 'warning',
  error: 'error',
  debug: 'bug_report',
};

/**
 * Infer an icon from a view ID by matching keywords.
 * @param id - The view ID to infer an icon from
 * @returns The inferred Material Icons name, or 'apps' as fallback
 */
export function inferIcon(id: string): string {
  const lowerId = id.toLowerCase();
  for (const [keyword, icon] of Object.entries(ICON_KEYWORDS)) {
    if (lowerId.includes(keyword)) {
      return icon;
    }
  }
  return 'apps';
}

/**
 * Convert a kebab-case ID to a human-readable title.
 * @example 'counter-demo' -> 'Counter Demo'
 */
export function deriveNameFromId(id: string): string {
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Ensure an ID is a valid custom element tag name.
 * Custom element names must contain a hyphen.
 * @example 'counter' -> 'counter-view'
 * @example 'counter-demo' -> 'counter-demo'
 */
export function deriveTagFromId(id: string): string {
  if (id.includes('-')) {
    return id;
  }
  return `${id}-view`;
}

/**
 * Convert a PascalCase or camelCase class name to kebab-case.
 * @example 'CounterDemo' -> 'counter-demo'
 * @example 'MyAwesomeView' -> 'my-awesome-view'
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Default logging configuration for development mode.
 */
export const DEFAULT_DEV_LOGGER: FrameworkLogger = {
  info: (message: string, context?: unknown) => {
    // console.log(`[BuildBlox] ${message}`, context ?? '');
  },
  warn: (message: string, context?: unknown) => {
    console.warn(`[BuildBlox] ${message}`, context ?? '');
  },
  error: (message: string, context?: unknown) => {
    console.error(`[BuildBlox] ${message}`, context ?? '');
  },
  debug: (message: string, context?: unknown) => {
    console.debug(`[BuildBlox] ${message}`, context ?? '');
  },
};

/**
 * No-op logger for production or when logging is disabled.
 */
export const NOOP_LOGGER: FrameworkLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};
