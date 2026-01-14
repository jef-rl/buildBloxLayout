import { ContextProvider, createContext } from '@lit/context';
import type { ReactiveControllerHost } from 'lit';
import type { AiPanel, CloudProjectMeta, ModalType, PanelMode, StoredProject, ToolbarPos, ViewId, ViewportWidthMode } from '../types/index.js';
import { DEFAULT_VISUAL_BLOCK_DATA, serializeVisualBlockData } from './visual-block-data.js';

export type PanelId =
  | 'scope'
  | 'template'
  | 'styles'
  | 'preview'
  | 'export'
  | 'visual-editor'
  | 'visual-render'
  | 'visual-preview'
  | 'visual-projection'
  | 'visual-inspector'
  | 'project-save'
  | 'open-library'
  | 'import-paste'
  | 'ai-prompt'
  | 'settings';

export interface ScopePanelState {
  jsonInput: string;
  jsonError: string;
  parsedScope: Record<string, unknown>;
  mode: PanelMode;
}

export interface TemplatePanelState { templateInput: string; }
export interface StylesPanelState { stylesInput: string; }
export interface PreviewPanelState { renderError: string; renderedHtml: string; }
export interface ExportPanelState { lastCopiedAt?: number; }
export interface VisualBlockState {
  data: Record<string, unknown>;
  serializedData: string;
  renderOutput?: string;
}

export interface VisualEditorPanelState { visualBlockState: VisualBlockState; }

export interface PanelDataState {
  scope: ScopePanelState;
  template: TemplatePanelState;
  styles: StylesPanelState;
  preview: PreviewPanelState;
  export: ExportPanelState;
  'visual-editor': VisualEditorPanelState;
  'visual-render': Record<string, never>;
  'visual-preview': Record<string, never>;
  'visual-projection': Record<string, never>;
  'visual-inspector': Record<string, never>;
  'project-save': Record<string, never>;
  'open-library': Record<string, never>;
  'import-paste': Record<string, never>;
  'ai-prompt': Record<string, never>;
  settings: Record<string, never>;
}

export interface PanelsState {
  data: PanelDataState;
  open: Record<PanelId, boolean>;
  errors: Partial<Record<PanelId, string>>;
}

export interface LayoutState {
  menuOpen: boolean;
  viewportWidthMode: ViewportWidthMode;
  dockLayouts: Record<string, ToolbarPos>;
  expansion: {
    left: boolean;
    right: boolean;
    bottom: boolean;
  };
  overlayView: string | null;
}

export interface ModalControllerState {
  open: boolean;
  key: ModalType;
  title?: string;
  payload?: unknown;
  options?: Record<string, unknown>;
}

export interface ViewState {
  activeView: ViewId;
  viewPayload?: unknown;
  viewOptions?: Record<string, unknown>;
}

export interface AiState {
  isGenerating: boolean;
  activePanel: AiPanel;
  promptInput: string;
  systemInstructions: Record<string, string>;
  error: string;
  lastContent: string;
}

export interface GridRect {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z?: number;
  [key: string]: unknown;
}

export interface VisualGridGhostItem {
  originalRect: GridRect;
  currentRect: GridRect;
}

export interface VisualGridGhost {
  primaryId: string;
  originalSelectedIds: string[];
  type: 'MOVE' | 'RESIZE';
  resizeDir?: string;
  startMouse: { x: number; y: number };
  items: Record<string, VisualGridGhostItem>;
  wasDragged: boolean;
}

export interface VisualGridMarquee {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface ProjectionDragStart {
  x: number;
  initialRotation: number;
}

export interface InteractionState {
  visualGrid: {
    hoveredId: string | null;
    ghost: VisualGridGhost | null;
    marquee: VisualGridMarquee | null;
  };
  projection: {
    dragStart: ProjectionDragStart | null;
  };
  modal: {
    loading: boolean;
  };
}

export type ProjectStatus = 'idle' | 'saving' | 'loading' | 'deleting';

export interface ProjectState {
  id: string;
  name: string;
  tags: string[];
  projectsList: CloudProjectMeta[];
  savedProjects: StoredProject[];
  status: ProjectStatus;
  error: string;
  library: {
    status: 'idle' | 'loading' | 'error';
    error: string;
  };
}

export interface UiState {
  panels: PanelsState;
  layout: LayoutState;
  modalController: ModalControllerState; // Kept for legacy support or transitional
  view: ViewState;
  ai: AiState;
  project: ProjectState;
  interaction: InteractionState;
  featureFlags: Record<string, boolean>;
}

export interface UiStateContextValue {
  state: Readonly<UiState>;
  dispatch: UiDispatch;
}

export type UiDispatch = (action: UiAction) => void;

export type UiAction =
  | { type: 'projects/setMeta'; project: Partial<ProjectState> }
  | { type: 'projects/save/start' }
  | { type: 'projects/save/success'; project: Partial<ProjectState> }
  | { type: 'projects/save/error'; error: string }
  | { type: 'projects/load/start'; projectId?: string }
  | { type: 'projects/load/success'; project: Partial<ProjectState> }
  | { type: 'projects/load/error'; error: string }
  | { type: 'projects/delete/start'; projectId: string }
  | { type: 'projects/delete/success'; projectId: string }
  | { type: 'projects/delete/error'; error: string }
  | { type: 'projects/local/save'; savedProjects: StoredProject[] }
  | { type: 'projects/local/load'; savedProjects: StoredProject[] }
  | { type: 'projects/local/delete'; savedProjects: StoredProject[] }
  | { type: 'projects/library/fetch/start' }
  | { type: 'projects/library/fetch/success'; projectsList: CloudProjectMeta[] }
  | { type: 'projects/library/fetch/error'; error: string }
  | { type: 'panel/update'; panelId: PanelId; data?: Partial<PanelDataState[PanelId]>; open?: boolean; error?: string }
  | { type: 'panel/toggle'; panelId: PanelId }
  | { type: 'layout/setViewport'; mode: ViewportWidthMode }
  | { type: 'layout/setDock'; toolbarId: string; position: ToolbarPos }
  | { type: 'layout/setMenuOpen'; open: boolean }
  | { type: 'layout/setExpansion'; side: 'left' | 'right' | 'bottom'; expanded: boolean }
  | { type: 'layout/setOverlayView'; viewId: string | null }
  | { type: 'modal/open'; modalKey: ModalType; title?: string; payload?: unknown; options?: Record<string, unknown> }
  | { type: 'modal/close' }
  | { type: 'view/open'; viewId: ViewId; payload?: unknown; options?: Record<string, unknown> }
  | { type: 'view/close' }
  | { type: 'ai/open'; panelId: AiPanel; prompt?: string }
  | { type: 'ai/setPrompt'; prompt: string; panelId?: AiPanel }
  | { type: 'ai/setInstruction'; panelId: string; instruction: string }
  | { type: 'ai/generate/start'; panelId: AiPanel }
  | { type: 'ai/generate/success'; panelId: AiPanel; content: string }
  | { type: 'ai/generate/error'; panelId: AiPanel; error?: string }
  | { type: 'file/load'; data: { scope?: string; template?: string; styles?: string } }
  | { type: 'paste/load'; data: { scope?: string; template?: string; styles?: string } }
  | { type: 'export/copy-trigger'; timestamp: number }
  | { type: 'feature-flags/set'; flags: Record<string, boolean> }
  | { type: 'visual-grid/hover'; hoveredId: string | null }
  | { type: 'visual-grid/drag-start'; ghost: VisualGridGhost | null; marquee: VisualGridMarquee | null }
  | { type: 'visual-grid/drag-update'; ghost?: VisualGridGhost | null; marquee?: VisualGridMarquee | null }
  | { type: 'visual-grid/drag-end' }
  | { type: 'projection/drag-start'; dragStart: ProjectionDragStart | null }
  | { type: 'projection/drag-end' }
  | { type: 'modal/loading'; loading: boolean };

export const INITIAL_JSON_INPUT = JSON.stringify(
  {
    title: "Welcome to Lit Evaluator",
    user: { name: "Developer", role: "Admin", skills: ["Lit", "HTML", "CSS"] },
    theme: "dark",
    showDetails: true,
  },
  null,
  2,
);

export const INITIAL_TEMPLATE_INPUT = `<div class="card p-6 rounded-lg shadow-xl border border-gray-700">
  <h1 class="text-3xl font-bold text-blue-400 mb-4">\${title}</h1>
  
  <div class="flex items-center space-x-3 mb-6">
    <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">
      \${user.name[0]}
    </div>
    <div>
      <p class="text-lg font-semibold text-gray-200">\${user.name}</p>
      <p class="text-sm text-gray-400">\${user.role}</p>
    </div>
  </div>

  \${showDetails ? \`
    <div class="bg-gray-900 p-4 rounded border border-gray-700">
<h3 class="text-gray-400 text-sm uppercase tracking-wider mb-2">Skills</h3>
<div class="flex flex-wrap gap-2">
    \${user.skills.map(skill => 
        \`<span class="skill-tag px-2 py-1 text-xs rounded">\${skill}</span>\`
    ).join('')}
</div>
    </div>
  \` : ''}
</div>`;

export const INITIAL_STYLES_INPUT = `/* Custom Styles applied to Preview */
.card {
    background-color: #1f2937; /* gray-800 */
    transition: transform 0.2s;
}
.card:hover {
    transform: translateY(-2px);
}
.skill-tag {
    background-color: #1e3a8a; /* blue-900 */
    color: #bfdbfe; /* blue-200 */
    border: 1px solid #1d4ed8;
}`;

export const DEFAULT_PANEL_OPEN: Record<PanelId, boolean> = {
  scope: true,
  template: true,
  styles: true,
  preview: true,
  export: false,
  'visual-editor': false,
  'visual-render': false,
  'visual-preview': false,
  'visual-projection': false,
  'visual-inspector': false,
  'project-save': false,
  'open-library': false,
  'import-paste': false,
  'ai-prompt': false,
  settings: false,
};

const VIEW_PANEL_IDS: PanelId[] = ['project-save', 'open-library', 'import-paste', 'ai-prompt', 'settings'];

export function createInitialUiState({
  systemInstructions = {},
  savedProjects = [],
  dockLayouts = { views: 'bottom-center', size: 'bottom-right' },
}: Partial<{ systemInstructions: Record<string, string>; savedProjects: StoredProject[]; dockLayouts: Record<string, ToolbarPos> }> = {}): UiState {
  return {
    panels: {
      data: {
        scope: { jsonInput: INITIAL_JSON_INPUT, jsonError: '', parsedScope: {}, mode: 'visual' },
        template: { templateInput: INITIAL_TEMPLATE_INPUT },
        styles: { stylesInput: INITIAL_STYLES_INPUT },
        preview: { renderError: '', renderedHtml: '' },
        export: {},
        'visual-editor': {
          visualBlockState: {
            data: { ...DEFAULT_VISUAL_BLOCK_DATA },
            serializedData: serializeVisualBlockData(DEFAULT_VISUAL_BLOCK_DATA),
            renderOutput: '',
          },
        },
        'visual-render': {},
        'visual-preview': {},
        'visual-projection': {},
        'visual-inspector': {},
        'project-save': {},
        'open-library': {},
        'import-paste': {},
        'ai-prompt': {},
        settings: {},
      },
      open: { ...DEFAULT_PANEL_OPEN },
      errors: {},
    },
    layout: {
      menuOpen: false,
      viewportWidthMode: 'auto',
      dockLayouts: { ...dockLayouts },
      expansion: { left: false, right: false, bottom: false },
      overlayView: null,
    },
    modalController: { open: false, key: 'project-save', title: '', payload: undefined, options: {} },
    view: { activeView: '', viewPayload: undefined, viewOptions: {} },
    ai: {
      isGenerating: false,
      activePanel: '',
      promptInput: '',
      systemInstructions: { ...systemInstructions },
      error: '',
      lastContent: '',
    },
    project: {
      id: '',
      name: 'Untitled Project',
      tags: [],
      projectsList: [],
      savedProjects: [...savedProjects],
      status: 'idle',
      error: '',
      library: { status: 'idle', error: '' },
    },
    interaction: {
      visualGrid: {
        hoveredId: null,
        ghost: null,
        marquee: null,
      },
      projection: {
        dragStart: null,
      },
      modal: {
        loading: false,
      },
    },
    featureFlags: {},
  };
}

export const UiStateContext = createContext<Readonly<UiState>>('ui-state');
export const UiDispatchContext = createContext<UiDispatch>('ui-dispatch');
export const UiCombinedContext = createContext<UiStateContextValue>('ui-state-combined');
export const PanelStateContext = createContext<PanelsState>('ui-panels-state');

export function uiStateReducer(state: Readonly<UiState>, action: UiAction): UiState {
  switch (action.type) {
    case 'panel/update': {
      const nextData = action.data
        ? { ...state.panels.data, [action.panelId]: { ...state.panels.data[action.panelId], ...action.data } }
        : state.panels.data;

      const nextOpen = action.open !== undefined ? { ...state.panels.open, [action.panelId]: action.open } : state.panels.open;
      const nextErrors = action.error !== undefined ? { ...state.panels.errors, [action.panelId]: action.error } : state.panels.errors;

      return {
        ...state,
        panels: {
          data: nextData,
          open: nextOpen,
          errors: nextErrors,
        },
      };
    }
    case 'panel/toggle': {
      const isOpen = state.panels.open[action.panelId];
      return {
        ...state,
        panels: {
          ...state.panels,
          open: { ...state.panels.open, [action.panelId]: !isOpen },
        },
      };
    }
    case 'layout/setViewport':
      return { ...state, layout: { ...state.layout, viewportWidthMode: action.mode } };
    case 'layout/setDock':
      return {
        ...state,
        layout: {
          ...state.layout,
          dockLayouts: { ...state.layout.dockLayouts, [action.toolbarId]: action.position },
        },
      };
    case 'layout/setMenuOpen':
      return { ...state, layout: { ...state.layout, menuOpen: action.open } };
    case 'layout/setExpansion':
      return {
        ...state,
        layout: {
          ...state.layout,
          expansion: { ...state.layout.expansion, [action.side]: action.expanded },
        },
      };
    case 'layout/setOverlayView':
      return {
        ...state,
        layout: {
          ...state.layout,
          overlayView: action.viewId,
        },
      };
    case 'modal/open':
      return {
        ...state,
        modalController: {
          open: true,
          key: action.modalKey,
          title: action.title ?? '',
          payload: action.payload ?? null,
          options: { ...(action.options ?? {}) },
        },
      };
    case 'modal/close':
      return { ...state, modalController: { open: false, key: '', title: '', payload: null, options: {} } };
    case 'view/open':
      return {
        ...state,
        panels: {
          ...state.panels,
          open: {
            ...state.panels.open,
            ...VIEW_PANEL_IDS.reduce((acc, panelId) => ({ ...acc, [panelId]: panelId === action.viewId }), {}),
          },
        },
        view: {
          activeView: action.viewId,
          viewPayload: action.payload ?? null,
          viewOptions: { ...(action.options ?? {}) },
        },
      };
    case 'view/close': {
      const shouldClearAi = state.view.activeView === 'ai-prompt';
      return {
        ...state,
        panels: {
          ...state.panels,
          open: {
            ...state.panels.open,
            ...VIEW_PANEL_IDS.reduce((acc, panelId) => ({ ...acc, [panelId]: false }), {}),
          },
        },
        view: { activeView: '', viewPayload: null, viewOptions: {} },
        ...(shouldClearAi
          ? { ai: { ...state.ai, activePanel: '', promptInput: '', isGenerating: false, error: '' } }
          : {}),
      };
    }
    case 'ai/open':
      return {
        ...state,
        ai: {
          ...state.ai,
          activePanel: action.panelId,
          promptInput: action.prompt ?? '',
          isGenerating: false,
          error: '',
        },
      };
    case 'ai/setPrompt':
      return {
        ...state,
        ai: {
          ...state.ai,
          promptInput: action.prompt,
          activePanel: action.panelId ?? state.ai.activePanel,
        },
      };
    case 'ai/setInstruction':
      return {
        ...state,
        ai: {
          ...state.ai,
          systemInstructions: { ...state.ai.systemInstructions, [action.panelId]: action.instruction },
        },
      };
    case 'ai/generate/start':
      return { ...state, ai: { ...state.ai, isGenerating: true, activePanel: action.panelId, error: '' } };
    case 'ai/generate/success':
      return {
        ...state,
        ai: {
          ...state.ai,
          isGenerating: false,
          activePanel: '',
          promptInput: '',
          error: '',
          lastContent: action.content,
        },
      };
    case 'ai/generate/error':
      return { ...state, ai: { ...state.ai, isGenerating: false, error: action.error ?? 'Generation failed' } };
    case 'projects/setMeta':
      return {
        ...state,
        project: {
          ...state.project,
          ...action.project,
          error: action.project.error ?? state.project.error,
        },
      };
    case 'projects/save/start':
      return { ...state, project: { ...state.project, status: 'saving', error: '' } };
    case 'projects/save/success':
      return {
        ...state,
        project: { ...state.project, ...action.project, status: 'idle', error: '' },
      };
    case 'projects/save/error':
      return { ...state, project: { ...state.project, status: 'idle', error: action.error ?? 'Save failed' } };
    case 'projects/load/start':
      return { ...state, project: { ...state.project, status: 'loading', error: '' } };
    case 'projects/load/success':
      return {
        ...state,
        project: { ...state.project, ...action.project, status: 'idle', error: '' },
      };
    case 'projects/load/error':
      return { ...state, project: { ...state.project, status: 'idle', error: action.error ?? 'Load failed' } };
    case 'projects/delete/start':
      return { ...state, project: { ...state.project, status: 'deleting', error: '' } };
    case 'projects/delete/success': {
      const filteredProjects = state.project.projectsList.filter((p) => p.id !== action.projectId);
      const filteredSaved = state.project.savedProjects.filter((p) => p.id !== action.projectId);
      const resetCurrent = state.project.id === action.projectId;

      return {
        ...state,
        project: {
          ...state.project,
          projectsList: filteredProjects,
          savedProjects: filteredSaved,
          ...(resetCurrent ? { id: '', name: 'Untitled Project', tags: [] } : {}),
          status: 'idle',
          error: '',
        },
      };
    }
    case 'projects/delete/error':
      return { ...state, project: { ...state.project, status: 'idle', error: action.error ?? 'Delete failed' } };
    case 'projects/local/save':
    case 'projects/local/load':
    case 'projects/local/delete':
      return { ...state, project: { ...state.project, savedProjects: [...action.savedProjects] } };
    case 'projects/library/fetch/start':
      return { ...state, project: { ...state.project, library: { status: 'loading', error: '' } } };
    case 'projects/library/fetch/success':
      return {
        ...state,
        project: {
          ...state.project,
          projectsList: [...action.projectsList],
          library: { status: 'idle', error: '' },
        },
      };
    case 'projects/library/fetch/error':
      return { ...state, project: { ...state.project, library: { status: 'error', error: action.error } } };
    case 'file/load': {
      return {
        ...state,
        panels: mergeLoadedPanels(state.panels, action.data),
        project: { ...state.project, id: '', name: 'Imported Project', tags: [], status: 'idle', error: '' },
        modalController: { open: false, key: '', title: '', payload: null, options: {} },
        view: { activeView: '', viewPayload: null, viewOptions: {} },
      };
    }
    case 'paste/load': {
      return {
        ...state,
        panels: mergeLoadedPanels(state.panels, action.data),
        project: { ...state.project, id: '', name: 'Imported Project', tags: [], status: 'idle', error: '' },
        modalController: { open: false, key: '', title: '', payload: null, options: {} },
        view: { activeView: '', viewPayload: null, viewOptions: {} },
      };
    }
    case 'export/copy-trigger':
      return {
        ...state,
        panels: {
          ...state.panels,
          data: {
            ...state.panels.data,
            export: { ...state.panels.data.export, lastCopiedAt: action.timestamp },
          },
        },
      };
    case 'feature-flags/set':
      return { ...state, featureFlags: { ...state.featureFlags, ...action.flags } };
    case 'visual-grid/hover':
      return {
        ...state,
        interaction: {
          ...state.interaction,
          visualGrid: { ...state.interaction.visualGrid, hoveredId: action.hoveredId },
        },
      };
    case 'visual-grid/drag-start':
      return {
        ...state,
        interaction: {
          ...state.interaction,
          visualGrid: { ...state.interaction.visualGrid, ghost: action.ghost, marquee: action.marquee },
        },
      };
    case 'visual-grid/drag-update':
      return {
        ...state,
        interaction: {
          ...state.interaction,
          visualGrid: {
            ...state.interaction.visualGrid,
            ghost: action.ghost !== undefined ? action.ghost : state.interaction.visualGrid.ghost,
            marquee: action.marquee !== undefined ? action.marquee : state.interaction.visualGrid.marquee,
          },
        },
      };
    case 'visual-grid/drag-end':
      return {
        ...state,
        interaction: {
          ...state.interaction,
          visualGrid: { ...state.interaction.visualGrid, ghost: null, marquee: null },
        },
      };
    case 'projection/drag-start':
      return {
        ...state,
        interaction: {
          ...state.interaction,
          projection: { ...state.interaction.projection, dragStart: action.dragStart },
        },
      };
    case 'projection/drag-end':
      return {
        ...state,
        interaction: {
          ...state.interaction,
          projection: { ...state.interaction.projection, dragStart: null },
        },
      };
    case 'modal/loading':
      return {
        ...state,
        interaction: {
          ...state.interaction,
          modal: { ...state.interaction.modal, loading: action.loading },
        },
      };
    default:
      return state as UiState;
  }
}

export class UiProvider {
  private stateProvider: ContextProvider<{ __context__: Readonly<UiState> }>;
  private dispatchProvider: ContextProvider<{ __context__: UiDispatch }>;
  private combinedProvider: ContextProvider<{ __context__: UiStateContextValue }>;
  private panelStateProvider: ContextProvider<{ __context__: PanelsState }>;
  private _state: Readonly<UiState>;
  private host: ReactiveControllerHost & HTMLElement;
  private dispatchRef: UiDispatch;

  constructor(host: ReactiveControllerHost & HTMLElement, initialState: UiState) {
    this.host = host;
    this._state = freezeState(initialState);
    this.dispatchRef = (action) => this.reduce(action as UiAction);

    this.stateProvider = new ContextProvider(this.host, {
      context: UiStateContext,
      initialValue: this._state,
    });

    this.dispatchProvider = new ContextProvider(this.host, {
      context: UiDispatchContext,
      initialValue: this.dispatchRef,
    });

    this.combinedProvider = new ContextProvider(this.host, {
      context: UiCombinedContext,
      initialValue: { state: this._state, dispatch: this.dispatchRef },
    });

    this.panelStateProvider = new ContextProvider(this.host, {
      context: PanelStateContext,
      initialValue: this._state.panels,
    });
  }

  get state(): Readonly<UiState> {
    return this._state;
  }

  get dispatch(): UiDispatch {
    return this.dispatchRef;
  }

  setDispatch(dispatch: UiDispatch) {
    this.dispatchRef = dispatch;
    this.dispatchProvider.setValue(this.dispatchRef);
    this.combinedProvider.setValue({ state: this._state, dispatch: this.dispatchRef });
  }

  reduce(action: UiAction) {
    const nextState = freezeState(uiStateReducer(this._state, action));
    this._state = nextState;
    this.stateProvider.setValue(this._state);
    this.dispatchProvider.setValue(this.dispatchRef);
    this.combinedProvider.setValue({ state: this._state, dispatch: this.dispatchRef });
    this.panelStateProvider.setValue(this._state.panels);
    this.host.requestUpdate();
  }
}

function mergeLoadedPanels(current: PanelsState, data: { scope?: string; template?: string; styles?: string }): PanelsState {
  return {
    ...current,
    data: {
      ...current.data,
      scope: data.scope !== undefined ? { ...current.data.scope, jsonInput: data.scope, jsonError: '', parsedScope: {} } : current.data.scope,
      template: data.template !== undefined ? { ...current.data.template, templateInput: data.template } : current.data.template,
      styles: data.styles !== undefined ? { ...current.data.styles, stylesInput: data.styles } : current.data.styles,
    },
  };
}

function freezeState(state: UiState): Readonly<UiState> {
  return Object.freeze({
    ...state,
    panels: Object.freeze({
      data: Object.freeze({
        ...state.panels.data,
        scope: Object.freeze({ ...state.panels.data.scope }),
        template: Object.freeze({ ...state.panels.data.template }),
        styles: Object.freeze({ ...state.panels.data.styles }),
        preview: Object.freeze({ ...state.panels.data.preview }),
        export: Object.freeze({ ...state.panels.data.export }),
        'visual-editor': Object.freeze({
          ...state.panels.data['visual-editor'],
          visualBlockState: Object.freeze({
            ...state.panels.data['visual-editor'].visualBlockState,
            data: Object.freeze({ ...state.panels.data['visual-editor'].visualBlockState.data }),
          }),
        }),
      }),
      open: Object.freeze({ ...state.panels.open }),
      errors: Object.freeze({ ...state.panels.errors }),
    }),
    layout: Object.freeze({
        ...state.layout,
        dockLayouts: Object.freeze({ ...state.layout.dockLayouts }),
        expansion: Object.freeze({ ...state.layout.expansion }),
    }),
    modalController: Object.freeze({
        ...state.modalController,
        options: Object.freeze({ ...(state.modalController.options ?? {}) }),
    }),
    view: Object.freeze({
      ...state.view,
      viewOptions: Object.freeze({ ...(state.view.viewOptions ?? {}) }),
    }),
    ai: Object.freeze({ ...state.ai, systemInstructions: Object.freeze({ ...state.ai.systemInstructions }) }),
    project: Object.freeze({
      ...state.project,
      tags: Object.freeze([...(state.project.tags || [])]) as string[],
      projectsList: Object.freeze([...(state.project.projectsList || [])]) as CloudProjectMeta[],
      savedProjects: Object.freeze([...(state.project.savedProjects || [])]) as StoredProject[],
      library: Object.freeze({ ...state.project.library }),
    }),
    interaction: Object.freeze({
      ...state.interaction,
      visualGrid: Object.freeze({ ...state.interaction.visualGrid }),
      projection: Object.freeze({ ...state.interaction.projection }),
      modal: Object.freeze({ ...state.interaction.modal }),
    }),
    featureFlags: Object.freeze({ ...state.featureFlags }),
  });
}
