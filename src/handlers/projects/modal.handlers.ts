import type { ViewId } from '../../core/types/index.js';
import type { ProjectsHandlerHost } from './crud.handlers.js';
import type { ProjectImportHandlers } from './import.handlers.js';

type ProjectSource = 'cloud' | 'local';

interface ProjectModalHandlerDeps {
  host: ProjectsHandlerHost;
  saveProject: () => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  deleteProject: (id: string, event?: Event) => Promise<void>;
  loadLocalProjectEntry: (name: string, close?: () => void) => void;
  deleteLocalProjectEntry: (name: string, event?: Event) => void;
  importHandlers: ProjectImportHandlers;
}

export function createProjectModalHandlers({
  host,
  saveProject,
  loadProject,
  deleteProject,
  loadLocalProjectEntry,
  deleteLocalProjectEntry,
  importHandlers,
}: ProjectModalHandlerDeps) {
  const asDetail = <T>(payload: CustomEvent<T> | T) => (payload instanceof CustomEvent ? payload.detail : payload);

  const parseTags = (value: string | string[]) => {
    if (Array.isArray(value)) return value;
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  };

  const handleNameChange = (payload: CustomEvent<string> | string) => {
    const name = asDetail(payload);
    host.dispatch({ type: 'projects/setMeta', project: { name: typeof name === 'string' ? name : '' } });
  };

  const handleTagsChange = (payload: CustomEvent<string | string[]> | string | string[]) => {
    const tags = parseTags(asDetail(payload) ?? '');
    host.dispatch({ type: 'projects/setMeta', project: { tags } });
  };

  const handleRequestSave = async (close?: () => void) => {
    await saveProject();
    close?.();
  };

  const handleRequestLoad = (detail: { id: string; source?: ProjectSource; close?: () => void }) => {
    if (!detail?.id) return;
    if (detail.source === 'local') {
      loadLocalProjectEntry(detail.id, detail.close);
    } else {
      void loadProject(detail.id);
    }
  };

  const handleRequestDelete = (detail: { id: string; source?: ProjectSource; event?: Event }) => {
    if (!detail?.id) return;
    if (detail.source === 'local') {
      deleteLocalProjectEntry(detail.id, detail.event);
    } else {
      void deleteProject(detail.id, detail.event);
    }
  };

  const handleRequestImport = (detail: { content?: string }) => {
    if (typeof detail?.content !== 'string') return;
    importHandlers.handlePasteImport(detail.content);
  };

  const handleImportIntent = (
    detail: { mode?: 'file' | 'paste'; backTo?: ViewId },
    open: (key: ViewId, config?: Record<string, unknown>) => void,
  ) => {
    if (detail?.mode === 'file') {
      importHandlers.triggerFileInput();
      return;
    }
    open('import-paste', { options: { backTo: detail?.backTo ?? 'open-library' } });
  };

  return {
    handleNameChange,
    handleTagsChange,
    handleRequestSave,
    handleRequestLoad,
    handleRequestDelete,
    handleRequestImport,
    handleImportIntent,
  };
}

export type ProjectModalHandlers = ReturnType<typeof createProjectModalHandlers>;
