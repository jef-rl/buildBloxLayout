import type { HandlerMessage } from '../../core/types/index.js';
import type { PanelsHandlers } from './panels.handlers.js';
import type { ProjectsHandlers } from '../projects/crud.handlers.js';
import type { UiContextHandlers } from '../state/ui-context.handlers.js';
import type { UiDispatch } from '../../core/state/ui-state.js';

interface WorkspaceUiEventHandlersHost {
  panelHandlers: PanelsHandlers;
  projectHandlers: ProjectsHandlers;
  stateHandlers: UiContextHandlers;
}

interface WorkspaceViewHandlersHost {
  dispatch: UiDispatch;
}

const normalizeMessage = (
  detail: HandlerMessage | { type?: string; payload?: unknown } | null | undefined,
): HandlerMessage | null => {
  if (!detail || typeof detail !== 'object' || typeof detail.type !== 'string') return null;
  const payload = 'payload' in detail ? detail.payload : undefined;
  return { type: detail.type, payload } as HandlerMessage;
};

export function createWorkspaceUiEventHandlers(host: WorkspaceUiEventHandlersHost) {
  const handlersByType: Record<string, (message: HandlerMessage) => void> = {
    'view/open': (message) => {
      const viewId = (message.payload as { viewId?: string } | undefined)?.viewId;
      if (viewId === 'open-library') {
        void host.projectHandlers.fetchProjectList();
      }
      host.stateHandlers.dispatchMessage(message);
    },
  };

  const routeMessage = (detail: HandlerMessage | { type?: string; payload?: unknown }) => {
    const message = normalizeMessage(detail);
    if (!message) return;
    if (host.panelHandlers.handleMessage(message)) return;
    const handler = handlersByType[message.type];
    if (handler) {
      handler(message);
      return;
    }
    host.stateHandlers.dispatchMessage(message);
  };

  return {
    handlersByType,
    routeMessage,
  };
}

export function createWorkspaceViewHandlers(host: WorkspaceViewHandlersHost) {
  const openView = (viewId: string, config: { payload?: unknown; options?: Record<string, unknown> } = {}) => {
    host.dispatch({ type: 'view/open', viewId, payload: config.payload, options: config.options });
  };

  const closeView = () => {
    host.dispatch({ type: 'view/close' });
    host.dispatch({ type: 'ai/open', panelId: '', prompt: '' });
  };

  return {
    openView,
    closeView,
  };
}
