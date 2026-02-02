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
