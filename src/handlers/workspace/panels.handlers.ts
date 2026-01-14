import type { UiDispatch, UiState, PanelId } from '../../core/state/ui-state.js';
import { DEFAULT_VISUAL_BLOCK_DATA, serializeVisualBlockData } from '../../core/state/visual-block-data.js';
import type { HandlerMessage } from '../../core/types/index.js';
import type { ViewRegistryEntry } from '../../core/registry/views';

interface PanelsHandlerHost {
  getState: () => UiState;
  dispatch: UiDispatch;
  requestRender: () => void;
  panelRegistry: ViewRegistryEntry[];
}

export function createPanelHandlers(host: PanelsHandlerHost) {
  const getPanelEntry = (panelId: PanelId) => host.panelRegistry.find((panel) => panel.id === panelId);

  const getPanelData = <T = unknown>(panelId: PanelId): T => host.getState().panels.data[panelId] as unknown as T;

  const updatePanelData = (panelId: PanelId, data: Record<string, unknown>) => {
    host.dispatch({ type: 'panel/update', panelId, data });
  };

  const isPanelEnabled = (panelId: PanelId) => {
    const entry = getPanelEntry(panelId);
    if (!entry) return false;
    if (entry.featureFlag) {
      return !!host.getState().featureFlags[entry.featureFlag];
    }
    return true;
  };

  const getPanelOpen = (panelId: PanelId) => host.getState().panels.open[panelId] && isPanelEnabled(panelId);

  const setPanelOpen = (panelId: PanelId, open: boolean) => {
    if (!isPanelEnabled(panelId)) return;
    host.dispatch({ type: 'panel/update', panelId, open });
  };

  const togglePanel = (panelId: PanelId) => setPanelOpen(panelId, !getPanelOpen(panelId));

  const handleJsonChange = (val: unknown) => {
    const jsonInput = typeof val === 'string' ? val : (val as CustomEvent)?.detail;
    updatePanelData('scope', { jsonInput });
    try {
      const parsedScope = JSON.parse(jsonInput || '{}');
      updatePanelData('scope', { parsedScope, jsonError: '' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      updatePanelData('scope', { jsonError: errorMessage });
    }
  };

  const handleScopeUpdate = (data: unknown) => {
    const parsedScope = (data as CustomEvent)?.detail || data;
    updatePanelData('scope', {
      parsedScope,
      jsonInput: JSON.stringify(parsedScope, null, 2),
      jsonError: '',
    });
  };

  const handleTemplateChange = (value: string) => {
    updatePanelData('template', { templateInput: value });
  };

  const handleStylesChange = (value: string) => {
    updatePanelData('styles', { stylesInput: value });
  };

  const setScopeMode = (mode: string) => {
    const scope = getPanelData<{ jsonError?: string }>('scope');
    if (mode === 'visual' && scope.jsonError) {
      alert('Cannot switch to Visual mode while JSON is invalid.');
      return;
    }
    host.dispatch({ type: 'panel/update', panelId: 'scope', data: { mode } });
  };

  const resetSession = () => {
    if (!confirm('Reset?')) return;
    host.dispatch({
      type: 'panel/update',
      panelId: 'scope',
      data: { jsonInput: '{}', parsedScope: {}, jsonError: '', mode: 'visual' },
    });
    host.dispatch({ type: 'panel/update', panelId: 'template', data: { templateInput: '' } });
    host.dispatch({ type: 'panel/update', panelId: 'styles', data: { stylesInput: '' } });
    host.dispatch({ type: 'panel/update', panelId: 'preview', data: { renderError: '', renderedHtml: '' } });
    host.dispatch({
      type: 'panel/update',
      panelId: 'visual-editor',
      data: {
        visualBlockState: {
          data: { ...DEFAULT_VISUAL_BLOCK_DATA },
          serializedData: serializeVisualBlockData(DEFAULT_VISUAL_BLOCK_DATA),
          renderOutput: '',
        },
      },
    });
    host.dispatch({ type: 'projects/setMeta', project: { id: '' } });
    handleJsonChange('{}');
  };

  const handleMessage = (message: HandlerMessage<unknown>) => {
    switch (message.type) {
      case 'panel/toggle': {
        const panelKey = (message.payload as { panelId?: string })?.panelId;
        if (!panelKey) return false;
        const panelId = panelKey.endsWith('Open') ? panelKey.replace('Open', '') : panelKey;
        togglePanel(panelId as PanelId);
        return true;
      }
      case 'scope/mode': {
        const mode = (message.payload as { mode?: string })?.mode;
        if (mode) setScopeMode(mode);
        return true;
      }
      case 'session/reset': {
        resetSession();
        return true;
      }
      default:
        return false;
    }
  };

  return {
    getPanelEntry,
    getPanelData,
    updatePanelData,
    isPanelEnabled,
    getPanelOpen,
    setPanelOpen,
    togglePanel,
    handleJsonChange,
    handleScopeUpdate,
    handleTemplateChange,
    handleStylesChange,
    setScopeMode,
    resetSession,
    handleMessage,
  };
}

export type PanelsHandlers = ReturnType<typeof createPanelHandlers>;
