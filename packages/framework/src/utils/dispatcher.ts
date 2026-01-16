import type { UiEventDetail } from '../types/events';

type UiEventTarget = {
  dispatchEvent: (event: Event) => boolean;
};

export const dispatchUiEvent = <TPayload>(target: UiEventTarget, type: string, payload?: TPayload) => {
  const detail: UiEventDetail = { type, payload };
  target.dispatchEvent(new CustomEvent('ui-event', { detail, bubbles: true, composed: true }));
};
