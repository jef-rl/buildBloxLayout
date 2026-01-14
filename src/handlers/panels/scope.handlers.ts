import { emitPanelEvent } from './shared.js';

export function createScopePanelHandlers(host: HTMLElement) {
  const emitSetMode = (mode: 'visual' | 'text') => emitPanelEvent(host, 'set-mode', mode);

  return {
    setTextMode: () => emitSetMode('text'),
    setVisualMode: () => emitSetMode('visual'),
    openAi: () => emitPanelEvent(host, 'open-ai'),
    handleJsonInput: (event: Event) =>
      emitPanelEvent(host, 'json-change', (event.target as HTMLTextAreaElement)?.value ?? ''),
    handleScopeUpdate: (event: CustomEvent) =>
      emitPanelEvent(host, 'scope-update', event?.detail ?? event),
  };
}

export type ScopePanelHandlers = ReturnType<typeof createScopePanelHandlers>;
