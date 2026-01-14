import type { HandlerMessage } from '../../core/types/index.js';

type PanelEventTarget = {
  dispatchEvent: (event: Event) => boolean;
};

const emitPanelEvent = <TPayload>(host: PanelEventTarget, name: string, payload?: TPayload) => {
  const detail: HandlerMessage<TPayload | undefined> = { type: name, payload };
  host.dispatchEvent(new CustomEvent<HandlerMessage<TPayload | undefined>>(name, { detail, bubbles: true, composed: true }));
};

export { emitPanelEvent };
