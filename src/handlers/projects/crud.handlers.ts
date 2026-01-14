import { html } from 'lit';
import type { UiDispatch, UiState } from '../../core/state/ui-state.js';
import type { ProjectsApi } from '../../core/services/projects-api.js';
import { listLocalProjects, loadLocalProject, deleteLocalProject } from '../../core/services/local-projects.js';
import type { HandlerMessage, ViewId } from '../../core/types/index.js';
import type { AiHandlers } from '../ai/gemini.handlers.js';
import type { PanelsHandlers } from '../workspace/panels.handlers.js';
import { createProjectImportHandlers } from './import.handlers.js';
import { createProjectModalHandlers } from './modal.handlers.js';

export interface ProjectsHandlerHost {
  getState: () => UiState;
  dispatch: UiDispatch;
  api: ProjectsApi;
  aiHandlers: AiHandlers;
  panelHandlers: PanelsHandlers;
  viewRegistry: { id: string; panelId?: string }[];
}

export function createProjectHandlers(host: ProjectsHandlerHost) {
  const importHandlers = createProjectImportHandlers({
    getState: host.getState,
    dispatch: host.dispatch,
    panelHandlers: host.panelHandlers,
  });

  const loadProjectData = (data: { scope?: string; template?: string; styles?: string }) => {
    if (data.scope !== undefined) host.dispatch({ type: 'panel/update', panelId: 'scope', data: { jsonInput: data.scope } });
    if (data.template !== undefined)
      host.dispatch({ type: 'panel/update', panelId: 'template', data: { templateInput: data.template } });
    if (data.styles !== undefined) host.dispatch({ type: 'panel/update', panelId: 'styles', data: { stylesInput: data.styles } });
    host.panelHandlers.handleJsonChange(host.getState().panels.data.scope.jsonInput || '{}');
  };

  const saveProject = async () => {
    const state = host.getState();
    host.dispatch({ type: 'projects/save/start' });
    const project = {
      id: state.project.id,
      name: state.project.name,
      tags: state.project.tags,
      scope: state.panels.data.scope.jsonInput,
      template: state.panels.data.template.templateInput,
      styles: state.panels.data.styles.stylesInput,
    };
    try {
      const result = await host.api.save(project);
      host.dispatch({
        type: 'projects/save/success',
        project: {
          id: result.id || state.project.id,
          name: result.name || state.project.name,
          tags: result.tags || state.project.tags,
        },
      });
      host.dispatch({ type: 'view/close' });
      alert(`Project saved! ID: ${result.id || state.project.id}`);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      host.dispatch({ type: 'projects/save/error', error: errorMessage });
      alert(`Save Failed: ${errorMessage}`);
    }
  };

  const loadProject = async (id: string) => {
    host.dispatch({ type: 'projects/load/start', projectId: id });
    try {
      const project = await host.api.get(id);
      host.dispatch({ type: 'projects/load/success', project: { id: project.id, name: project.name, tags: project.tags || [] } });
      loadProjectData(project);
      host.dispatch({ type: 'view/close' });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      host.dispatch({ type: 'projects/load/error', error: errorMessage });
      alert(`Load Failed: ${errorMessage}`);
    }
  };

  const deleteProject = async (id: string, event?: Event) => {
    if (event?.stopPropagation) event.stopPropagation();
    if (!confirm(`Delete project ${id}?`)) return;
    try {
      host.dispatch({ type: 'projects/delete/start', projectId: id });
      await host.api.delete(id);
      host.dispatch({ type: 'projects/delete/success', projectId: id });
      await fetchProjectList();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      host.dispatch({ type: 'projects/delete/error', error: errorMessage });
      alert(`Delete Failed: ${errorMessage}`);
    }
  };

  const loadLocalProjectEntry = (name: string, close?: () => void) => {
    host.dispatch({ type: 'projects/load/start', projectId: name });
    const project = loadLocalProject(name);
    if (project) {
      host.dispatch({ type: 'projects/local/load', savedProjects: listLocalProjects() });
      host.dispatch({ type: 'projects/load/success', project: { id: '', name: project.name || name, tags: project.tags || [] } });
      loadProjectData(project);
      if (typeof close === 'function') close();
    } else {
      host.dispatch({ type: 'projects/load/error', error: 'Local project not found' });
    }
  };

  const deleteLocalProjectEntry = (name: string, event?: Event) => {
    if (event?.stopPropagation) event.stopPropagation();
    deleteLocalProject(name);
    host.dispatch({ type: 'projects/local/delete', savedProjects: listLocalProjects() });
  };

  const triggerFileInput = () => importHandlers.triggerFileInput();
  const handleFileLoad = (event: Event) => importHandlers.handleFileInputChange(event);
  const downloadCurrentProject = () => importHandlers.downloadCurrentProject();

  const modalHandlers = createProjectModalHandlers({
    host,
    saveProject: () => saveProject(),
    loadProject: (id: string) => loadProject(id),
    deleteProject: (id: string, event?: Event) => deleteProject(id, event),
    loadLocalProjectEntry: (name: string, close?: () => void) => loadLocalProjectEntry(name, close),
    deleteLocalProjectEntry: (name: string, event?: Event) => deleteLocalProjectEntry(name, event),
    importHandlers,
  });

  const renderSaveView = (close: () => void) => html`
    <project-save-modal
      @ui-event="${(event: CustomEvent<HandlerMessage<{ project?: { name?: string; tags?: string[] } }>>) => {
        const message = event.detail;
        if (!message || typeof message !== 'object') return;
        if (message.type === 'projects/save/start') {
          event.stopPropagation();
          void modalHandlers.handleRequestSave(close);
        }
      }}"
    ></project-save-modal>
  `;

  const renderLibraryView = (
    open: (key: ViewId, config?: Record<string, unknown>) => void,
    close: () => void,
  ) => html`
    <project-library-modal
      @ui-event="${(event: CustomEvent<HandlerMessage<{ mode?: 'file' | 'paste'; backTo?: ViewId; viewId?: ViewId; options?: Record<string, unknown>; id?: string; source?: 'cloud' | 'local'; event?: Event }>>) => {
        event.stopPropagation();
        const message = event.detail;
        if (!message || typeof message !== 'object') return;
        if (message.type === 'view/open' || message.type === 'file/load') {
          const payload = message.payload ?? {};
          const typedPayload = payload as { mode?: 'file' | 'paste'; backTo?: ViewId; viewId?: ViewId; options?: Record<string, unknown> };
          const mode = typedPayload.mode ?? (typedPayload.viewId === 'import-paste' ? 'paste' : undefined);
          const backTo = typedPayload.backTo ?? (typedPayload.options?.backTo as ViewId | undefined);
          modalHandlers.handleImportIntent({ mode, backTo }, open);
          return;
        }
        if (message.type === 'projects/load/start') {
          const payload = message.payload as { id?: string; source?: 'cloud' | 'local' };
          if (!payload?.id) return;
          modalHandlers.handleRequestLoad({ id: payload.id, source: payload.source, close });
          return;
        }
        if (message.type === 'projects/delete/start') {
          const payload = message.payload as { id?: string; source?: 'cloud' | 'local'; event?: Event };
          if (!payload?.id) return;
          modalHandlers.handleRequestDelete(payload);
        }
      }}"
    ></project-library-modal>
  `;

  const renderPasteView = () => html`
    <paste-modal
      @ui-event="${(event: CustomEvent<HandlerMessage<{ content?: string }>>) => {
        event.stopPropagation();
        const message = event.detail;
        if (!message || typeof message !== 'object') return;
        if (message.type === 'paste/load') {
          const payload = message.payload as { content?: string } | undefined;
          modalHandlers.handleRequestImport(payload ?? {});
          return;
        }
        if (message.type === 'export/copy-trigger') {
          importHandlers.downloadCurrentProject();
        }
      }}"
    ></paste-modal>
  `;

  const fetchProjectList = async () => {
    host.dispatch({ type: 'projects/library/fetch/start' });
    try {
      const projectsList = await host.api.list();
      host.dispatch({ type: 'projects/library/fetch/success', projectsList });
    } catch (e) {
      console.error(e);
      host.dispatch({ type: 'projects/library/fetch/error', error: 'Failed to load cloud project list.' });
      alert('Failed to load cloud project list.');
    }
  };

  const downloadGeneratedCode = () => {
    host.dispatch({ type: 'export/copy-trigger', timestamp: Date.now() });
  };

  const handleToggleRequest = (detail: unknown) => {
    const message = detail as HandlerMessage<{ viewId?: string; panelId?: string }>;
    const payload = message && typeof message === 'object' && 'type' in message && 'payload' in message ? message.payload : detail;
    const viewId = typeof payload === 'object' ? (payload as { viewId?: string }).viewId : undefined;
    const panelKey = typeof payload === 'object' ? (payload as { panelId?: string }).panelId : payload;
    const panelId = typeof panelKey === 'string' && panelKey.endsWith('Open') ? panelKey.replace('Open', '') : panelKey;
    const registryEntry = host.viewRegistry.find((entry) => entry.id === viewId || entry.id === panelId || entry.panelId === panelId);
    if (registryEntry?.panelId) host.panelHandlers.togglePanel(registryEntry.panelId as any);
  };

  return {
    renderSaveView,
    renderLibraryView,
    renderPasteView,
    fetchProjectList,
    saveProject,
    loadProject,
    deleteProject,
    loadLocalProjectEntry,
    deleteLocalProjectEntry,
    loadProjectData,
    downloadCurrentProject,
    triggerFileInput,
    handleFileLoad,
    downloadGeneratedCode,
    handleToggleRequest,
  };
}

export type ProjectsHandlers = ReturnType<typeof createProjectHandlers>;
