import type { UiEventDetail } from '../types/events';

type UiEventTarget = {
  dispatchEvent: (event: Event) => boolean;
};

export const dispatchUiEvent = <TPayload>(target: UiEventTarget, type: string, payload?: TPayload) => {
  const resolvedTarget =
    typeof window !== 'undefined' && target === window
      ? ((window.document?.querySelector('framework-root') as UiEventTarget | null) ?? target)
      : target;
  const detail: UiEventDetail = { type, payload };
  resolvedTarget.dispatchEvent(new CustomEvent('ui-event', { detail, bubbles: true, composed: true }));
};
