import type { LitElement } from 'lit';
import type { HandlerMessage } from '../../core/types/index.js';
import { dispatchUiEvent } from '../../shared/utils/dispatch-ui-event';

type SizeControlsLike = LitElement;

export function createSizeControlsHandlers(component: SizeControlsLike) {
  const stopClickPropagation = (event: Event) => event.stopPropagation();

  const setViewport = (mode: string) => {
    const message: HandlerMessage<{ mode: string }> = { type: 'layout/setViewport', payload: { mode } };
    dispatchUiEvent(component, message.type, message.payload);
  };

  return {
    stopClickPropagation,
    setViewport,
  };
}
