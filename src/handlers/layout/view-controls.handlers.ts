import type { LitElement } from 'lit';
import type { HandlerMessage } from '../../core/types/index.js';
import { dispatchUiEvent } from '../../shared/utils/dispatch-ui-event';

type ViewControlsLike = LitElement;

export function createViewControlsHandlers(component: ViewControlsLike) {
  const stopClickPropagation = (event: Event) => event.stopPropagation();

  const togglePanel = (viewId: string, panelId?: string) => {
    const resolvedPanelId = panelId ?? viewId;
    const message: HandlerMessage<{ panelId: string }> = {
      type: 'panel/toggle',
      payload: { panelId: resolvedPanelId },
    };
    dispatchUiEvent(component, message.type, message.payload);
  };

  const setScopeMode = (mode: string) => {
    const message: HandlerMessage<{ panelId: string; data: { mode: string } }> = {
      type: 'panel/update',
      payload: { panelId: 'scope', data: { mode } },
    };
    dispatchUiEvent(component, message.type, message.payload);
  };

  const resetSession = () => {
    const message: HandlerMessage<null> = { type: 'session/reset', payload: null };
    dispatchUiEvent(component, message.type, message.payload);
  };

  return {
    stopClickPropagation,
    togglePanel,
    setScopeMode,
    resetSession,
  };
}
