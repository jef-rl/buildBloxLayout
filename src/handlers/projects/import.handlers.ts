import type { UiDispatch, UiState } from '../../core/state/ui-state.js';
import type { PanelsHandlers } from '../workspace/panels.handlers.js';

interface ProjectImportHost {
  getState: () => UiState;
  dispatch: UiDispatch;
  panelHandlers: PanelsHandlers;
}

type LoadActionType = 'file/load' | 'paste/load';

const parseProjectJson = (raw: string) => {
  const trimmed = (raw || '').trim();
  if (!trimmed) throw new Error('Project content is empty.');

  const parsed = JSON.parse(trimmed);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Project JSON must be an object.');
  }

  return parsed as { scope?: string; template?: string; styles?: string };
};

export function createProjectImportHandlers(host: ProjectImportHost) {
  const applyImportedProject = (data: { scope?: string; template?: string; styles?: string }, action: LoadActionType) => {
    const scopeInput = data.scope ?? host.getState().panels.data.scope.jsonInput;
    host.dispatch({ type: action, data });
    host.panelHandlers.handleJsonChange(scopeInput || '{}');
  };

  const handlePasteImport = (raw: string) => {
    try {
      const data = parseProjectJson(raw);
      applyImportedProject(data, 'paste/load');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid project content.';
      alert(errorMessage);
    }
  };

  const handleFileImport = async (file?: File | null) => {
    if (!file) return;
    try {
      const data = parseProjectJson(await file.text());
      applyImportedProject(data, 'file/load');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Load failed';
      alert(errorMessage);
    }
  };

  const handleFileInputChange = async (event: Event) => {
    const target = event.target as HTMLInputElement | null;
    const file = target?.files?.[0];
    await handleFileImport(file);
    if (target) target.value = '';
  };

  const downloadCurrentProject = () => {
    const state = host.getState();
    const data = {
      scope: state.panels.data.scope.jsonInput,
      template: state.panels.data.template.templateInput,
      styles: state.panels.data.styles.stylesInput,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.project.name || 'project'}.json`;
    a.click();
  };

  const triggerFileInput = () => {
    const input = document.querySelector<HTMLInputElement>('#fileInput');
    input?.click();
  };

  return {
    handlePasteImport,
    handleFileImport,
    handleFileInputChange,
    downloadCurrentProject,
    triggerFileInput,
  };
}

export type ProjectImportHandlers = ReturnType<typeof createProjectImportHandlers>;
