import type { HandlerMessage } from '../types/events';

type UiEventTarget = {
  dispatchEvent: (event: Event) => boolean;
};

export const dispatchUiEvent = <TPayload>(target: UiEventTarget, type: string, payload?: TPayload) => {
  const detail: HandlerMessage<TPayload | undefined> = { type, payload };
  target.dispatchEvent(new CustomEvent('ui-event', { detail, bubbles: true, composed: true }));
};
