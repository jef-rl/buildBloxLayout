import { emitPanelEvent } from './shared.js';

export function createEditorPanelHandlers(host: HTMLElement) {
  return {
    handleInput: (event: Event) =>
      emitPanelEvent(host, 'change', (event.target as HTMLTextAreaElement)?.value ?? ''),
    openAi: () => emitPanelEvent(host, 'open-ai'),
  };
}

export type EditorPanelHandlers = ReturnType<typeof createEditorPanelHandlers>;
