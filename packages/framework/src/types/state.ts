import type { AuthState, AuthUiState } from './auth';
import type { Panel } from '../domains/panels/types';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogEntry = {
  id: string;
  message: string;
  level: LogLevel;
  timestamp: number;
  extra?: unknown;
  data?: unknown;
  source?: string;
};

export type LogState = {
  entries: LogEntry[];
  maxEntries: number;
};

export type MenuItemType = 'parent' | 'preset' | 'action';

export type MenuItem = {
  id: string;
  type: MenuItemType;
  label: string;
  order: number;
  icon?: string;
};

export type MenuParentItem = MenuItem & {
  type: 'parent';
  children: MenuItem[];
};

export type MenuPresetItem = MenuItem & {
  type: 'preset';
};

export type MenuConfig = {
  items: MenuItem[];
};

export type ViewDefinitionSummary = {
  id: string;
  title?: string;
  group?: string;
  isOpen?: boolean;
  isSystem?: boolean;
};

export type ViewDefinition = {
  id: string;
  name: string;
  title: string;
  tag: string;
  icon: string;
  component: () => Promise<unknown>;
  defaultContext?: Record<string, unknown>;
};

export type View = {
  id: string;
  name?: string;
  component: string;
  data?: unknown;
};

export type ViewInstance = {
  instanceId: string;
  definitionId: string;
  title?: string;
  localContext?: Record<string, unknown>;
  layout?: Record<string, unknown>;
};

export type LayoutExpansionState = 'Collapsed' | 'Closed' | 'Opened' | 'Expanded';

export type LayoutExpansion = {
  expanderLeft: LayoutExpansionState;
  expanderRight: LayoutExpansionState;
  expanderBottom: LayoutExpansionState;
};

export type LayoutPreset = {
  name: string;
  layout?: LayoutState;
  panels?: Panel[];
  views?: View[];
  viewInstances?: Record<string, ViewInstance>;
  viewDefinitions?: ViewDefinitionSummary[];
};

export type LayoutPresets = Record<string, LayoutPreset>;

export type LayoutState = {
  expansion: LayoutExpansion;
  inDesign?: boolean;
  viewportWidthMode?: string;
  mainAreaCount?: MainAreaPanelCount;
  mainViewOrder?: string[];
  leftViewOrder?: string[];
  rightViewOrder?: string[];
  bottomViewOrder?: string[];
  overlayView?: string | null;
  activePreset?: string | null;
  presets?: LayoutPresets;
  menu?: MenuConfig;
};

export type UIState = {
  logs: LogState;
  layout: LayoutState;
  panels?: Panel[];
  views?: View[];
  viewInstances?: Record<string, ViewInstance>;
  viewDefinitions?: ViewDefinitionSummary[];
  activeView?: string | null;
  auth: AuthState;
  authUi: AuthUiState;
  viewTokens?: Record<string, unknown>;
};

export type MainAreaPanelCount = 1 | 2 | 3 | 4 | 5;
